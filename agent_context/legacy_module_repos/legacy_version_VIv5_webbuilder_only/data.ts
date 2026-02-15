
import { ConfigState, NumberParam, SceneObject, PageTemplate } from './types';

// --- Content Data (Re-exported for mock resolution) ---
export const projects = [
  { 
    title: "Neo Tokyo Art Fair", 
    category: "Branding", 
    year: "2024",
    image: "https://images.unsplash.com/photo-1547891654-e66ed7ebb968?q=80&w=2670&auto=format&fit=crop"
  },
  { 
    title: "Cyber Zen Garden", 
    category: "Web Design", 
    year: "2023",
    image: "https://images.unsplash.com/photo-1515462277126-2dd0c162007a?q=80&w=2576&auto=format&fit=crop"
  },
  { 
    title: "Type Foundry X", 
    category: "Typography", 
    year: "2023",
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=2000&auto=format&fit=crop"
  },
  { 
    title: "Mono Coffee", 
    category: "Packaging", 
    year: "2023",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2670&auto=format&fit=crop"
  }
];

export const sliderImages = [
  "https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2700&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=2670&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1634152962476-4b8a00e1915c?q=80&w=2500&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=2500&auto=format&fit=crop", 
];

// --- Helper Functions ---
export const mkParam = (val: number): NumberParam => ({ value: val, endValue: null, isLinked: false });

export const DEFAULT_CONFIG: ConfigState = {
  children: [],
  renderPolicy: { virtualization: 'window', overscanPx: 100 },
  pinHeight: 800,
  className: "bg-white",
  
  // Prism Defaults
  height: mkParam(1),
  baseWidth: mkParam(1),
  scale: mkParam(100),
  glow: mkParam(1),
  noise: mkParam(0.5),
  bloom: mkParam(1),
  hueShift: mkParam(0),
  colorFrequency: mkParam(1),
  timeScale: mkParam(0.5),
  animationType: 'static',
  shape: 'tetrahedron',
  hoverStrength: mkParam(2),
  inertia: mkParam(0.05),
  offsetX: mkParam(0),
  offsetY: mkParam(0),
  offsetZ: mkParam(0),
  saturation: mkParam(1.1),
  rainbow: mkParam(1.0),
  density: mkParam(0.2),
  opacity: mkParam(1.0),
  rotateX: mkParam(0),
  rotateY: mkParam(0),
  rotateZ: mkParam(0),

  // Marquee Props
  marqueeSpeed: mkParam(1.0),
  marqueeDirection: mkParam(1.0),

  // Storm Defaults
  hue: mkParam(220),
  intensity: mkParam(1.5),
  strikeIntensity: mkParam(1.0),
  frequency: mkParam(1.0),
  speed: mkParam(1.0),
  cloudiness: mkParam(0.5),
  boltWidth: mkParam(1.0),
  zigzag: mkParam(1.0),
  diagonal: mkParam(0.0),
  depth: mkParam(0.0),
  cloudScale: mkParam(1.0),
  flashDuration: mkParam(1.0),
  boltDuration: mkParam(0.5),
  boltGlow: mkParam(1.0),
  
  // Tile Defaults
  tileHeading: '',
  tileLabel: '',
  tileSubtitle: '',
  tileTrailing: '',
  tileTrailingIcon: '',
  tileAlign: 'center',
  tileTag: 'div',
  
  // Leading Model (New)
  leadingPlacement: 'none',
  leadingKind: 'icon',
  leadingIcon: '',
  leadingImage: '',
  leadingSize: mkParam(40),
  leadingGap: mkParam(12),
  leadingOpacity: mkParam(1),
  leadingRadius: mkParam(0),
  leadingFit: 'cover',
  leadingPadding: mkParam(0),
  leadingBackground: 'transparent',
  leadingColor: '',

  // Typography Defaults
  headingSize: mkParam(120),
  headingSpacing: mkParam(-0.05),
  headingHeight: mkParam(0.9),
  headingColor: '#ffffff',
  labelSize: mkParam(12),
  labelSpacing: mkParam(0.2),
  labelColor: 'rgba(255,255,255,0.6)',
  subSize: mkParam(18),
  subColor: 'rgba(255,255,255,0.6)',
  
  // Plane Defaults
  textureUrl: '',
  sizingMode: 'cover',
  borderRadius: mkParam(0),

  // Card Defaults
  cardWidth: mkParam(400),
  cardHeight: mkParam(560),
  cardRadius: '40px',
  cardBackground: '#ffffff',
  cardPadding: mkParam(0),
  cardBorder: 'none',
  
  // Card M3 New Defaults
  cardElevation: mkParam(0),
  cardOpacity: mkParam(1),
  cardClip: true,
  cardMediaSrc: '',
  cardMediaFit: 'cover',
  cardMediaHeight: mkParam(200),
  cardBorderWidth: mkParam(0),
  cardBorderColor: '#ffffff',

  // List / Collection Defaults
  listLayout: 'stack',
  listTemplate: {}, 
  listItems: [],
  listCount: mkParam(100),
  listGap: mkParam(24),
  listColumns: mkParam(3),
  listRows: mkParam(2),
  listPage: mkParam(0),
  listSpeed: mkParam(1.0),
  listDirection: mkParam(1.0),
  listRadiusPattern: '', 
  
  marqueeHoverPause: true,
  itemHoverScale: mkParam(1.05),
  itemBaseGrayscale: mkParam(0),
  itemHoverGrayscale: mkParam(0),
  listSmoothness: mkParam(0.1),
  
  bufferPx: mkParam(100),
  containerOverflow: 'visible',
  itemOverflow: 'visible',
  clipWithinSection: true
};

