
export type ShapeType = 'tetrahedron' | 'cube' | 'sphere' | 'cylinder' | 'torus' | 'column' | 'lightning' | 'atmosphere' | 'tile' | 'plane' | 'card' | 'list' | 'group';
export type AnimType = 'rotate' | 'hover' | '3drotate' | 'static' | 'marquee';

// Collection Types
export type CollectionLayout = 'stack' | 'grid' | 'marquee';
export type OverflowMode = 'visible' | 'clip';

// Leading Types
export type LeadingPlacement = 'none' | 'left' | 'above';
export type LeadingKind = 'icon' | 'image';
export type LeadingFit = 'cover' | 'contain';

export interface NumberParam {
  value: number;        // Start Value
  endValue: number | null; // End Value (null if single point)
  isLinked: boolean;    // Is linked to scroll?
}

export type RenderPolicy = {
  virtualization?: "none" | "window";
  overscanPx?: number;
  maxItems?: number;
  renderer?: 'dom' | 'webgl';
};

export interface ConfigState {
  // Hierarchy
  children?: SceneObject[];

  // Render Policy
  renderPolicy?: RenderPolicy;

  // Layout Dimensions
  pinHeight?: number; 
  className?: string; // Visual container style (e.g. background color, border radius)

  // Prism Props
  height: NumberParam; // Visual height (geometry) - distinct from layout height
  baseWidth: NumberParam;
  scale: NumberParam;
  glow: NumberParam;
  noise: NumberParam;
  bloom: NumberParam;
  hueShift: NumberParam;
  colorFrequency: NumberParam;
  timeScale: NumberParam;
  animationType: AnimType; 
  shape: ShapeType;        
  hoverStrength: NumberParam;
  inertia: NumberParam;
  offsetX: NumberParam;
  offsetY: NumberParam;
  offsetZ: NumberParam;
  saturation: NumberParam;
  rainbow: NumberParam;
  density: NumberParam;
  opacity: NumberParam;
  rotateX: NumberParam;
  rotateY: NumberParam;
  rotateZ: NumberParam;

  // Marquee Props (Object Animation)
  marqueeSpeed: NumberParam;
  marqueeDirection: NumberParam;

  // Storm Props (Merged)
  hue: NumberParam;
  intensity: NumberParam;
  strikeIntensity: NumberParam;
  frequency: NumberParam;
  speed: NumberParam;
  cloudiness: NumberParam;
  boltWidth: NumberParam;
  zigzag: NumberParam;
  diagonal: NumberParam;
  depth: NumberParam;
  cloudScale: NumberParam;
  flashDuration: NumberParam;
  boltDuration: NumberParam;
  boltGlow: NumberParam;
  
  // Tile Content
  tileHeading: string;
  tileLabel: string;
  tileSubtitle: string;
  tileTrailing: string;
  tileTrailingIcon: string;
  tileAlign: 'left' | 'center' | 'right';
  tileTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'div';

  // --- LEADING MODEL (Unified) ---
  leadingPlacement: LeadingPlacement;
  leadingKind: LeadingKind;
  leadingIcon: string; // Icon ID from registry
  leadingImage: string; // Src path
  leadingSize: NumberParam; // Shared size/height
  leadingGap: NumberParam; // Spacing from text
  leadingOpacity: NumberParam;
  leadingRadius: NumberParam; // Mask radius
  leadingFit: LeadingFit;
  leadingPadding: NumberParam;
  leadingBackground: string;
  leadingColor: string;
  
  // Advanced Typography Styles
  headingSize: NumberParam;
  headingSpacing: NumberParam;
  headingHeight: NumberParam;
  headingColor: string;
  
  labelSize: NumberParam;
  labelSpacing: NumberParam;
  labelColor: string;
  
  subSize: NumberParam;
  subColor: string;
  
  // Plane & Card Props
  textureUrl: string; // Shared with Card Image (Background)
  sizingMode: 'cover' | 'contain' | 'native';
  borderRadius: NumberParam; // For Prism Plane (0-1)
  
