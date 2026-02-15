
import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Layers, Settings2, Eye, Plus, Trash2, ArrowUp, ArrowDown, Maximize2, Minimize2, Copy, AlertCircle, Info as InfoIcon } from 'lucide-react';
import type { ConfigState, PageTemplate, Binding, Placement } from '../../lib/types';
import { BindingControls } from './controls/BindingControls';
import { PlacementControls } from './controls/PlacementControls';
import { PresentationControls } from './controls/PresentationControls';
import { ConfigControls } from './controls/ConfigControls';

interface EditorOverlayProps {
    isDebugMode: boolean; // "Sandbox Mode" status
    activeSectionId: string | null;
    setActiveSectionId: (id: string | null) => void;
    sectionProgress: number; // 0-1 progress of active section in viewport
    
    // Data Props
    template: PageTemplate;
    
    // View State
    viewMode: 'desktop' | 'mobile'; // Actually handled by iframe width, but maybe UI toggle?
    setViewMode: (m: 'desktop' | 'mobile') => void;

    // Mutators (Passed down from Shell/Store)
    updateSectionHeight: (id: string, h: number) => void;
    updateSectionPinHeight: (id: string, h: number) => void;
    updateSectionClassName: (id: string, c: string) => void;
    
    updateSectionBinding: (id: string, b: Binding) => void;
    updateSectionPlacement: (id: string, p: Placement) => void;
    updateSectionPresentation: (id: string, k: string) => void;
    
    addSection: () => void;
    removeSection: (id: string) => void;
    
    // Single Config (Override) Logic
    singleConfig: ConfigState | null; // The visual config of the active section
    updateSingleConfig: (key: keyof ConfigState, value: any) => void;

    // Scene Object Logic (for children within a section)
    addSceneObject: (sectionId: string, parentId?: string) => void;
    updateSceneObject: (sectionId: string, objectId: string, key: keyof ConfigState, value: any) => void;
    removeSceneObject: (sectionId: string, objectId: string) => void;
    duplicateSceneObject: (sectionId: string, objectId: string) => void;
    toggleSceneObject: (sectionId: string, objectId: string) => void;
}

