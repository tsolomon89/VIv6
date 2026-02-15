import { create } from 'zustand';
import type { DerivedPage } from '../../lib/api';

interface EditorState {
  // Selection
  selectedId: string | null;
  hoveredId: string | null;
  breadcrumb: string[]; // Ancestry of selected element
  derivedPage: DerivedPage | null; // Full page structure

  // Viewport (for Canvas mode)
  viewport: 'desktop' | 'tablet' | 'mobile';
  
  // Actions
  select: (id: string | null) => void;
  hover: (id: string | null) => void;
  setViewport: (view: 'desktop' | 'tablet' | 'mobile') => void;
  setDerivedPage: (page: DerivedPage | null) => void;
  updateSectionConfig: (sectionId: string, updates: Record<string, any>) => void;
  setTemplateManager: (tm: any) => void;
}

let templateManager: any = null;

export const useEditorStore = create<EditorState>((set) => ({
  selectedId: null,
  hoveredId: null,
  breadcrumb: [],
  viewport: 'desktop',
  derivedPage: null,

  select: (id: string | null) => set({ selectedId: id }),
  hover: (id: string | null) => set({ hoveredId: id }),
  setViewport: (viewport: 'desktop' | 'tablet' | 'mobile') => set({ viewport }),
  setDerivedPage: (page) => set({ derivedPage: page }),
  setTemplateManager: (tm) => { templateManager = tm; },
  
  updateSectionConfig: (sectionId, updates) => set((state) => {
    // 1. Update Template Manager (Source of Truth for Persistence)
    if (templateManager) {
        // Iterate updates and apply to TM
        Object.entries(updates).forEach(([key, value]) => {
            templateManager.updateSingleConfig(sectionId, key, value);
        });
    }

    // 2. Update Local Optimistic State (for UI responsiveness)
    if (!state.derivedPage) return state;

    const sections = state.derivedPage.sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, config: { ...s.config, ...updates } };
      }
      return s;
    });

    return { derivedPage: { ...state.derivedPage, sections } };
  }),
}));
