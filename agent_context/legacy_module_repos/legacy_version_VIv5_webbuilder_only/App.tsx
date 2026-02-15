
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import { PageRenderer } from './components/renderers/PageRenderer';
import { EditorOverlay } from './components/editor/EditorOverlay';
import { Header } from './components/layout/Header';
import { Navigation } from './components/layout/Navigation';
import { AppShell } from './components/layout/AppShell';

// Data & Hooks
import { useCheatCode } from './hooks/useCheatCode';
import { useTemplateManager } from './hooks/useTemplateManager';
import { DEFAULT_CONFIG } from './data';
import { ConfigState } from './types';
import { resolveSectionDimensions } from './utils/resolution';
import { PRESET_REGISTRY } from './presets/registry';
import { PreviewContext } from './contexts/PreviewContext';

export default function App() {
  const { hasUnlockedDebug, isDebugMode, setIsDebugMode, flash, handleTouchStart, handleTouchEnd } = useCheatCode();
  
  // State Manager 2: Structure (New Template)
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
      toggleSceneObjectInSection
  } = useTemplateManager();
  
  // Scratchpad State (Single Mode)
  const [singleConfig, setSingleConfig] = useState<ConfigState>(JSON.parse(JSON.stringify(DEFAULT_CONFIG)));
  const updateSingleConfig = (key: keyof ConfigState, value: any) => {
      setSingleConfig(prev => ({ ...prev, [key]: value }));
  };

  const [copySuccess, setCopySuccess] = useState(false);
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('multi');
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // Sidebar State (New)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Scroll Container State (New)
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

  // --- Scroll Logic (Maintained for Editor UI Visualization) ---
  // Note: Actual Rendering progress is now handled internally by SectionFrame.
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainer) return;
      
      const vH = window.innerHeight;
      const newProgress: Record<string, number> = {};

      template.sections.forEach(section => {
          const key = section.id;
          // Accurate v1 scroll math using presets
          const { height, pinHeight } = resolveSectionDimensions(section, PRESET_REGISTRY);

          // Editor Logic: Approximate progress for the sidebar UI
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

  const setSectionRef = (id: string, el: HTMLElement | null) => {
      sectionRefs.current[id] = el;
  };

  // Construct Sidebar content to pass to shell
  // We only render the editor if debug mode is ON
  const sidebarContent = isDebugMode ? (
      <EditorOverlay
        isDebugMode={isDebugMode}
        activeSectionId={activeSectionId}
        setActiveSectionId={setActiveSectionId}
        
        template={template}
        
        sectionProgress={sectionProgress}
        viewMode={viewMode}
        setViewMode={setViewMode}
        
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
      
      <AnimatePresence>
          {flash && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-yellow-500/50 mix-blend-overlay pointer-events-none" />
          )}
      </AnimatePresence>

      {/* App Shell wraps the content and sidebar */}
      <PreviewContext.Provider value={{ scrollContainer }}>
          <AppShell 
            isSidebarOpen={isSidebarOpen}
            sidebarContent={sidebarContent}
            setScrollContainer={setScrollContainer}
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
              copySuccess={copySuccess} 
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
            
            <Navigation isOpen={isNavOpen} />

            <main className="relative w-full">
                <div className="relative z-20 shadow-[0_-50px_100px_rgba(0,0,0,0.5)]">
                    <PageRenderer 
                        template={template} 
                        setSectionRef={setSectionRef}
                    />
                </div>
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
