
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings2, ChevronDown, ChevronUp, Layers, MoveVertical, Box, Triangle, Circle, Square, Type, CreditCard, CloudLightning, Cloud, Trash2, Copy, PanelTop, Plus, Info, X, Pin, List } from 'lucide-react';
import { FpsTracker } from '../FpsTracker';
import { ConfigControls, AddButton, SectionHeader } from './ConfigControls';
import { BindingControls } from './BindingControls';
import { PlacementControls } from './PlacementControls';
import { PresentationControls } from './PresentationControls';
import { ConfigState, SceneObject, ShapeType, PageTemplate, Binding, Placement } from '../../types';
import { getSectionLabel, resolveBindingData, injectBindingData } from '../../utils/resolution';
import { PRESET_REGISTRY } from '../../presets/registry';

interface EditorOverlayProps {
    isDebugMode: boolean;
    activeSectionId: string;
    setActiveSectionId: (id: string) => void;
    sectionProgress: Record<string, number>;
    
    // Data Props
    template: PageTemplate; 
    
    // Methods
    viewMode: 'single' | 'multi';
    setViewMode: (mode: 'single' | 'multi') => void;
    
    // Structure Updates
    updateSectionHeight: (id: string, h: number) => void;
    updateSectionPinHeight: (id: string, h: number) => void;
    updateSectionClassName?: (id: string, c: string) => void;
    updateSectionBinding: (id: string, b: Binding) => void;
    updateSectionPlacement: (id: string, p: Placement) => void;
    updateSectionPresentation: (id: string, k: string) => void;
    
    addSection: () => string;
    removeSection: (id: string) => void;

    // Content Updates
    singleConfig: ConfigState;
    updateSingleConfig: (k: keyof ConfigState, v: any) => void;
    
    // Scene Object Updates (New Signature)
    addSceneObject: (sectionId: string, shape: ShapeType) => void;
    updateSceneObject: (sectionId: string, objectId: string, k: keyof ConfigState, v: any) => void;
    removeSceneObject: (sectionId: string, objectId: string) => void;
    duplicateSceneObject: (sectionId: string, objectId: string) => void;
    toggleSceneObject: (sectionId: string, objectId: string) => void;
}

const InfoModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pointer-events-auto">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-[#1A1A1B] border border-white/10 p-6 rounded-2xl shadow-2xl max-w-lg w-full text-white/90">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold tracking-tight">VI Studio: Builder V1</h3>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4 text-sm text-white/70 leading-relaxed">
                <p>
                    This is the <strong className="text-white">v1.1 Compiler Implementation</strong> of the VI Studio builder.
                    It uses a data-driven architecture where meaning comes from <em>Binding</em>, not component filenames.
                </p>
                <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <h4 className="font-bold text-blue-200 mb-1 text-xs uppercase tracking-wider">Capabilities</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Semantic Binding (Self vs Related)</li>
                        <li>Placement Sorting (Start/Free/End)</li>
                        <li>Preset Registry & Validation</li>
                        <li>Visual Overrides (No-bleed)</li>
                    </ul>
                </div>
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <h4 className="font-bold text-yellow-200 mb-1 text-xs uppercase tracking-wider">Non-Goals & Constraints</h4>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                        <li><strong>No Routing:</strong> Single page experience only.</li>
                        <li><strong>No Backend:</strong> All data is client-side or stubbed.</li>
                        <li><strong>Legacy Bridge:</strong> Removed. All sections are now data-driven.</li>
                    </ul>
                </div>
                <p className="text-xs text-white/40 pt-2 border-t border-white/5">
                    Use <strong>Export Config</strong> in the header to save your work to JSON.
                </p>
            </div>
        </div>
    </div>
);

