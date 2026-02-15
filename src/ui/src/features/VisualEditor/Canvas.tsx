import { useEffect, useRef, useState } from 'react';
import { Bridge } from './Bridge';
import { useEditorStore } from './SelectionManager';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { VIEWPORTS } from '../../config/viewports';

// ... imports

interface CanvasProps {
  url: string;
  onBridgeReady?: (bridge: Bridge) => void;
}

export function Canvas({ url, onBridgeReady }: CanvasProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [bridge, setBridge] = useState<Bridge | null>(null);
  const { viewport, setViewport, select, hover } = useEditorStore();

  useEffect(() => {
    // Initialize Bridge for the Editor side
    const editorBridge = new Bridge('editor');
    setBridge(editorBridge);
    if (onBridgeReady) onBridgeReady(editorBridge);

    // Listen for selection events FROM the canvas
    const unsubSelect = editorBridge.on('select', (id: string) => select(id));
    const unsubHover = editorBridge.on('hover', (id: string) => hover(id));

    return () => {
      editorBridge.destroy();
      unsubSelect();
      unsubHover();
    };
  }, []);

  const handleLoad = () => {
    if (iframeRef.current?.contentWindow && bridge) {
      // Connect bridge to the new window
      bridge.setTarget(iframeRef.current.contentWindow);
      
      // Perform handshake
      bridge.send('handshake', { mode: 'sidebar' });
      console.log('🔌 Bridge connected to Canvas');
    }
  };

  // Viewport styles
  // Viewport styles (Imported from config)
  const viewportStyles = VIEWPORTS;

  return (
    <div className="flex flex-col h-full bg-zinc-900/50">
      {/* Canvas Toolbar */}
      <div className="h-12 border-b border-zinc-800 flex items-center justify-center gap-2 bg-zinc-900">
        <button 
          onClick={() => setViewport('desktop')}
          className={`p-2 rounded ${viewport === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Desktop"
        >
          <Monitor size={18} />
        </button>
        <button 
          onClick={() => setViewport('tablet')}
          className={`p-2 rounded ${viewport === 'tablet' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Tablet"
        >
          <Tablet size={18} />
        </button>
        <button 
          onClick={() => setViewport('mobile')}
          className={`p-2 rounded ${viewport === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          title="Mobile"
        >
          <Smartphone size={18} />
        </button>
      </div>

      {/* Viewport Container */}
      <div className="flex-1 overflow-auto flex justify-center bg-zinc-950/50 perspective-distant relative">

        <div className={`transition-all duration-300 ease-in-out border border-zinc-800 bg-white relative ${viewportStyles[viewport]}`}>
            <iframe
                ref={iframeRef}
                src={url}
                className="w-full h-full border-none"
                onLoad={handleLoad}
                title="Visual Editor Canvas"
            />
        </div>
      </div>
    </div>
  );
}
