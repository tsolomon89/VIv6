import { PageTemplate, ConfigState } from '../types';
import { DEFAULT_CONFIG } from '../data';

// Define the global window type extension
declare global {
  interface Window {
    VI_CONFIG?: PageTemplate;
  }
}

/**
 * Loads the Page Config from the build injection (window.VI_CONFIG).
 * Falls back to DEFAULT_CONFIG (mock data) if not present (Dev Mode).
 */
export function loadPageConfig(): PageTemplate {
  if (typeof window !== 'undefined' && window.VI_CONFIG) {
    console.log("⚡ [VI] Config Hydrated from Build");
    return window.VI_CONFIG;
  }

  console.warn("⚠️ [VI] No config found, using DEFAULT (Dev Mode)");
  
  // Wrap the legacy DEFAULT_CONFIG in a PageTemplate structure for compatibility
  // This allows the old "ConfigState" to look like a "PageTemplate" with one section
  return {
    schemaVersion: 1,
    id: 'dev-preview',
    name: 'Dev Preview',
    pageContext: { kind: 'index' },
    pageSubject: { target: 'brand', cardinality: 'one' },
    sections: [
      {
        schemaVersion: 1,
        id: 'hero-section',
        placement: { slot: 'start' },
        binding: { kind: 'self' },
        presentationKey: 'hero.default',
        overrides: DEFAULT_CONFIG as unknown as Partial<ConfigState> // Legacy Cast
      }
    ],
    themeConfig: DEFAULT_CONFIG as unknown as Partial<ConfigState>
  };
}
