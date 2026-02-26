
import { useState } from 'react';
import type { PageTemplate, SectionInstance, Binding, Placement, ConfigState, SceneObject } from '../lib/types';
import { INITIAL_PAGE_TEMPLATE, mkParam, DEFAULT_CONFIG } from '../lib/data';
import { PRESET_REGISTRY } from '../lib/presets/registry';
import { matchesSignature } from '../lib/utils/binding';

// Helper: safe param creation
function safeParam(p: any, def: number) {
    return p || { value: def, endValue: null, isLinked: false };
}

export const useTemplateManager = () => {
    // Initialize with default, but allow external setting
    const [template, setTemplate] = useState<PageTemplate>(INITIAL_PAGE_TEMPLATE);

    const updateSection = (sectionId: string, updates: Partial<SectionInstance>) => {
        setTemplate(prev => ({
            ...prev,
            sections: prev.sections.map(s => 
                s.id === sectionId ? { ...s, ...updates } : s
            )
        }));
    };

    // --- Structural Updates ---

    const updateSectionBinding = (sectionId: string, binding: Binding) => {
        setTemplate(prev => {
            return {
                ...prev,
                sections: prev.sections.map(s => {
                    if (s.id !== sectionId) return s;
                    
                    const currentPreset = PRESET_REGISTRY[s.presentationKey];
                    let newKey = s.presentationKey;
                    
                    if (!currentPreset || !matchesSignature(binding, currentPreset.signature)) {
                        const compatible = Object.values(PRESET_REGISTRY).find(p => matchesSignature(binding, p.signature));
                        if (compatible) {
                            newKey = compatible.key;
                        } else {
                            newKey = 'section.generic.v1'; 
                        }
                    }

                    return { ...s, binding, presentationKey: newKey };
                })
            };
        });
    };

    const updateSectionPlacement = (sectionId: string, placement: Placement) => {
        updateSection(sectionId, { placement });
    };

    const updateSectionPresentation = (sectionId: string, presentationKey: string) => {
        updateSection(sectionId, { presentationKey, overrides: {} });
    };

    const addSection = (presetKey?: string) => {
        const newId = `section-${Date.now()}`;

        // Determine binding and presentation from preset if provided
        let binding: Binding = { kind: 'self' };
        let presentationKey = 'section.generic.v1';

        if (presetKey) {
            const preset = PRESET_REGISTRY[presetKey];
            if (preset) {
                presentationKey = presetKey;
                // Infer binding from preset signature
                if (preset.signature.kind === 'related') {
                    binding = {
                        kind: 'related',
                        target: preset.signature.target || 'product',
                        cardinality: preset.signature.cardinality || 'many'
                    };
                }
            }
        }

        const newSection: SectionInstance = {
            schemaVersion: 1,
            id: newId,
            placement: { slot: 'free', order: 99 },
            binding,
            presentationKey,
            overrides: {}
        };

        setTemplate(prev => ({
            ...prev,
            sections: [...prev.sections, newSection]
        }));

        return newId;
    };

    const removeSection = (sectionId: string) => {
        if (window.confirm("Are you sure you want to remove this section?")) {
            setTemplate(prev => ({
                ...prev,
                sections: prev.sections.filter(s => s.id !== sectionId)
            }));
        }
    };

    const updateSectionHeight = (sectionId: string, height: number) => {
        setTemplate(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    overrides: {
                        ...s.overrides,
                        height: { ...safeParam(s.overrides?.height, height), value: height }
                    }
                };
            })
        }));
    };

    const updateSectionPinHeight = (sectionId: string, pinHeight: number) => {
        setTemplate(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    overrides: {
                        ...s.overrides,
                        pinHeight
                    }
                };
            })
        }));
    };
    
    const updateSectionClassName = (sectionId: string, className: string) => {
        setTemplate(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    overrides: {
                        ...s.overrides,
                        className
                    }
                };
            })
        }));
    };

    // --- Content/Scene Updates (Copy-on-Write) ---

    const ensureChildrenOverride = (section: SectionInstance): SceneObject[] => {
        if (section.overrides?.children) return section.overrides.children;
        const preset = PRESET_REGISTRY[section.presentationKey];
        return preset?.config?.children ? JSON.parse(JSON.stringify(preset.config.children)) : [];
    };

    const addSceneObjectToSection = (sectionId: string, _parentId?: string) => {
        setTemplate(prev => {
            const section = prev.sections.find(s => s.id === sectionId);
            if (!section) return prev;

            const children = ensureChildrenOverride(section);
            // If parentId is provided, we might want to add as child of that object? 
            // For now, we ignore parentId and add to root children as flat list or just simple nesting not fully implemented.
            
            const newObj: SceneObject = {
                ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
                id: Math.random().toString(36).substr(2, 9),
                shape: 'sphere', // Default shape
                isExpanded: true,
                hueShift: mkParam(Math.random() * 6.28),
            };

            return {
                ...prev,
                sections: prev.sections.map(s => s.id === sectionId ? {
                    ...s,
                    overrides: { ...s.overrides, children: [newObj, ...children] }
                } : s)
            };
        });
    };

    const updateSceneObjectInSection = (sectionId: string, objectId: string, key: keyof ConfigState, value: any) => {
        setTemplate(prev => {
            const section = prev.sections.find(s => s.id === sectionId);
            if (!section) return prev;

            const children = ensureChildrenOverride(section);
            const updatedChildren = children.map(obj => 
                obj.id === objectId ? { ...obj, [key]: value } : obj
            );

            return {
                ...prev,
                sections: prev.sections.map(s => s.id === sectionId ? {
                    ...s,
                    overrides: { ...s.overrides, children: updatedChildren }
                } : s)
            };
        });
    };

    const removeSceneObjectFromSection = (sectionId: string, objectId: string) => {
        setTemplate(prev => {
            const section = prev.sections.find(s => s.id === sectionId);
            if (!section) return prev;

            const children = ensureChildrenOverride(section);
            const filteredChildren = children.filter(obj => obj.id !== objectId);

            return {
                ...prev,
                sections: prev.sections.map(s => s.id === sectionId ? {
                    ...s,
                    overrides: { ...s.overrides, children: filteredChildren }
                } : s)
            };
        });
    };

    const duplicateSceneObjectInSection = (sectionId: string, objectId: string) => {
        setTemplate(prev => {
            const section = prev.sections.find(s => s.id === sectionId);
            if (!section) return prev;

            const children = ensureChildrenOverride(section);
            const index = children.findIndex(o => o.id === objectId);
            if (index === -1) return prev;

            const copy = { ...JSON.parse(JSON.stringify(children[index])), id: Math.random().toString(36).substr(2, 9) };
            const newChildren = [...children];
            newChildren.splice(index + 1, 0, copy);

            return {
                ...prev,
                sections: prev.sections.map(s => s.id === sectionId ? {
                    ...s,
                    overrides: { ...s.overrides, children: newChildren }
                } : s)
            };
        });
    };

    const toggleSceneObjectInSection = (sectionId: string, objectId: string) => {
        setTemplate(prev => {
            const section = prev.sections.find(s => s.id === sectionId);
            if (!section) return prev;

            const children = ensureChildrenOverride(section);
            const updatedChildren = children.map(obj => 
                obj.id === objectId ? { ...obj, isExpanded: !obj.isExpanded } : obj
            );

            return {
                ...prev,
                sections: prev.sections.map(s => s.id === sectionId ? {
                    ...s,
                    overrides: { ...s.overrides, children: updatedChildren }
                } : s)
            };
        });
    };

    // --- Single Config Logic (for EditorOverlay to update active section) ---
    // This is missing in original hook, usually managed by component, but useful here.
    const updateSingleConfig = (sectionId: string, key: keyof ConfigState, value: any) => {
         setTemplate(prev => ({
            ...prev,
            sections: prev.sections.map(s => {
                if (s.id !== sectionId) return s;
                return {
                    ...s,
                    overrides: { ...s.overrides, [key]: value }
                };
            })
        }));
    };

    return {
        template,
        setTemplate,
        // Structure
        updateSection,
        updateSectionBinding,
        updateSectionPlacement,
        updateSectionPresentation,
        updateSectionHeight,
        updateSectionPinHeight,
        updateSectionClassName,
        addSection,
        removeSection,
        // Content
        addSceneObjectToSection,
        updateSceneObjectInSection,
        removeSceneObjectFromSection,
        duplicateSceneObjectInSection,
        toggleSceneObjectInSection,
        updateSingleConfig
    };
};
