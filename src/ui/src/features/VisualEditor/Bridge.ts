export type EditorEventType = 
  | 'select' 
  | 'hover' 
  | 'update-content' 
  | 'set-theme' 
  | 'handshake'
  | 'handshake-ack'
  | 'VI_UPDATE_CONFIG';

export interface EditorMessage<T = any> {
  type: EditorEventType;
  payload: T;
  source: 'editor' | 'canvas';
}

type MessageHandler<T = any> = (payload: T) => void;

export class Bridge {
  private handlers: Map<EditorEventType, Set<MessageHandler>> = new Map();
  private targetWindow: Window | null = null;
  private source: 'editor' | 'canvas';

  constructor(role: 'editor' | 'canvas', targetWindow?: Window) {
    this.source = role;
    this.targetWindow = targetWindow || null;
    
    // Bind listener
    window.addEventListener('message', this.handleMessage);
  }

  public setTarget(target: Window) {
    this.targetWindow = target;
  }

  public destroy() {
    window.removeEventListener('message', this.handleMessage);
    this.handlers.clear();
  }

  public on<T = any>(type: EditorEventType, handler: MessageHandler<T>) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)?.add(handler);

    // Return unbind function
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  public send<T = any>(type: EditorEventType, payload: T) {
    if (!this.targetWindow) {
      console.warn(`[Bridge:${this.source}] Cannot send message, no target window set.`);
      return;
    }

    const message: EditorMessage<T> = {
      type,
      payload,
      source: this.source
    };

    try {
      this.targetWindow.postMessage(message, '*'); // In production, lock this down to specific origins
    } catch (err) {
      console.error(`[Bridge:${this.source}] Failed to post message`, err);
    }
  }

  private handleMessage = (event: MessageEvent) => {
    const data = event.data as EditorMessage;
    
    // Basic validation
    if (!data || !data.type || !data.source) return;
    
    // Avoid self-talk (though unlikely with window separation)
    if (data.source === this.source) return;

    const handlers = this.handlers.get(data.type);
    if (handlers) {
      handlers.forEach(fn => fn(data.payload));
    }
  };
}