export const Overlay: React.FC<EditorOverlayProps> = ({
    isDebugMode,
    activeSectionId,
    setActiveSectionId,
    sectionProgress,
    template,
    viewMode: _viewMode,
    setViewMode: _setViewMode,
    updateSectionHeight,
    updateSectionPinHeight: _updateSectionPinHeight,
    updateSectionClassName,
    updateSectionBinding,
    updateSectionPlacement,
    updateSectionPresentation,
    addSection,
    removeSection,
    singleConfig,
    updateSingleConfig,
    addSceneObject,
    updateSceneObject: _updateSceneObject,
    removeSceneObject,
    duplicateSceneObject,
    toggleSceneObject
}) => {
    const [activeTab, setActiveTab] = useState<'semantics' | 'visuals' | 'position'>('visuals');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [showInfo, setShowInfo] = useState(false);

    // If debug mode is locked, show nothing (or maybe a minimal badge? But Shell handles that)
    if (!isDebugMode) return null;

    const sections = template.sections;
    const activeSection = sections.find(s => s.id === activeSectionId);
    
    // Derived states
    const activeIndex = sections.findIndex(s => s.id === activeSectionId);
    const totalbr = sections.length;

    // --- RENDER HELPERS ---

    const renderTabButton = (id: 'semantics' | 'visuals' | 'position', icon: React.ReactNode, label: string) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 border-b-2 transition-all group ${
                activeTab === id 
                ? 'border-white text-white bg-white/5' 
                : 'border-transparent text-white/40 hover:text-white/70 hover:bg-white/5'
            }`}
        >
            <div className={`p-1.5 rounded-lg transition-colors ${activeTab === id ? 'bg-white text-black' : 'bg-transparent group-hover:bg-white/10'}`}>
                {icon}
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest">{label}</span>
        </button>
    );

    if (showInfo) {
        return (
            <div className="fixed inset-y-4 right-4 w-[400px] bg-[#121212]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
                <div className="p-6 border-b border-white/5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-3">
                        <InfoIcon className="w-6 h-6 text-blue-400" />
                        Editor Capabilities
                    </h2>
                    <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-white/80 leading-relaxed">
                    <div className="space-y-4">
                        <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                            <h3 className="font-bold text-blue-200 mb-2">Sandbox Environment</h3>
                            <p>You are in a fully functional, ephemeral sandbox. Changes made here persist to your localStorage but do not affect the live production site until exported.</p>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-white mb-2">Binding (Semantics)</h3>
                            <p className="text-white/60">Connect visual sections to data sources. Switch between "Self" (static content) and "Related" (dynamic collections like Products or Use Cases).</p>
                        </div>
                        
                        <div>
                            <h3 className="font-bold text-white mb-2">Presentation (Visuals)</h3>
                            <p className="text-white/60">The core styling engine. Supports:</p>
                            <ul className="list-disc pl-4 space-y-1 mt-2 text-white/50 marker:text-blue-500">
                                <li><strong>Primitives:</strong> Tetrahedron, Cube, Sphere, etc.</li>
                                <li><strong>Collections:</strong> Grids, Stacks, and WebGL Marquees.</li>
                                <li><strong>Leading Elements:</strong> Icons or Images paired with text.</li>
                                <li><strong>Storm FX:</strong> Lightning & Atmosphere simulation settings.</li>
                                <li><strong>Material Design:</strong> Card elevation, opacity, and radius.</li>
                            </ul>
                        </div>

                         <div>
                            <h3 className="font-bold text-white mb-2">Placement (Structure)</h3>
                            <p className="text-white/60">Reorder sections relative to fixed "Start" (Hero) and "End" (Footer) slots. Use the "Free" slot for body content.</p>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-white/10">
                        <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Keyboard Shortcuts</h4>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="flex items-center justify-between p-2 rounded bg-white/5">
                                <span className="text-xs">Toggle HUD</span>
                                <code className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded font-mono">`</code>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded bg-white/5">
                                <span className="text-xs">Exit Sandbox</span>
                                <code className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded font-mono">ESC</code>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // --- MAIN RENDER ---
    return (
        <div className={`fixed inset-y-4 right-4 ${isCollapsed ? 'w-16' : 'w-[360px]'} transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-50 flex flex-col pointer-events-none`}>
            
            {/* --- VISUAL HUD CONTAINER --- */}
            <div className={`bg-[#121212]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex-1 flex flex-col overflow-hidden pointer-events-auto transition-all ${isCollapsed ? 'opacity-90' : 'opacity-100'}`}>
                
                {/* 1. TOP BAR (Navigation) */}
                <div className="flex items-center justify-between px-2 py-3 border-b border-white/10 bg-black/20">
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
                        >
                            {isCollapsed ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
                        
                        {!isCollapsed && (
                             <div className="flex flex-col ml-1">
                                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Section</span>
                                <span className="text-xs font-mono text-white font-medium truncate max-w-[140px]">
                                    {activeSection?.binding.kind === 'self' 
                                        ? 'Static Content' 
                                        : `${activeSection?.binding.target} collection`
                                    }
                                </span>
                             </div>
                        )}
                    </div>

                    {!isCollapsed && (
                        <div className="flex items-center gap-1">
                            <button onClick={() => setShowInfo(true)} className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-blue-400 transition-colors" title="Info">
                                <InfoIcon className="w-4 h-4" />
                            </button>
                             <div className="w-px h-4 bg-white/10 mx-1" />
                            <div className="flex items-center gap-1 bg-black/40 rounded-lg p-0.5 border border-white/5">
                                <button className="p-1.5 rounded bg-white/10 text-white shadow-sm">
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                <button className="p-1.5 rounded hover:bg-white/5 text-white/40 hover:text-white">
                                    <Minimize2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {isCollapsed ? (
                    // COLLAPSED V-STRIP
                    <div className="flex-1 flex flex-col items-center py-4 gap-4">
                         <div className="w-1 h-1 rounded-full bg-white/20" />
                         <div className="writing-vertical-lr text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] transform rotate-180">
                            Editor Active
                         </div>
                    </div>
                ) : activeSection ? (
                    // EXPANDED CONTROLS
                    <>
                        {/* 2. TABS */}
                        <div className="flex border-b border-white/10 bg-black/20">
                            {renderTabButton('semantics', <Layers className="w-4 h-4" />, 'Binding')}
                            {renderTabButton('visuals', <Eye className="w-4 h-4" />, 'Visuals')}
                            {renderTabButton('position', <Settings2 className="w-4 h-4" />, 'Position')}
                        </div>

                        {/* 3. SCROLLABLE CONTENT AREA */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                             {/* Progress Bar for Section Scroll */}
                             <div className="sticky top-0 z-30 h-1 w-full bg-white/5">
                                <div 
                                    className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] transition-all duration-75 ease-linear"
                                    style={{ width: `${Math.max(0, Math.min(100, sectionProgress * 100))}%` }}
                                />
                             </div>

                             <div className="p-5">
                                {activeTab === 'semantics' && (
                                    <div className="space-y-6 animate-in fade-in duration-300">
                                         <BindingControls 
                                            binding={activeSection.binding} 
                                            onChange={(b) => {
                                                updateSectionBinding(activeSection.id, b);
                                                // Reset compatible presentation if necessary? 
                                                // For now, let the user manually fix presentation if it breaks.
                                            }}
                                        />
                                         
                                         <hr className="border-white/5" />
                                         
                                         <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
                                            <div className="flex items-start gap-3">
                                                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <h4 className="text-xs font-bold text-blue-200">Data Contract</h4>
                                                    <p className="text-[11px] text-blue-200/70 leading-relaxed">
                                                        Changes to binding affect which database records are fetched. 
                                                        Complex queries (filters/sorts) are executed live against the localized graph cache.
                                                    </p>
                                                </div>
                                            </div>
                                         </div>
                                    </div>
                                )}

                                {activeTab === 'position' && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                        <PlacementControls 
                                            placement={activeSection.placement}
                                            onChange={(p) => updateSectionPlacement(activeSection.id, p)}
                                        />

                                        <div className="space-y-4">
                                            <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Layout Dimensions</div>
                                            
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-white/60 flex justify-between">
                                                    <span>Scroll Height (px)</span>
                                                    <span className="font-mono text-white/40">{activeSection.overrides?.height?.value || 1000}px</span>
                                                </label>
                                                <input 
                                                    type="range" min={400} max={4000} step={100}
                                                    value={activeSection.overrides?.height?.value || 1000}
                                                    onChange={(e) => updateSectionHeight(activeSection.id, parseInt(e.target.value))}
                                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] text-white/60 flex justify-between">
                                                    <span>Container Class</span>
                                                </label>
                                                <input 
                                                    type="text"
                                                    value={activeSection.overrides?.className || ''}
                                                    onChange={(e) => updateSectionClassName(activeSection.id, e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-white/30 outline-none"
                                                    placeholder="e.g. bg-white"
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="pt-4 border-t border-white/5">
                                            <button 
                                                onClick={() => removeSection(activeSection.id)}
                                                className="w-full py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all text-xs font-bold flex items-center justify-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Section
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'visuals' && (
                                    <div className="space-y-8 animate-in fade-in duration-300">
                                         
                                         {/* 1. Preset Selector */}
                                         <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                             <PresentationControls 
                                                binding={activeSection.binding}
                                                currentKey={activeSection.presentationKey}
                                                onChange={(k) => updateSectionPresentation(activeSection.id, k)}
                                             />
                                         </div>

                                         {/* 2. Fine Tuning (ConfigControls) */}
                                         {singleConfig && (
                                             <ConfigControls 
                                                config={singleConfig}
                                                onChange={updateSingleConfig}
                                                // Pass header styling props to make sticky headers look good inside this scroll container
                                                sectionHeaderClass="bg-[#2A2A2A]/90 backdrop-blur top-0"
                                                headerOffset={-20} 
                                             />
                                         )}
                                         
                                         {/* 3. Scene Objects (Children) Helper */}
                                         <div className="pt-4 border-t border-white/5">
                                             <div className="flex items-center justify-between mb-3">
                                                 <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Scene Objects</span>
                                                 <button 
                                                    onClick={() => addSceneObject(activeSection.id)}
                                                    className="p-1 hover:bg-white/10 rounded text-white/50 hover:text-white"
                                                 >
                                                     <Plus className="w-4 h-4" />
                                                 </button>
                                             </div>
                                             
                                             <div className="space-y-2">
                                                 {singleConfig?.children?.map((child, idx) => (
                                                     <div key={child.id || idx} className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/5">
                                                         <div className="w-2 h-2 rounded-full bg-green-500/50" />
                                                         <span className="text-xs font-mono text-white/70 flex-1 truncate">{child.shape}</span>
                                                         <button 
                                                            onClick={() => toggleSceneObject(activeSection.id, child.id)}
                                                            className="text-white/30 hover:text-white px-1"
                                                            title="Toggle Visibility (Mock)"
                                                         >
                                                             <Eye className="w-3 h-3" />
                                                         </button>
                                                         <button 
                                                            onClick={() => duplicateSceneObject(activeSection.id, child.id)}
                                                            className="text-white/30 hover:text-white px-1"
                                                            title="Duplicate"
                                                         >
                                                             <Copy className="w-3 h-3" />
                                                         </button>
                                                         <button 
                                                            onClick={() => removeSceneObject(activeSection.id, child.id)}
                                                            className="text-red-400/50 hover:text-red-400 px-1"
                                                            title="Delete"
                                                         >
                                                             <X className="w-3 h-3" />
                                                         </button>
                                                     </div>
                                                 ))}
                                                 {(!singleConfig?.children || singleConfig.children.length === 0) && (
                                                     <div className="text-[10px] text-white/20 italic text-center py-2">No custom objects</div>
                                                 )}
                                             </div>
                                         </div>
                                    </div>
                                )}
                             </div>
                        </div>

                        {/* 4. BOTTOM BAR (Section Nav) */}
                        <div className="p-3 border-t border-white/10 bg-black/20 flex items-center gap-2">
                             <div className="flex-1 flex gap-1">
                                 <button 
                                    onClick={() => {
                                        const prev = activeIndex > 0 ? sections[activeIndex - 1] : sections[totalbr - 1];
                                        setActiveSectionId(prev.id);
                                    }}
                                    className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex items-center justify-center"
                                 >
                                     <ArrowUp className="w-4 h-4" />
                                 </button>
                                 <button 
                                     onClick={() => {
                                        const next = activeIndex < totalbr - 1 ? sections[activeIndex + 1] : sections[0];
                                        setActiveSectionId(next.id);
                                     }}
                                     className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors flex items-center justify-center"
                                 >
                                     <ArrowDown className="w-4 h-4" />
                                 </button>
                             </div>
                             
                             <button 
                                onClick={addSection}
                                className="px-6 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 hover:text-blue-200 border border-blue-600/50 transition-all font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(37,99,235,0.2)]"
                             >
                                 New Section
                             </button>
                        </div>
                    </>
                ) : (
                    // EMPTY STATE
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-white/40">
                        <Layers className="w-12 h-12 mb-4 opacity-20" />
                        <h3 className="text-sm font-bold text-white mb-2">No Selection</h3>
                        <p className="text-xs mb-6 max-w-[200px]">Select a section to begin editing semantics, visuals, or layout.</p>
                        <button 
                            onClick={addSection}
                            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors text-xs font-bold"
                         >
                             Add First Section
                         </button>
                    </div>
                )}
            </div>
        </div>
    );
};
