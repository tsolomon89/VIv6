import React, { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight, Layers, Settings2, Database, Layout, Palette } from 'lucide-react';
import type { Binding } from './BindingControls';
import { BindingControls } from './BindingControls';
import type { Placement } from './PlacementControls';
import { PlacementControls } from './PlacementControls';
import { PresentationControls } from './PresentationControls';
import { ConfigControls } from './ConfigControls';
import type { ConfigState } from './types';

// Section instance type matching Theme's structure
export interface SectionInstance {
    schemaVersion: number;
    id: string;
    placement: Placement;
    binding: Binding;
    presentationKey: string;
    overrides: Partial<ConfigState>;
}

// Template type
export interface PageTemplate {
    schemaVersion: number;
    id: string;
    name: string;
    sections: SectionInstance[];
    themeConfig?: Partial<ConfigState>;
}

interface TemplateEditorPanelProps {
    template: PageTemplate;
    onTemplateChange: (template: PageTemplate) => void;
    onSave?: () => void;
}

/**
 * TemplateEditorPanel - Unified section editor for page templates
 * 
 * Combines:
 * - Section list with add/remove
 * - Binding, Placement, Presentation controls per section
 * - ConfigControls for visual property editing
 */
export function TemplateEditorPanel({ template, onTemplateChange, onSave }: TemplateEditorPanelProps) {
    const [activeSectionId, setActiveSectionId] = useState<string | null>(
        template.sections[0]?.id || null
    );
    const [expandedPanel, setExpandedPanel] = useState<'binding' | 'placement' | 'presentation' | 'config' | null>('config');
    
    const activeSection = template.sections.find(s => s.id === activeSectionId);

    // Section CRUD
    const addSection = () => {
        const newSection: SectionInstance = {
            schemaVersion: 1,
            id: `section-${Date.now()}`,
            placement: { slot: 'free', order: template.sections.length },
            binding: { kind: 'self' },
            presentationKey: 'self.hero.v1',
            overrides: {}
        };
        const updated = { ...template, sections: [...template.sections, newSection] };
        onTemplateChange(updated);
        setActiveSectionId(newSection.id);
    };

    const removeSection = (id: string) => {
        const updated = { 
            ...template, 
            sections: template.sections.filter(s => s.id !== id) 
        };
        onTemplateChange(updated);
        if (activeSectionId === id) {
            setActiveSectionId(updated.sections[0]?.id || null);
        }
    };

    const updateSection = (id: string, updates: Partial<SectionInstance>) => {
        const updated = {
            ...template,
            sections: template.sections.map(s => 
                s.id === id ? { ...s, ...updates } : s
            )
        };
        onTemplateChange(updated);
    };

    const updateSectionOverride = (id: string, key: keyof ConfigState, value: any) => {
        const section = template.sections.find(s => s.id === id);
        if (!section) return;
        
        const newOverrides = { ...section.overrides, [key]: value };
        updateSection(id, { overrides: newOverrides });
    };

    // Panel toggle helper
    const PanelHeader = ({ 
        title, 
        icon: Icon, 
        panelKey 
    }: { 
        title: string; 
        icon: React.ElementType; 
        panelKey: 'binding' | 'placement' | 'presentation' | 'config' 
    }) => (
        <button
            onClick={() => setExpandedPanel(expandedPanel === panelKey ? null : panelKey)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
            <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-white/60" />
                <span className="text-xs font-medium text-white/80">{title}</span>
            </div>
            {expandedPanel === panelKey ? (
                <ChevronDown className="w-4 h-4 text-white/40" />
            ) : (
                <ChevronRight className="w-4 h-4 text-white/40" />
            )}
        </button>
    );

    return (
        <div className="flex flex-col h-full bg-[#121212] text-white">
            {/* Section List Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-white/60" />
                    <span className="text-sm font-semibold">Sections</span>
                    <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">
                        {template.sections.length}
                    </span>
                </div>
                <button
                    onClick={addSection}
                    className="p-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 transition-colors"
                    title="Add Section"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Section Tabs */}
            <div className="flex overflow-x-auto border-b border-white/10 px-2 py-2 gap-1 scrollbar-hide">
                {template.sections.map((section, idx) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSectionId(section.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                            activeSectionId === section.id
                            ? 'bg-white/10 text-white border border-white/20'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                        }`}
                    >
                        <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center text-[10px]">
                            {idx + 1}
                        </span>
                        <span className="truncate max-w-[100px]">
                            {section.presentationKey.split('.').pop() || section.id}
                        </span>
                    </button>
                ))}
            </div>

            {/* Active Section Editor */}
            {activeSection ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Section Actions */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/5">
                        <span className="text-[10px] font-mono text-white/40">{activeSection.id}</span>
                        <button
                            onClick={() => removeSection(activeSection.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors"
                            title="Delete Section"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Binding Panel */}
                    <div className="space-y-2">
                        <PanelHeader title="Data Binding" icon={Database} panelKey="binding" />
                        {expandedPanel === 'binding' && (
                            <div className="pl-2 pt-2">
                                <BindingControls
                                    binding={activeSection.binding}
                                    onChange={(binding) => updateSection(activeSection.id, { binding })}
                                />
                            </div>
                        )}
                    </div>

                    {/* Placement Panel */}
                    <div className="space-y-2">
                        <PanelHeader title="Placement" icon={Layout} panelKey="placement" />
                        {expandedPanel === 'placement' && (
                            <div className="pl-2 pt-2">
                                <PlacementControls
                                    placement={activeSection.placement}
                                    onChange={(placement) => updateSection(activeSection.id, { placement })}
                                />
                            </div>
                        )}
                    </div>

                    {/* Presentation Panel */}
                    <div className="space-y-2">
                        <PanelHeader title="Presentation" icon={Settings2} panelKey="presentation" />
                        {expandedPanel === 'presentation' && (
                            <div className="pl-2 pt-2">
                                <PresentationControls
                                    binding={activeSection.binding}
                                    currentKey={activeSection.presentationKey}
                                    onChange={(key) => updateSection(activeSection.id, { presentationKey: key })}
                                />
                            </div>
                        )}
                    </div>

                    {/* Config Panel */}
                    <div className="space-y-2">
                        <PanelHeader title="Visual Properties" icon={Palette} panelKey="config" />
                        {expandedPanel === 'config' && (
                            <div className="pt-2">
                                <ConfigControls
                                    config={activeSection.overrides as ConfigState}
                                    onChange={(key, value) => updateSectionOverride(activeSection.id, key, value)}
                                    headerOffset={0}
                                />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
                    No sections. Click + to add one.
                </div>
            )}

            {/* Save Button */}
            {onSave && (
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={onSave}
                        className="w-full py-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-medium transition-colors"
                    >
                        Save Template
                    </button>
                </div>
            )}
        </div>
    );
}