export const EditorOverlay: React.FC<EditorOverlayProps> = ({
    isDebugMode,
    activeSectionId,
    setActiveSectionId,
    sectionProgress,
    template,
    viewMode,
    setViewMode,
    updateSectionHeight,
    updateSectionPinHeight,
    updateSectionClassName,
    updateSectionBinding,
    updateSectionPlacement,
    updateSectionPresentation,
    addSection,
    removeSection,
    singleConfig,
    updateSingleConfig,
    addSceneObject,
    updateSceneObject,
    removeSceneObject,
    duplicateSceneObject,
    toggleSceneObject
}) => {
    const [showInfo, setShowInfo] = useState(false);

    // 1. Find Current Section
    const currentSectionInstance = template.sections.find(s => s.id === activeSectionId);
    
    // 2. Compute Effective Config (Preset + Overrides) for Display
    // NOW WITH DATA INJECTION: We hydrate the config so the editor shows what the user sees.
    const { effectiveConfig, activeObjects, sectionHeight, sectionPinHeight, sectionClassName } = useMemo(() => {
        if (!currentSectionInstance) return { effectiveConfig: null, activeObjects: [], sectionHeight: 1000, sectionPinHeight: 800, sectionClassName: '' };
        
        const preset = PRESET_REGISTRY[currentSectionInstance.presentationKey];
        const base = preset ? JSON.parse(JSON.stringify(preset.config)) : {};
        
        // Merge overrides (Shallow merge of children)
        const merged = { ...base, ...(currentSectionInstance.overrides || {}) };
        
        // HYDRATE WITH DATA: Replicate SectionRenderer logic for WYSIWYG
        const resolvedData = resolveBindingData(currentSectionInstance.binding);
        // We inject into 'merged' directly. Since 'merged' is a new object derived from base/overrides, it's safe to mutate for display.
        // We pass 'base' as original to ensure we respect overrides (only inject into untouched fields)
        injectBindingData(merged, currentSectionInstance.binding, resolvedData, base);
        
        return {
            effectiveConfig: merged,
            activeObjects: merged.children || [],
            sectionHeight: merged.height?.value || 1000,
            sectionPinHeight: merged.pinHeight || 800,
            sectionClassName: merged.className || "bg-white"
        };
    }, [currentSectionInstance]);

    const handleAddSection = () => {
        const newId = addSection();
        setActiveSectionId(newId);
    };

    if (!isDebugMode) return null;

    return (
      <div className="flex flex-col h-full relative">
        <AnimatePresence>
            {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
        </AnimatePresence>

        {/* --- PART 1: TOP STATS & HEADER (Pinned) --- */}
        <div className="flex flex-col border-b border-white/5 bg-white/5 shrink-0 pt-20"> 
            
            {/* FPS & Global Stats */}
            <div className="px-6 py-3 border-b border-white/5 flex items-center justify-between">
                <FpsTracker />
                <div className="flex flex-col gap-1 w-24">
                    <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-75" style={{ width: `${Math.max(0, Math.min(1, sectionProgress[activeSectionId] || 0)) * 100}%` }} />
                    </div>
                </div>
            </div>

            {/* Section Selector */}
            <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="p-1.5 bg-white/10 rounded-lg shrink-0 cursor-help hover:bg-white/20 transition-colors" onClick={() => setShowInfo(true)} title="About Builder V1">
                        <Settings2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="relative flex-1 min-w-0">
                        <select 
                            value={activeSectionId} 
                            onChange={(e) => setActiveSectionId(e.target.value)}
                            className="w-full bg-transparent text-sm font-medium tracking-wide text-white/90 focus:outline-none cursor-pointer appearance-none uppercase truncate pr-6"
                        >
                            {template.sections.map(s => (
                                <option key={s.id} value={s.id} className="text-black">
                                    {getSectionLabel(s)}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-white/50 pointer-events-none" />
                    </div>
                </div>
                <div className="flex items-center gap-2 pl-3 border-l border-white/10 ml-3">
                    <button onClick={handleAddSection} className="p-1.5 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors" title="Add Section">
                        <Plus className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeSection(activeSectionId)} className="p-1.5 hover:bg-red-500/10 rounded-lg text-white/60 hover:text-red-400 transition-colors" title="Remove Section">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>

        {/* --- PART 2: SCROLLABLE CONTROLS --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            
            {/* --- BINDING, PLACEMENT & PRESENTATION --- */}
            {currentSectionInstance && (
                <div className="space-y-6 pb-6 border-b border-white/5">
                    <div>
                        <SectionHeader title="Semantics (Binding)" top={0} className="-mx-4 px-4 bg-transparent border-t-0" />
                        <BindingControls 
                            binding={currentSectionInstance.binding}
                            onChange={(b) => updateSectionBinding(activeSectionId, b)}
                        />
                    </div>
                    
                    <div>
                        <SectionHeader title="Visuals (Presentation)" top={0} className="-mx-4 px-4 bg-transparent border-t-0" />
                        <PresentationControls 
                            binding={currentSectionInstance.binding}
                            currentKey={currentSectionInstance.presentationKey}
                            onChange={(k) => updateSectionPresentation(activeSectionId, k)}
                        />
                    </div>

                    <div>
                        <SectionHeader title="Position (Placement)" top={0} className="-mx-4 px-4 bg-transparent border-t-0" />
                        <PlacementControls 
                            placement={currentSectionInstance.placement}
                            onChange={(p) => updateSectionPlacement(activeSectionId, p)}
                        />
                    </div>
                </div>
            )}

            {/* --- VISUALS & CONTENT --- */}
            
            {/* Mode Toggles */}
            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                <button 
                    onClick={() => setViewMode('single')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === 'single' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                >
                    <Box className="w-3.5 h-3.5" />
                    Scratchpad
                </button>
                <button 
                    onClick={() => setViewMode('multi')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-medium transition-all ${viewMode === 'multi' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/70'}`}
                >
                    <Layers className="w-3.5 h-3.5" />
                    Section Scene
                </button>
            </div>

            {/* Single Mode Config (Scratchpad) */}
            {viewMode === 'single' ? (
                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                    <ConfigControls config={singleConfig} onChange={updateSingleConfig} headerOffset={0} sectionHeaderClass="-mx-4 px-4" />
                </div>
            ) : (
                <>
                    {/* Section Dimensions Control */}
                    <div className="bg-white/5 rounded-lg p-3 space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-white/60">
                                <div className="flex items-center gap-2">
                                    <MoveVertical className="w-3 h-3" />
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Scroll Height</span>
                                </div>
                                <span className="text-[10px]">{sectionHeight}px</span>
                            </div>
                            <input 
                                type="range" min="500" max={5000} step="50"
                                value={sectionHeight}
                                onChange={(e) => updateSectionHeight(activeSectionId, Number(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>
                        
                        {/* Pin Height Control */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-white/60">
                                <div className="flex items-center gap-2">
                                    <Pin className="w-3 h-3" />
                                    <span className="text-[10px] uppercase font-bold tracking-wider">Pin Height</span>
                                </div>
                                <span className="text-[10px]">{sectionPinHeight}px</span>
                            </div>
                            <input 
                                type="range" min="100" max={2000} step="50"
                                value={sectionPinHeight}
                                onChange={(e) => updateSectionPinHeight(activeSectionId, Number(e.target.value))}
                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                            />
                        </div>
                        
                        {/* Container Class Control */}
                        {updateSectionClassName && (
                            <div>
                                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Container Class</label>
                                <input 
                                    type="text" 
                                    value={sectionClassName} 
                                    onChange={(e) => updateSectionClassName(activeSectionId, e.target.value)}
                                    placeholder="bg-white"
                                    className="w-full bg-black/40 border border-white/10 rounded px-2 py-1.5 text-xs font-mono text-white focus:border-white/30 outline-none"
                                />
                            </div>
                        )}
                    </div>

                    {/* Add Buttons */}
                    <div className="space-y-3 p-2">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest pl-1">Add Object</label>
                        <div className="grid grid-cols-4 gap-2">
                            <AddButton icon={<Triangle className="w-4 h-4" />} label="Pyramid" onClick={() => addSceneObject(activeSectionId, 'tetrahedron')} />
                            <AddButton icon={<Box className="w-4 h-4" />} label="Cube" onClick={() => addSceneObject(activeSectionId, 'cube')} />
                            <AddButton icon={<Circle className="w-4 h-4" />} label="Sphere" onClick={() => addSceneObject(activeSectionId, 'sphere')} />
                            <AddButton icon={<Square className="w-4 h-4" />} label="Plane" onClick={() => addSceneObject(activeSectionId, 'plane')} />
                            <AddButton icon={<Type className="w-4 h-4" />} label="Tile" onClick={() => addSceneObject(activeSectionId, 'tile')} />
                            <AddButton icon={<CreditCard className="w-4 h-4" />} label="Card" onClick={() => addSceneObject(activeSectionId, 'card')} />
                            <AddButton icon={<List className="w-4 h-4" />} label="List" onClick={() => addSceneObject(activeSectionId, 'list')} />
                            <AddButton icon={<CloudLightning className="w-4 h-4" />} label="Lightning" onClick={() => addSceneObject(activeSectionId, 'lightning')} />
                            <AddButton icon={<Cloud className="w-4 h-4" />} label="Atmos" onClick={() => addSceneObject(activeSectionId, 'atmosphere')} />
                        </div>
                    </div>

                    <div className="h-px bg-white/5 mx-2" />

                    {/* Object List */}
                    <div className="space-y-3">
                        {activeObjects.map((obj, idx) => (
                            <div key={obj.id} className="bg-white/5 border border-white/10 rounded-xl relative group">
                                <div 
                                    className="sticky top-0 z-30 flex items-center justify-between px-4 h-[45px] bg-[#121212]/90 backdrop-blur-xl border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors rounded-t-xl shadow-lg"
                                    onClick={() => toggleSceneObject(activeSectionId, obj.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-5 h-5 flex items-center justify-center bg-white/10 rounded text-[10px] font-mono text-white/50">{idx + 1}</span>
                                        <span className="text-xs font-medium text-white/80 capitalize">{obj.shape}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); duplicateSceneObject(activeSectionId, obj.id); }} className="p-1.5 hover:bg-white/10 text-white/30 hover:text-white rounded transition-colors" title="Duplicate Layer"><Copy className="w-3.5 h-3.5" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); removeSceneObject(activeSectionId, obj.id); }} className="p-1.5 hover:bg-red-500/20 text-white/30 hover:text-red-400 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        {obj.isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-white/40" /> : <ChevronDown className="w-3.5 h-3.5 text-white/40" />}
                                    </div>
                                </div>
                                {obj.isExpanded && (
                                    <div className="p-4 border-t border-white/5 bg-black/20 rounded-b-xl">
                                        <ConfigControls config={obj} onChange={(k, v) => updateSceneObject(activeSectionId, obj.id, k, v)} headerOffset={45} sectionHeaderClass="-mx-4 px-4" />
                                    </div>
                                )}
                            </div>
                        ))}
                        {activeObjects.length === 0 && (
                            <div className="text-center text-white/20 text-xs py-8 italic">No objects in {activeSectionId} scene</div>
                        )}
                    </div>
                </>
            )}
        </div>
      </div>
    );
};
