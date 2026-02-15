import React, { useRef, useEffect, useCallback } from 'react';
import { RefreshCw, Maximize2, ExternalLink } from 'lucide-react';

interface PreviewFrameProps {
  /** The URL to load in the iframe (e.g., http://localhost:3000/preview/brand) */
  previewUrl: string;
  
  /** The config payload to sync to the iframe */
  config: any;
  
  /** Optional className for the container */
  className?: string;
}

/**
 * PreviewFrame - Real-time Visual Editor Preview
 * 
 * This component embeds the Theme's React app in an iframe and syncs
 * configuration changes via PostMessage for hot-reload editing.
 */
export function PreviewFrame({ previewUrl, config, className = '' }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Send config update to iframe
  const syncConfig = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        { type: 'VI_UPDATE_CONFIG', payload: config },
        '*' // In production, use specific origin
      );
    }
  }, [config]);

  // Sync whenever config changes
  useEffect(() => {
    syncConfig();
  }, [syncConfig]);

  // Handle iframe load
  const handleLoad = () => {
    setIsLoading(false);
    // Initial sync after load
    setTimeout(syncConfig, 100);
  };

  // Refresh iframe
  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Open in new tab
  const openInNewTab = () => {
    window.open(previewUrl, '_blank');
  };

  return (
    <div 
      className={`relative bg-black rounded-xl overflow-hidden border border-white/10 ${className} ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      }`}
    >
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2 bg-gradient-to-b from-black/80 to-transparent">
        <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
          Live Preview
        </span>
        <div className="flex items-center gap-1">
          <button 
            onClick={handleRefresh}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={openInNewTab}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span className="text-xs text-white/40">Loading Preview...</span>
          </div>
        </div>
      )}

      {/* Iframe */}
      <iframe
        ref={iframeRef}
        src={previewUrl}
        onLoad={handleLoad}
        className="w-full h-full border-0"
        style={{ minHeight: isFullscreen ? 'calc(100vh - 2rem)' : '500px' }}
        title="Visual Preview"
        sandbox="allow-scripts allow-same-origin"
      />

      {/* Fullscreen Close Button */}
      {isFullscreen && (
        <button
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-30 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs text-white/80 backdrop-blur-sm transition-colors"
        >
          Exit Fullscreen
        </button>
      )}
    </div>
  );
}
