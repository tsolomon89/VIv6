
import { EventEmitter } from 'events';

// Tyed Event Map for IntelliSense
export interface SystemEvents {
  'record.created': (entityId: string) => void;
  'record.updated': (entityId: string) => void;
  'record.deleted': (entityId: string) => void;
  'template.updated': (templateKey: string) => void;
  'build.queued': (entityId: string) => void;
  'build.complete': (entityId: string, success: boolean) => void;
}

class TypedEmitter extends EventEmitter {
  emit<K extends keyof SystemEvents>(event: K, ...args: Parameters<SystemEvents[K]>): boolean {
    return super.emit(event, ...args);
  }

  on<K extends keyof SystemEvents>(event: K, listener: SystemEvents[K]): this {
    return super.on(event, listener);
  }
}

export const events = new TypedEmitter();
