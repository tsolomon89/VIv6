
import { useState, useEffect } from 'react';
import { PageTemplate, SectionInstance, Binding, Placement, ShapeType, ConfigState, SceneObject } from '../types';
import { INITIAL_PAGE_TEMPLATE, TEMPLATES, mkParam, DEFAULT_CONFIG } from '../data';
import { validatePageTemplate } from '../utils/validation';
import { PRESET_REGISTRY } from '../presets/registry';
import { matchesSignature } from '../utils/binding';

const STORAGE_KEY = 'vi_page_template_v1_1'; // Bumped for data model change

export const useTemplateManager = () => {
    // Initialize from LocalStorage or Fallback
    const [template, setTemplate] = useState<PageTemplate>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // Basic check - in a real app use schema validation (Zod)
                if (parsed && Array.isArray(parsed.sections)) {
                    console.log("Loaded template from storage.");
                    return parsed;
                }
            }
        } catch (e) {
            console.error("Failed to load template from storage:", e);
        }
        return INITIAL_PAGE_TEMPLATE;
    });

    // Persistence Effect
    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(template));
        } catch (e) {
            console.error("Failed to save template:", e);
        }
    }, [template]);

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
                    
                    // Check if current presentation is compatible with new binding
                    const currentPreset = PRESET_REGISTRY[s.presentationKey];
                    let newKey = s.presentationKey;
                    
                    // If incompatible, try to find a compatible one
                    if (!currentPreset || !matchesSignature(binding, currentPreset.signature)) {
                        const compatible = Object.values(PRESET_REGISTRY).find(p => matchesSignature(binding, p.signature));
                        if (compatible) {
                            newKey = compatible.key;
                        } else {
                            // Fallback to generic if nothing matches (safeguard)
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
        // When changing preset, we should probably clear visual overrides to avoid conflicts,
        // but keeping height/structural overrides might be desired. For now, clear all.
        updateSection(sectionId, { presentationKey, overrides: {} });
    };

    const addSection = () => {
        const newId = `section-${Date.now()}`;
        const newSection: SectionInstance = {
            schemaVersion: 1,
            id: newId,
            placement: { slot: 'free', order: 99 },
            binding: { kind: 'self' },
            presentationKey: 'section.generic.v1',
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

    // Helper: Ensure overrides.children is populated from preset if empty
    const ensureChildrenOverride = (section: SectionInstance): SceneObject[] => {
        if (section.overrides?.children) return section.overrides.children;
        const preset = PRESET_REGISTRY[section.presentationKey];
        // Deep clone preset children to start overriding
        return preset?.config?.children ? JSON.parse(JSON.stringify(preset.config.children)) : [];
    };

    const addSceneObjectToSection = (sectionId: string, shape: ShapeType) => {
        setTemplate(prev => {
            const section = prev.sections.find(s => s.id === sectionId);
            if (!section) return prev;

            const children = ensureChildrenOverride(section);
            const newObj: SceneObject = {
                ...JSON.parse(JSON.stringify(DEFAULT_CONFIG)),
                id: Math.random().toString(36).substr(2, 9),
                shape,
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

            // Note: We modify isExpanded in place in overrides. 
            // If it wasn't in overrides, we fork.
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

    // --- Import/Export ---

    const importTemplate = (jsonString: string): { success: boolean; error?: string } => {
        try {
            const parsed = JSON.parse(jsonString) as PageTemplate;
            const errors = validatePageTemplate(parsed, PRESET_REGISTRY);
            
            if (errors.length > 0) {
                console.error("Import Validation Errors:", errors);
                return { success: false, error: `Validation failed: ${errors[0].message}` };
            }

            setTemplate(parsed);
            return { success: true };
        } catch (e) {
            return { success: false, error: "Invalid JSON format" };
        }
    };

    const loadTemplate = (templateId: string) => {
        const t = TEMPLATES[templateId];
        if (t) {
            if(window.confirm(`Switch to template '${t.name}'? Unsaved changes will be lost.`)) {
                setTemplate(t);
            }
        }
    };

    const resetTemplate = () => {
        if(window.confirm("Reset to default template? This cannot be undone.")) {
            setTemplate(INITIAL_PAGE_TEMPLATE);
        }
    };

    const createBlankPage = () => {
        if (!window.confirm("Create a new blank page? Unsaved changes will be lost.")) return;
        const timestamp = Date.now();
        const blankTemplate: PageTemplate = {
            schemaVersion: 1,
            id: `blank-${timestamp}`,
            name: 'New Page',
            pageContext: { kind: 'detail' },
            pageSubject: { target: 'brand', cardinality: 'one' },
            sections: [
                {
                    schemaVersion: 1,
                    id: `hero-${timestamp}`,
                    placement: { slot: 'start' },
                    binding: { kind: 'self' },
                    presentationKey: 'self.hero.v1',
                    overrides: {}
                },
                {
                    schemaVersion: 1,
                    id: `cta-${timestamp}`,
                    placement: { slot: 'end' },
                    binding: { kind: 'self' },
                    presentationKey: 'self.cta.v1',
                    overrides: {}
                }
            ]
        };
        setTemplate(blankTemplate);
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
        // IO
        importTemplate,
        loadTemplate,
        resetTemplate,
        createBlankPage
    };
};

function safeParam(p: any, def: number) {
    return p || { value: def, endValue: null, isLinked: false };
}
