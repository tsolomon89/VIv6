import { randomUUID } from 'crypto';
import { db } from '../core/db.js';
import { listEntities } from '../modules/content/services.js'; // Assuming we use listEntities to find actors

export interface SimOptions {
  accountId: string;
  days: number;
  verbose?: boolean;
}

export interface Activity {
  id: string;
  account_id: string;
  actor_id: string;
  type: 'email' | 'meeting' | 'call' | 'view_page' | 'conversion';
  timestamp: string;
  metadata: Record<string, any>;
}

export class SimulatorService {
  private accountId: string;
  private gameTime: Date;

  constructor(accountId: string) {
    this.accountId = accountId;
    this.gameTime = new Date();
  }

  /**
   * Run the simulation for X days relative to NOW.
   * Can also be used to backfill (start in past).
   * For simplicity here, we simulate "future" or "hypothetical" events starting from now.
   */
  async optimize_monte_carlo(days: number, verbose: boolean = false) {
    if (verbose) console.log(`Starting simulation for Account: ${this.accountId} for ${days} days...`);

    // 1. Fetch Agents (Personas) in this account
    // In a real Sim, we might generate synthetic agents first.
    // Here we use existing entities typed as 'persona'.
    const agents = listEntities('persona', this.accountId);
    
    if (agents.length === 0) {
      if (verbose) console.warn('No personas found in account. Simulation needs actors.');
      return;
    }

    let totalActivities = 0;

    for (let d = 0; d < days; d++) {
      // Advance day
      this.gameTime.setDate(this.gameTime.getDate() + 1);
      if (verbose) console.log(`[Day ${d+1}] ${this.gameTime.toISOString().split('T')[0]}`);

      // Iterate Agents
      for (const agent of agents) {
        // Roll dice for activity
        const action = this.decideAction(agent);
        if (action) {
          this.recordActivity(agent.id, action);
          totalActivities++;
        }
      }
    }

    if (verbose) console.log(`Simulation complete. Generated ${totalActivities} activities.`);
  }

  private decideAction(agent: any): 'email' | 'meeting' | 'call' | 'view_page' | null {
    // Basic probability model (Placeholder for "Business Physics")
    const roll = Math.random();
    
    if (roll < 0.1) return 'view_page'; // 10% chance to view a page
    if (roll < 0.15) return 'email';    // 5% chance to email
    if (roll < 0.16) return 'call';     // 1% chance to call
    if (roll < 0.165) return 'meeting'; // 0.5% chance to meet
    
    return null; // Most of the time, do nothing
  }

  private recordActivity(actorId: string, type: 'email' | 'meeting' | 'call' | 'view_page' | 'conversion') {
    const activity: Activity = {
      id: randomUUID(),
      account_id: this.accountId,
      actor_id: actorId,
      type: type,
      timestamp: this.gameTime.toISOString(),
      metadata: { source: 'simulator' }
    };

    // We assume an 'activities' table exists. 
    // IF NOT, we should create it or check schema.
    // For this implementation step, let's assume standard definitions.
    // If table missing, we might need to migrate.
    
    try {
        const stmt = db.prepare(`
            INSERT INTO activities (id, account_id, actor_id, type, timestamp, metadata)
            VALUES (@id, @account_id, @actor_id, @type, @timestamp, @metadata)
        `);
        
        stmt.run({
            ...activity,
            metadata: JSON.stringify(activity.metadata)
        });
    } catch (err: any) {
        // Checking for "no such table: activities"
        if (err.message.includes('no such table')) {
             console.error("Simulation failed: 'activities' table missing. Please run schema migration.");
             throw err; 
        }
    }
  }
}

export async function runSimulation(accountId: string, days: number) {
    const sim = new SimulatorService(accountId);
    await sim.optimize_monte_carlo(days, true);
}
