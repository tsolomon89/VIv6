import { useEffect } from 'react';
import { Bridge } from './Bridge';

export function MouseTracker() {
  useEffect(() => {
    // We need a bridge instance here, but creating a new one might be tricky 
    // without a shared context or singleton. 
    // In our architecture, the 'Canvas' component (Editor side) initiates the handshake.
    // The rendered page (Canvas side) needs to listen for that or just emit events.
    
    // For now, let's assume this component is mounted INSIDE the rendered page.
    // We'll create a 'canvas' role bridge.
    const bridge = new Bridge('canvas', window.parent);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // We only care about elements with data-component-id
      // OR we can start simpler and just send everything, let editor decide.
      // Ideally, we have data attributes.
      const id = target.getAttribute('data-component-id') || target.id;
      
      if (id) {
        e.stopPropagation();
        bridge.send('hover', id);
        
        // Optional: Highlight locally for immediate feedback? 
        // No, let's keep logic in Editor Overlay.
      }
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const id = target.getAttribute('data-component-id') || target.id;
      
      if (id) {
        e.preventDefault(); // Prevent link navigation during editing
        e.stopPropagation();
        bridge.send('select', id);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);
    window.addEventListener('click', handleClick);

    // Announce we are ready
    bridge.send('handshake', { status: 'ready' });

    return () => {
      window.removeEventListener('mouseover', handleMouseOver);
      window.removeEventListener('click', handleClick);
      bridge.destroy();
    };
  }, []);

  return null; // Headless component
}