export const createObj = (overrides: Partial<SceneObject>): SceneObject => {
  const base = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  // Ensure template exists if creating a list
  if (overrides.shape === 'list' && !overrides.listTemplate) {
      overrides.listTemplate = { shape: 'card' }; // Default template
  }
  return { 
      ...base, 
      ...overrides, 
      id: Math.random().toString(36).substr(2, 9), 
      isExpanded: overrides.isExpanded ?? false,
      children: overrides.children || []
  };
};

// --- INITIAL PAGE TEMPLATE (v1.1 Data Model) ---
export const INITIAL_PAGE_TEMPLATE: PageTemplate = {
    schemaVersion: 1,
    id: 'demo-landing',
    name: 'Demo Landing Page',
    pageContext: { kind: 'detail' }, 
    pageSubject: { target: 'brand', cardinality: 'one' }, 
    
    sections: [
        {
            schemaVersion: 1,
            id: 'hero-section',
            placement: { slot: 'start' },
            binding: { kind: 'self' },
            presentationKey: 'self.hero.v1',
            overrides: { 
                height: { value: 1500, endValue: null, isLinked: false },
                className: "bg-[#1A1A1B]" // Default dark
            } 
        },
        {
            schemaVersion: 1,
            id: 'use-cases-section',
            placement: { slot: 'free', order: 1 },
            binding: { kind: 'related', target: 'useCase', cardinality: 'many' }, 
            presentationKey: 'related.useCase.many.grid.v1',
            overrides: { 
                height: { value: 1600, endValue: null, isLinked: false },
                className: "bg-white rounded-t-3xl md:rounded-t-[4rem]" // Migration of hardcoded style
            }
        },
        {
            schemaVersion: 1,
            id: 'products-section',
            placement: { slot: 'free', order: 2 },
            binding: { kind: 'related', target: 'product', cardinality: 'many' },
            presentationKey: 'related.product.many.marquee.v1',
            overrides: { 
                height: { value: 2400, endValue: null, isLinked: false }, // Increased height
                className: "bg-white"
                // No listItems overrides! Content comes from binding.
            } 
        },
        {
            schemaVersion: 1,
            id: 'features-section',
            placement: { slot: 'free', order: 3 },
            binding: { kind: 'related', target: 'feature', cardinality: 'many' },
            presentationKey: 'related.feature.many.grid.v1',
            overrides: { 
                height: { value: 3200, endValue: null, isLinked: false }, // Increased height significantly for 2-col grid
                className: "bg-white"
            } 
        },
        {
            schemaVersion: 1,
            id: 'solutions-section',
            placement: { slot: 'free', order: 4 },
            binding: { kind: 'related', target: 'solution', cardinality: 'many' },
            presentationKey: 'related.solution.many.grid.v1',
            overrides: { 
                height: { value: 2600, endValue: null, isLinked: false }, // Increased height
                className: "bg-neutral-50" // Migration of hardcoded style
            } 
        },
        {
            schemaVersion: 1,
            id: 'cta-section',
            placement: { slot: 'end' },
            binding: { kind: 'self' },
            presentationKey: 'self.cta.v1',
            overrides: { 
                height: { value: 1600, endValue: null, isLinked: false }, // Increased height
                className: "bg-black" // Migration of hardcoded style
            } 
        }
    ]
};

// --- MINIMAL PAGE TEMPLATE (For Switching) ---
export const MINIMAL_PAGE_TEMPLATE: PageTemplate = {
    schemaVersion: 1,
    id: 'minimal-landing',
    name: 'Minimal Landing Page',
    pageContext: { kind: 'detail' }, 
    pageSubject: { target: 'brand', cardinality: 'one' }, 
    
    sections: [
        {
            schemaVersion: 1,
            id: 'hero-section',
            placement: { slot: 'start' },
            binding: { kind: 'self' },
            presentationKey: 'self.hero.v1',
            overrides: { 
                height: { value: 1500, endValue: null, isLinked: false },
                className: "bg-[#1A1A1B]"
            } 
        },
        {
            schemaVersion: 1,
            id: 'cta-section',
            placement: { slot: 'end' },
            binding: { kind: 'self' },
            presentationKey: 'self.cta.v1', 
            overrides: { 
                height: { value: 800, endValue: null, isLinked: false },
                className: "bg-black"
            } 
        }
    ]
};

export const TEMPLATES: Record<string, PageTemplate> = {
    'demo-landing': INITIAL_PAGE_TEMPLATE,
    'minimal-landing': MINIMAL_PAGE_TEMPLATE
};
