
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import { PageRenderer } from './components/renderers/PageRenderer';
import { EditorOverlay } from './components/editor/EditorOverlay';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { AppShell } from './components/layout/AppShell';
import { Dashboard } from './components/admin/Dashboard';
import { ViewportFrame } from './components/editor/ViewportFrame';
import { MouseTracker } from './components/editor/MouseTracker';
import { apiClient } from './api/client';

// Data & Hooks
import { useCheatCode } from './hooks/useCheatCode';
import { useTemplateManager } from './hooks/useTemplateManager';
import { loadPageConfig } from './utils/configLoader';
import { DEFAULT_CONFIG } from './data';
import { ConfigState } from './types';
import { resolveSectionDimensions } from './utils/resolution';
import { loadPresets, getPresetRegistry } from './presets/loader';
import { PreviewContext } from './contexts/PreviewContext';

export default function App() {
  const { hasUnlockedDebug, isDebugMode, setIsDebugMode, flash, handleTouchStart, handleTouchEnd } = useCheatCode();
  
  // Create simple router for Dashboard
  const [isDashboard, setIsDashboard] = useState(window.location.pathname === '/dashboard');
  if (isDashboard) {
      return <Dashboard />;
  }
  
  // Hybrid State: Load from window.VI_CONFIG or use Template Manager
  const templateManager = useTemplateManager();
  const {
      template,
      updateSectionHeight,
      updateSectionPinHeight,
      updateSectionBinding,
      updateSectionPlacement,
      updateSectionPresentation,
      updateSectionClassName,
      addSection,
      removeSection,
      importTemplate,
      loadTemplate,
      createBlankPage,
      // Content Methods
      addSceneObjectToSection,
      updateSceneObjectInSection,
      removeSceneObjectFromSection,
      duplicateSceneObjectInSection,
      toggleSceneObjectInSection,
      // Backend Persistence
      saveToBackend,
      loadFromBackend
  } = templateManager;

  // Initialize preset loader on mount
  useEffect(() => {
    loadPresets().catch(err => {
      console.warn('[App] Failed to load presets from backend:', err);
    });
  }, []);
  
  // Track loaded entity ID for saving
  const [currentEntityId, setCurrentEntityId] = useState<string | null>(null);

  // Editor Mode State
  const [editorMode, setEditorMode] = useState<'sidebar' | 'overlay'>('sidebar');
  
  // Hydration: Load page from various sources
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // 1. Check for ?pageId= query param (New Pages API - Direct Mode)
    const pageId = params.get('pageId');
    if (pageId) {
        console.log(`[App] Loading page from backend: ${pageId}`);
        loadFromBackend(pageId)
            .then(() => setCurrentEntityId(pageId))
            .catch(err => {
                console.error('[App] Failed to load page:', err);
                alert('Could not load page. Check console.');
            });
        return;
    }

    // 2. Check for ?id= query param (Legacy Entity Mode)
    const id = params.get('id');
    if (id) {
        console.log(`[App] Loading entity via API: ${id}`);
        apiClient.getEntity(id).then(entity => {
            if (entity && entity.data) {
                // Ensure pageContext exists
                const template = { ...entity.data, id: entity.id, name: entity.name };
                importTemplate(JSON.stringify(template));
                setCurrentEntityId(entity.id); // Track ID
            }
        }).catch(err => {
            console.error('[App] Failed to load entity:', err);
            alert('Could not load page. Check console.');
        });
        return;
    }

    // 3. Build Injection (Static Mode)
    const injectedConfig = loadPageConfig();
    if (injectedConfig && injectedConfig.id !== 'dev-preview') {
      importTemplate(JSON.stringify(injectedConfig));
    }
  }, []);

  // PostMessage listener for Admin UI hot reload
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'VI_UPDATE_CONFIG') {
        console.log("⚡ [VI] Hot Update Received", event.data.payload);
        importTemplate(JSON.stringify(event.data.payload));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [importTemplate]);
  
  // Scratchpad State (Single Mode)
  const [singleConfig, setSingleConfig] = useState<ConfigState>(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
  const updateSingleConfig = (key: keyof ConfigState, value: any) => {
      setSingleConfig(prev => ({ ...prev, [key]: value }));
  };

  const [copySuccess, setCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('multi');
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Scroll Container State
  const [scrollContainer, setScrollContainer] = useState<HTMLElement | null>(null);
  
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [sectionProgress, setSectionProgress] = useState<Record<string, number>>({});
  const [activeSectionId, setActiveSectionId] = useState<string>('hero-section');

  // Sync active section ID if it gets deleted
  useEffect(() => {
      const exists = template.sections.some(s => s.id === activeSectionId);
      if (!exists && template.sections.length > 0) {
          setActiveSectionId(template.sections[0].id);
      }
  }, [template.sections, activeSectionId]);

  // Theme Config Hydration
  useEffect(() => {
      if (template.themeConfig) {
          setSingleConfig(prev => ({ ...prev, ...template.themeConfig }));
      }
  }, [template.themeConfig]);

  // Scroll Progress Logic (for Editor UI visualization)
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainer) return;
      
      const vH = window.innerHeight;
      const newProgress: Record<string, number> = {};

      template.sections.forEach(section => {
          const key = section.id;
          const { height, pinHeight } = resolveSectionDimensions(section, getPresetRegistry());

          const el = sectionRefs.current[key];
          if (el) {
              const rect = el.getBoundingClientRect();
              const trackHeight = height;
              const effectivePinHeight = pinHeight || vH; 
              
              const scrollDistance = Math.max(1, trackHeight - effectivePinHeight);
              const scrolledPastStart = -rect.top;
              newProgress[key] = scrolledPastStart / scrollDistance;
          }
      });
      setSectionProgress(newProgress);
    };
    
    // Only run this high-frequency loop if debug mode is active
    if (isDebugMode && scrollContainer) {
        scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); 
        return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [template, isDebugMode, scrollContainer]); 

  const handleCopyConfig = async () => {
    try {
        await navigator.clipboard.writeText(JSON.stringify(template, null, 2));
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) { console.error(err); }
  };

  const handleImportConfig = () => {
      const input = prompt("Paste your PageTemplate JSON here:");
      if (input) {
          const result = importTemplate(input);
          if (!result.success) {
              alert(`Import failed: ${result.error}`);
          }
      }
  };

  const handleSave = async () => {
      if (!currentEntityId) return;
      try {
          // Use the new saveToBackend method for pages API
          await saveToBackend(currentEntityId);

          setCopySuccess(true); // Reuse success visual
          setTimeout(() => setCopySuccess(false), 2000);
          console.log('[App] Saved successfully!');
      } catch (e) {
          console.error('[App] Failed to save:', e);
          alert('Failed to save. Check console.');
      }
  };

  const setSectionRef = (id: string, el: HTMLElement | null) => {
      sectionRefs.current[id] = el;
  };

  // Editor Sidebar content (only when debug mode is ON)
  const sidebarContent = isDebugMode ? (
      <EditorOverlay
        isDebugMode={isDebugMode}
        activeSectionId={activeSectionId}
        setActiveSectionId={setActiveSectionId}
        
        template={template}
        currentEntityId={currentEntityId}
        
        sectionProgress={sectionProgress}
        viewMode={viewMode}
        setViewMode={setViewMode}
        
        editorMode={editorMode}
        setEditorMode={setEditorMode}
        
        updateSectionHeight={updateSectionHeight}
        updateSectionPinHeight={updateSectionPinHeight}
        updateSectionClassName={updateSectionClassName}
        updateSectionBinding={updateSectionBinding}
        updateSectionPlacement={updateSectionPlacement}
        updateSectionPresentation={updateSectionPresentation}
        addSection={addSection}
        removeSection={removeSection}
        
        singleConfig={singleConfig}
        updateSingleConfig={updateSingleConfig}
        
        addSceneObject={addSceneObjectToSection}
        updateSceneObject={updateSceneObjectInSection}
        removeSceneObject={removeSceneObjectFromSection}
        duplicateSceneObject={duplicateSceneObjectInSection}
        toggleSceneObject={toggleSceneObjectInSection}
      />
  ) : (
      <div className="flex flex-col items-center justify-center h-full text-white/20 italic text-sm">
          <span>Creator Mode Disabled</span>
      </div>
  );

  return (
    <div className={`w-full min-h-screen relative font-sans text-white transition-colors duration-500 bg-[#1A1A1B]`} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      
      {/* Yellow Flash on Cheat Code Success */}
      <AnimatePresence>
          {flash && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-yellow-500/50 mix-blend-overlay pointer-events-none" />
          )}
      </AnimatePresence>

      {/* App Shell wraps content and sidebar */}
      <PreviewContext.Provider value={{ scrollContainer }}>
          <AppShell 
            isSidebarOpen={isSidebarOpen}
            sidebarContent={sidebarContent}
            setScrollContainer={setScrollContainer}
            editorMode={editorMode}
          >
            <Header 
              isNavOpen={isNavOpen} 
              setIsNavOpen={setIsNavOpen} 
              hasUnlockedDebug={hasUnlockedDebug} 
              isDebugMode={isDebugMode} 
              setIsDebugMode={setIsDebugMode} 
              onCopyConfig={handleCopyConfig} 
              onImportConfig={handleImportConfig}
              onLoadTemplate={loadTemplate}
              onCreatePage={createBlankPage}
              onSave={currentEntityId ? handleSave : undefined} 
              copySuccess={copySuccess} 
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            
            <Navigation isOpen={isNavOpen} />

            <main className="relative w-full">
                <ViewportFrame>
                    <div className="relative z-20 shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
                        <PageRenderer 
                            template={template} 
                            setSectionRef={setSectionRef}
                        />
                    </div>
                </ViewportFrame>
            </main>
          </AppShell>
      </PreviewContext.Provider>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      `}</style>
    </div>
  );
}
