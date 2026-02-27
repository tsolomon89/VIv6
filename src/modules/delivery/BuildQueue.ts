
import { events } from '../../core/events.js';
import { derivePage } from './compiler.js';
import { db } from '../../core/db.js';
import { createHash } from 'crypto';
import { staticWriter } from './StaticWriter.js';

interface QueueItem {
  entityId: string;
  timestamp: number;
}

export class BuildQueue {
  private queue: Map<string, number> = new Map(); // EntityId -> Timestamp
  private isBuilding: boolean = false;
  private debounceMs: number = 1000;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    console.log('[BuildQueue] Initialized');
  }

  public enqueue(entityId: string) {
    // 1. Update timestamp for this entity (Debounce reset)
    this.queue.set(entityId, Date.now());
    console.log(`[BuildQueue] Enqueued: ${entityId}`);
    events.emit('build.queued', entityId);

    // 2. Schedule processing
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => this.processQueue(), this.debounceMs);
  }

  private async processQueue() {
    if (this.isBuilding) return; // Wait for current build to finish
    if (this.queue.size === 0) return;

    this.isBuilding = true;

    try {
      // 3. FIFO / Batch processing
      // We process one at a time for safety
      const [entityId] = this.queue.keys(); // Get first item
      this.queue.delete(entityId); // Remove from queue

      console.log(`[BuildQueue] Starting build for: ${entityId}`);
      await this.buildEntity(entityId);
      
    } catch (err) {
      console.error('[BuildQueue] Error processing queue', err);
    } finally {
      this.isBuilding = false;
      // 4. Recurse if items remain
      if (this.queue.size > 0) {
        this.processQueue();
      }
    }
  }

  /**
   * The actual build logic (moved from api/build.ts)
   */
  private async buildEntity(entityId: string) {
    try {
        // A. Get Entity Slug
        const entity = db.prepare('SELECT slug, type FROM records WHERE id = ?').get(entityId) as { slug: string, type: string };
        if (!entity) {
            console.error(`[BuildBuilder] Entity ${entityId} not found`);
            return;
        }

        // B. Mark Pending
        this.updateStatus(entityId, 'pending');

        // C. Derive
        const derived = derivePage(entity.slug);
        
        if (!derived) {
             this.updateStatus(entityId, 'error', 'No derivation output');
             return;
        }

        // D. Hash & Success
        const contentHash = createHash('md5').update(JSON.stringify(derived)).digest('hex');
        this.updateStatus(entityId, 'success', null, contentHash);
        
        // E. Write Static Output
        await staticWriter.writeEntity(entity.slug, derived);
        
        events.emit('build.complete', entityId, true);
        console.log(`[BuildQueue] Build Success: ${entity.slug}`);
        
    } catch (err: any) {
        console.error(`[BuildQueue] Build Failed for ${entityId}`, err);
        this.updateStatus(entityId, 'error', err.message);
        events.emit('build.complete', entityId, false);
    }
  }

  private updateStatus(entityId: string, status: string, error: string | null = null, hash: string = '') {
      const now = new Date().toISOString();
      if (status === 'pending') {
          db.prepare(`
            INSERT INTO build_state (record_id, content_hash, status, last_built_at)
            VALUES (?, '', 'pending', ?)
            ON CONFLICT(record_id) DO UPDATE SET status = 'pending', last_built_at = excluded.last_built_at
          `).run(entityId, now);
      } else if (status === 'success') {
          db.prepare(`
            UPDATE build_state SET status = 'success', content_hash = ?, error = NULL, last_built_at = ? WHERE record_id = ?
          `).run(hash, now, entityId);
      } else {
          db.prepare(`
            UPDATE build_state SET status = 'error', error = ? WHERE record_id = ?
          `).run(error, entityId);
      }
  }
}

export const buildQueue = new BuildQueue();