  // Card Specific Props (DOM)
  cardWidth: NumberParam;
  cardHeight: NumberParam;
  cardRadius: string; // CSS String (e.g. "100px 0 40px 0")
  cardBackground: string;
  cardPadding: NumberParam;
  cardBorder: string; // CSS Border string (Legacy DOM)
  
  // Card M3 New Defaults
  cardElevation: NumberParam; // 0-5 Shadow Level
  cardOpacity: NumberParam; // Surface Opacity
  cardClip: boolean; // Overflow clip
  cardMediaSrc: string; // Top Media Slot (distinct from textureUrl background)
  cardMediaFit: 'cover' | 'contain' | 'native';
  cardMediaHeight: NumberParam;
  
  // Card Styling (New)
  cardBorderWidth: NumberParam;
  cardBorderColor: string;

  // --- LIST / COLLECTION MODEL ---
  // If shape === 'list', these apply
  listLayout: CollectionLayout; // stack, grid, marquee
  listTemplate: Partial<ConfigState>; // Base config for items
  listItems: any[]; // Array of overrides
  
  // Grid/Stack Params
  listCount: NumberParam; // Limit
  listGap: NumberParam; 
  listColumns: NumberParam; // Grid cols
  listRows: NumberParam; // Grid rows per page
  listPage: NumberParam; // Current page index (0-based)
  
  // Marquee Specifics
  listSpeed: NumberParam;
  listDirection: NumberParam; // 1 or -1
  listRadiusPattern: string; // Pipe-separated string: "100px 0 0 0 | 40px" for alternating radii
  
  marqueeHoverPause: boolean; 
  
  // Fine-grained Hover Effects
  itemHoverScale: NumberParam; // 1.05
  itemBaseGrayscale: NumberParam; // 0 to 1
  itemHoverGrayscale: NumberParam; // 0 to 1
  listSmoothness: NumberParam; // 0.01 - 1.0 (Lerp factor for hover transitions)
  
  // Rendering
  bufferPx: NumberParam;
  containerOverflow: OverflowMode;
  itemOverflow: OverflowMode;
  clipWithinSection: boolean; // If true, applies overflow hidden to container
}

export interface SceneObject extends ConfigState {
  id: string;
  isExpanded: boolean;
  children?: SceneObject[];
}

export interface SectionConfig {
    id: string;
    height: number;     // Total scroll height (Chapter length)
    pinHeight: number;  // Sticky viewport height
    objects: SceneObject[];
}

// --- NEW DATA MODEL (v1.1) ---

export type EntityType = "brand" | "product" | "feature" | "solution" | "useCase";

export type PageContext = {
  kind: "detail" | "index";
};

export type PageSubject = {
  target: EntityType;
  cardinality: "one" | "many";
};

export type Binding =
  | { kind: "self" }
  | {
      kind: "related";
      target: EntityType;
      cardinality: "one" | "many";
      relationKey?: string;
      scope?: {
        limit?: number;
        sort?: string;
        filter?: Record<string, unknown>;
      };
    };

export type Placement = {
  slot: "start" | "end" | "free";
  order?: number; // only meaningful when slot === "free"
};

export type BindingSignature =
  | { kind: "self" }
  | { kind: "related"; target: EntityType; cardinality: "one" | "many"; relationKey?: string };

// Re-using ConfigState as the visual config payload for now.
export type SectionVisualConfig = ConfigState; 

export type PresentationPreset = {
  key: string;
  signature: BindingSignature;
  config: Partial<SectionVisualConfig>; // Presets might not specify everything
};

export type SectionInstance = {
  schemaVersion: 1;
  id: string;
  placement: Placement;
  binding: Binding;
  presentationKey: string;
  overrides?: Partial<SectionVisualConfig>;
};

export type PageTemplate = {
  schemaVersion: 1;
  id: string;
  name: string;
  pageContext: PageContext;
  pageSubject: PageSubject;
  sections: SectionInstance[];
};

export type PresetRegistry = Record<string, PresentationPreset>;
