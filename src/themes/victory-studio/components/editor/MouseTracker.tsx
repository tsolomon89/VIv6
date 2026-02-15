import { useEffect } from 'react';

type EditorEventType = 'select' | 'hover' | 'handshake';

interface EditorMessage<T = any> {
  type: EditorEventType;
  payload: T;
  source: 'editor' | 'canvas';
}

export function MouseTracker() {
  useEffect(() => {
    // Only run if we are inside an iframe
    if (window.self === window.top) return;

    const sendMessage = <T,>(type: EditorEventType, payload: T) => {
        const message: EditorMessage<T> = {
            type,
            payload,
            source: 'canvas'
        };
        window.parent.postMessage(message, '*');
    };

    const handleMouseOver = (e: MouseEvent) => {
      e.stopPropagation();
      const target = e.target as HTMLElement;
      // Traverse up to find a data-component-id
      const element = target.closest('[data-component-id]');
      
      if (element) {
        const id = element.getAttribute('data-component-id');
        sendMessage('hover', id);
        
        // Optional: Local highlight debugging
        // (element as HTMLElement).style.outline = '1px solid cyan';
        // setTimeout(() => (element as HTMLElement).style.outline = '', 500);
      } else {
        sendMessage('hover', null);
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target.closest('[data-component-id]');
      
      if (element) {
        e.preventDefault();
        e.stopPropagation();
        const id = element.getAttribute('data-component-id');
        sendMessage('select', id);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('click', handleClick);

    // Announce readiness
    sendMessage('handshake', { status: 'ready' });

    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  return null;
}
