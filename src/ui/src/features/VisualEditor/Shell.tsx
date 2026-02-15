
import { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { useSearchParams } from 'react-router-dom';
import { Canvas } from './Canvas';
import { LayersPanel } from './LayersPanel';
import { ComponentPanel } from './ComponentPanel';
import { ThemePanel } from './ThemePanel';
import { useEditorStore } from './SelectionManager';
import { useThemeStore } from '../Theming/ThemeContext';
import { useSystemStore } from '../../lib/systemStore';
import { useTemplateManager } from '../../hooks/useTemplateManager';
import { Overlay as EditorOverlay } from './Overlay';
import { Layers, Settings, ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bridge } from './Bridge';
import type { DerivedPage, DerivedSection, PageTemplate } from '../../lib/api';
// SectionInstance type import removed as it was unused

// Helper to convert API DerivedPage to Internal PageTemplate for editing
const derivedToTemplate = (derived: DerivedPage): PageTemplate => {
    return {
        key: `${derived.entityType}-draft`, // mock key
        name: derived.entityName,
        subject_target: derived.entityType,
        subject_cardinality: 'one', 
        sections: derived.sections.map(ds => ({
            id: ds.id,
            placement: ds.placement,
            binding: {
                kind: ds.binding.kind,
                target: ds.binding.target,
                cardinality: ds.binding.cardinality,
                relationKey: ds.binding.relationKey
            },
            presentationKey: ds.presentationKey || 'section.generic.v1',
            overrides: ds.config as any // Treat resolved config as overrides for WYSIWYG
        }))
    };
};

export function VisualEditorShell() {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode') || 'sidebar'; // 'sidebar' | 'overlay'
    const [entities, setEntities] = useState<any[]>([]);
    const [pageId, setPageId] = useState<string>('');
    const { setDerivedPage, derivedPage, select: setSelectedId, selectedId } = useEditorStore();
    const { isSandboxUnlocked } = useSystemStore();
    const [loading, setLoading] = useState(true);
    const [bridge, setBridge] = useState<Bridge | null>(null);

    // Template Manager for Overlay Logic
    const tm = useTemplateManager();

    const baseUrl = 'http://localhost:3003/preview-theme';
    const targetUrl = pageId ? `${baseUrl}?id=${pageId}` : baseUrl;

    const { theme } = useThemeStore();
    const [activeTab, setActiveTab] = useState<'props' | 'theme'>('props');

    // Load entities for navigation
    useEffect(() => {
        api.listEntities()
            .then(data => {
                setEntities(data);
                if (data.length > 0 && !pageId) {
                    setPageId(data[0].id); 
                }
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to list entities", err);
                setLoading(false);
            });
    }, []);

    // Fetch Derived Page Structure when pageId changes
    useEffect(() => {
        if (!pageId) return;
        
        // Inject TM into Store for sync
        useEditorStore.getState().setTemplateManager(tm);

        const entity = entities.find(e => e.id === pageId);
        if (!entity) return;

        console.log("Fetching derived structure for:", entity.slug);
        api.derivePage(entity.slug)
            .then(data => {
                setDerivedPage(data);
                // Sync Template Manager with new page data
                const initialTemplate = derivedToTemplate(data);
                // We need to cast our internal PageTemplate type vs API PageTemplate type
                // They should be compatible enough for this logic
                tm.setTemplate(initialTemplate as any);
            })
            .catch(err => {
                console.error("Failed to derive page", err);
            });
    }, [pageId, entities]); // setDerivedPage, tm are stable

    // Theme Sync: Broadcast theme changes to Canvas
    useEffect(() => {
        if (bridge) {
            bridge.send('set-theme', theme);
        }
    }, [theme, bridge]);

    // Content Sync: When Template Manager changes, update Store DerivedPage (Logic) and Bridge (Visuals)
    useEffect(() => {
        if (!derivedPage) return;
        
        // Map local template back to DerivedPage structure for store/canvas
        // This effectively "hydrates" the view with our local edits
        const updatedSections: DerivedSection[] = tm.template.sections.map((s: any) => ({
            id: s.id,
            placement: s.placement,
            binding: s.binding,
            presentationKey: s.presentationKey,
            config: { ...s.overrides }, // Flatten overrides as config
            entities: [] // We don't have resolved entities here, canvas should handle?
            // Note: If canvas relies on 'entities' for rendering content, this mock might break content preview
            // unless canvas also supports 'config' driven rendering (which Overlay implies).
        }));

        setDerivedPage({
            ...derivedPage,
            sections: updatedSections
        });

        // Send exact update to canvas (supports hot reload)
        if (bridge) bridge.send('VI_UPDATE_CONFIG', tm.template);

    }, [tm.template]);

    const handleSave = async () => {
        if (!pageId || !derivedPage) return;
        
        try {
            const entity = entities.find(e => e.id === pageId);
            if (!entity) return;

            const templateKey = `${entity.type}-default`;

            // Use the authoritative state from TemplateManager
            const templatePayload = {
                key: templateKey,
                name: `${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)} Default`,
                description: `Default template for ${entity.type}`,
                subject_target: entity.type,
                subject_cardinality: 'one',
                sections: tm.template.sections
            };

            try {
                await api.createTemplate(templatePayload as any);
                alert(`Template '${templateKey}' created!`);
            } catch (err: any) {
                if (err.status === 409 || err.message?.includes('exists')) {
                    await api.updateTemplate(templateKey, templatePayload as any);
                    alert(`Template '${templateKey}' updated!`);
                } else {
                    throw err;
                }
            }
        } catch (err) {
            console.error('Failed to save template', err);
            alert('Failed to save template.');
        }
    };

    // --- OVERLAY MODE RENDER ---
    if (mode === 'overlay') {
        // If not unlocked, show blocked state or redirect
        if (!isSandboxUnlocked) {
             return (
                 <div className="flex h-screen items-center justify-center bg-zinc-950 text-white flex-col gap-4">
                     <div className="text-2xl font-bold text-red-500">Locked</div>
                     <p className="text-zinc-500">You must unlock the sandbox environment to access this feature.</p>
                     <Link to="/dashboard" className="px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700">Return to Dashboard</Link>
                 </div>
             )
        }

        const activeSection = tm.template.sections.find((s: any) => s.id === selectedId);
        /* eslint-disable @typescript-eslint/no-unused-vars */
        const singleConfig = activeSection ? (activeSection as any).overrides : null;

        return (
            <div className="relative h-screen bg-zinc-950 overflow-hidden">
                {/* 1. Underlying Canvas (Preview) */}
                <div className="absolute inset-0 z-0">
                     <Canvas url={targetUrl} onBridgeReady={setBridge} />
                </div>

                {/* 2. HUD Overlay */}
                <EditorOverlay 
                    isDebugMode={isSandboxUnlocked}
                    activeSectionId={selectedId}
                    setActiveSectionId={setSelectedId}
                    sectionProgress={0} // Mock progress for now
                    template={tm.template as any}
                    viewMode="desktop"
                    setViewMode={() => {}}
                    
                    // Wire up all mutators from TemplateManager
                    updateSectionHeight={tm.updateSectionHeight}
                    updateSectionPinHeight={tm.updateSectionPinHeight}
                    updateSectionClassName={tm.updateSectionClassName}
                    updateSectionBinding={tm.updateSectionBinding}
                    updateSectionPlacement={tm.updateSectionPlacement}
                    updateSectionPresentation={tm.updateSectionPresentation}
                    addSection={tm.addSection}
                    removeSection={tm.removeSection}
                    
                    singleConfig={singleConfig}
                    updateSingleConfig={(k: any, v: any) => selectedId && tm.updateSingleConfig(selectedId, k, v)}
                    
                    addSceneObject={tm.addSceneObjectToSection}
                    updateSceneObject={tm.updateSceneObjectInSection}
                    removeSceneObject={tm.removeSceneObjectFromSection}
                    duplicateSceneObject={tm.duplicateSceneObjectInSection}
                    toggleSceneObject={tm.toggleSceneObjectInSection}
                />

                {/* 3. Exit / Save Overlay Controls */}
                <div className="absolute top-4 left-4 z-50 flex gap-2">
                     <Link to="/dashboard" className="px-3 py-2 bg-black/80 text-white rounded-lg backdrop-blur-md text-xs font-bold uppercase tracking-wider hover:bg-black transition-colors border border-white/10">
                        Exit Sandbox
                     </Link>
                     <button 
                        onClick={handleSave}
                        className="px-3 py-2 bg-blue-600/90 text-white rounded-lg backdrop-blur-md text-xs font-bold uppercase tracking-wider hover:bg-blue-600 transition-colors border border-blue-500/50 shadow-[0_0_15px_rgba(37,99,235,0.3)] flex items-center gap-2"
                     >
                        <Save className="w-3.5 h-3.5" />
                        Save Changes
                     </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-zinc-950 text-zinc-300 overflow-hidden font-sans">
            {/* Left Sidebar: Navigation & Layers */}
            <div className="w-64 border-r border-zinc-800 flex flex-col bg-zinc-900">
                <div className="h-12 border-b border-zinc-800 flex items-center px-4 gap-2">
                    <Link to="/" className="hover:text-white transition-colors">
                        <ArrowLeft size={16} />
                    </Link>
                    <span className="font-semibold text-white text-sm tracking-wide">Visual Editor</span>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    <LayersPanel sections={derivedPage?.sections || []} />
                </div>
            </div>

            {/* Center: Canvas */}
            <div className="flex-1 flex flex-col relative bg-zinc-950">
                <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-zinc-500 font-mono">View:</span>
                        <select 
                            value={pageId} 
                            onChange={(e) => setPageId(e.target.value)}
                            className="bg-zinc-800 border border-zinc-700 text-xs text-white rounded px-2 py-1 min-w-[200px] outline-none focus:border-indigo-500"
                        >
                            {loading && <option>Loading...</option>}
                            {!loading && entities.length === 0 && <option value="">No entities found</option>}
                            {entities.map(e => (
                                <option key={e.id} value={e.id}>
                                    {e.name} ({e.type})
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex items-center gap-4">
                        <div className="text-xs text-zinc-600 font-mono">
                            {pageId ? `id: ${pageId}` : 'No selection'}
                        </div>
                        <Link 
                             to={`?mode=overlay`}
                             className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded transition-colors"
                        >
                            Open Overlay
                        </Link>
                        <button 
                            onClick={handleSave}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded transition-colors"
                        >
                            <Save size={14} />
                            Save
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative overflow-hidden">
                    <Canvas url={targetUrl} onBridgeReady={setBridge} />
                </div>
            </div>

            {/* Right Sidebar: Properties & Theme */}
            <div className="w-80 border-l border-zinc-800 flex flex-col bg-zinc-900">
                <div className="h-12 border-b border-zinc-800 flex items-center bg-zinc-900 px-1">
                   <button 
                       onClick={() => setActiveTab('props')}
                       className={`flex-1 h-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
                           activeTab === 'props' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                       }`}
                   >
                       <Settings size={14} /> Properties
                   </button>
                   <button 
                       onClick={() => setActiveTab('theme')}
                       className={`flex-1 h-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition-colors ${
                           activeTab === 'theme' ? 'border-emerald-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
                       }`}
                   >
                       <Layers size={14} /> Theme
                   </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {activeTab === 'props' ? <ComponentPanel /> : <ThemePanel />}
                </div>
            </div>
        </div>
    );
}
