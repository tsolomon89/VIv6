
export type EditorEventType = 
  | 'select' 
  | 'hover' 
  | 'update-content' 
  | 'set-theme' 
  | 'handshake'
  | 'handshake-ack';

export interface EditorMessage<T = any> {
  type: EditorEventType;
  payload: T;
  source: 'editor' | 'canvas';
}

type MessageHandler<T = any> = (payload: T) => void;

export class ClientBridge {
  private handlers: Map<EditorEventType, Set<MessageHandler>> = new Map();
  private targetWindow: Window | null = null;
  private source: 'canvas' = 'canvas';

  constructor() {
    this.targetWindow = window.parent; // Editor is always parent
    
    // Bind listener
    window.addEventListener('message', this.handleMessage);

    // Initialize DOM Listeners
    this.setupDomListeners();
  }

  private setupDomListeners() {
      document.addEventListener('mouseover', (e) => {
          const target = (e.target as HTMLElement).closest('[data-binding]');
          if (target) {
              const id = target.getAttribute('data-binding');
              // Extract Section ID if possible (binding usually "section.id")
              // For now, assume id is the Section ID or Component ID
              if (id) this.send('hover', id);
          } else {
              this.send('hover', null);
          }
      });

      document.addEventListener('click', (e) => {
          const target = (e.target as HTMLElement).closest('[data-binding]');
          if (target) {
              e.preventDefault(); // Prevent navigation
              e.stopPropagation();
              const id = target.getAttribute('data-binding');
              if (id) {
                  console.log('[ThemeBridge] Clicked:', id);
                  this.send('select', id);
              }
          }
      });
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
    return () => {
      this.handlers.get(type)?.delete(handler);
    };
  }

  public send<T = any>(type: EditorEventType, payload: T) {
    if (!this.targetWindow) return;

    const message: EditorMessage<T> = {
      type,
      payload,
      source: this.source
    };

    try {
      this.targetWindow.postMessage(message, '*'); 
    } catch (err) {
      console.error(`[Bridge:${this.source}] Failed to post message`, err);
    }
  }

  private handleMessage = (event: MessageEvent) => {
    const data = event.data as EditorMessage;
    if (!data || !data.type || !data.source) return;
    if (data.source === this.source) return;

    const handlers = this.handlers.get(data.type);
    if (handlers) {
      handlers.forEach(fn => fn(data.payload));
    }
  };
}
