/**
 * Webbuilder Types Module
 *
 * Ported from legacy VIv5 webbuilder for integration with the asset generation system.
 * These types define the structure for page composition, section instances, and presentation presets.
 */

import type { EntityType as VIEntityType } from '../../core/types.js';

// ============================================================================
// Shape & Animation Types
// ============================================================================

export type ShapeType =
  | 'tetrahedron' | 'cube' | 'sphere' | 'cylinder' | 'torus' | 'column'
  | 'lightning' | 'atmosphere' | 'tile' | 'plane' | 'card' | 'list' | 'group';

export type AnimType = 'rotate' | 'hover' | '3drotate' | 'static' | 'marquee';

export type CollectionLayout = 'stack' | 'grid' | 'marquee';
export type OverflowMode = 'visible' | 'clip';
export type LeadingPlacement = 'none' | 'left' | 'above';
export type LeadingKind = 'icon' | 'image';
export type LeadingFit = 'cover' | 'contain';

// ============================================================================
// Core Primitives
// ============================================================================

/**
 * NumberParam enables scroll-reactive animation binding.
 * When isLinked is true, the value interpolates between value and endValue
 * based on section scroll progress (0% to 100%).
 */
export interface NumberParam {
  value: number;
  endValue: number | null;
  isLinked: boolean;
}

export type RenderPolicy = {
  virtualization?: 'none' | 'window';
  overscanPx?: number;
  maxItems?: number;
  renderer?: 'dom' | 'webgl';
};

// ============================================================================
// ConfigState - Visual Configuration (70+ properties)
// ============================================================================

export interface ConfigState {
  // Hierarchy
  children?: SceneObject[];

  // Render Policy
  renderPolicy?: RenderPolicy;

  // Layout Dimensions
  height: NumberParam;
  pinHeight?: number;
  className?: string;

  // Prism/Geometry Props
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

  // Marquee Props
  marqueeSpeed: NumberParam;
  marqueeDirection: NumberParam;

  // Storm/Atmosphere Props
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

  // Leading Model (Icon/Image before text)
  leadingPlacement: LeadingPlacement;
  leadingKind: LeadingKind;
  leadingIcon: string;
  leadingImage: string;
  leadingSize: NumberParam;
  leadingGap: NumberParam;
  leadingOpacity: NumberParam;
  leadingRadius: NumberParam;
  leadingFit: LeadingFit;
  leadingPadding: NumberParam;
  leadingBackground: string;
  leadingColor: string;

  // Typography
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
  textureUrl: string;
  sizingMode: 'cover' | 'contain' | 'native';
  borderRadius: NumberParam;

  // Card DOM Props
  cardWidth: NumberParam;
  cardHeight: NumberParam;
  cardRadius: string;
  cardBackground: string;
  cardPadding: NumberParam;
  cardBorder: string;
  cardElevation: NumberParam;
  cardOpacity: NumberParam;
  cardClip: boolean;
  cardMediaSrc: string;
  cardMediaFit: 'cover' | 'contain' | 'native';
  cardMediaHeight: NumberParam;
  cardBorderWidth: NumberParam;
  cardBorderColor: string;

  // List/Collection Props
  listLayout: CollectionLayout;
  listTemplate: Partial<ConfigState>;
  listItems: unknown[];
  listCount: NumberParam;
  listGap: NumberParam;
  listColumns: NumberParam;
  listRows: NumberParam;
  listPage: NumberParam;
  listSpeed: NumberParam;
  listDirection: NumberParam;
  listRadiusPattern: string;
  marqueeHoverPause: boolean;
  itemHoverScale: NumberParam;
  itemBaseGrayscale: NumberParam;
  itemHoverGrayscale: NumberParam;
  listSmoothness: NumberParam;
  bufferPx: NumberParam;
  containerOverflow: OverflowMode;
  itemOverflow: OverflowMode;
  clipWithinSection: boolean;
}

/**
 * SceneObject is the runtime hierarchy node.
 * Extends ConfigState with identity and tree state.
 */
export interface SceneObject extends ConfigState {
  id: string;
  isExpanded: boolean;
  children?: SceneObject[];
}

// ============================================================================
// Page Template Model (v1.1)
// ============================================================================

/**
 * Webbuilder entity types for binding targets.
 * Maps to VIv5 ENTITY_TYPES but constrained to content entities.
 */
export type WebbuilderEntityType = 'brand' | 'product' | 'feature' | 'solution' | 'useCase';

/**
 * PageContext defines whether the page shows detail (single item) or index (list).
 */
export type PageContext = {
  kind: 'detail' | 'index';
};

/**
 * PageSubject defines what entity the page is about.
 */
export type PageSubject = {
  target: WebbuilderEntityType;
  cardinality: 'one' | 'many';
};

/**
 * Binding defines the semantic relationship between a section and data.
 * - 'self': Section displays the page's own subject entity
 * - 'related': Section displays related entities (products, features, etc.)
 */
export type Binding =
  | { kind: 'self' }
  | {
      kind: 'related';
      target: WebbuilderEntityType;
      cardinality: 'one' | 'many';
      relationKey?: string;
      scope?: {
        limit?: number;
        sort?: string;
        filter?: Record<string, unknown>;
      };
    };

/**
 * Placement defines where a section appears in the page.
 * - 'start': Hero section (max 1)
 * - 'end': CTA section (max 1)
 * - 'free': Content sections ordered by 'order' field
 */
export type Placement = {
  slot: 'start' | 'end' | 'free';
  order?: number;
};

/**
 * BindingSignature is the compatibility key for preset matching.
 * Derived from Binding by dropping scope details.
 */
export type BindingSignature =
  | { kind: 'self' }
  | { kind: 'related'; target: WebbuilderEntityType; cardinality: 'one' | 'many'; relationKey?: string };

/**
 * SectionVisualConfig is the visual configuration payload.
 * Currently equivalent to ConfigState.
 */
export type SectionVisualConfig = ConfigState;

/**
 * PresentationPreset is a reusable visual template for sections.
 * Contains a signature for binding compatibility and a config for rendering.
 */
export interface PresentationPreset {
  key: string;
  signature: BindingSignature;
  config: Partial<SectionVisualConfig>;
}

/**
 * SectionInstance is a declarative section definition within a page.
 * References a preset by key and can override visual properties.
 */
export interface SectionInstance {
  schemaVersion: 1;
  id: string;
  placement: Placement;
  binding: Binding;
  presentationKey: string;
  overrides?: Partial<SectionVisualConfig>;
}

/**
 * PageTemplate is the full page composition structure.
 * Defines context, subject, and ordered sections.
 */
export interface PageTemplate {
  schemaVersion: 1;
  id: string;
  name: string;
  pageContext: PageContext;
  pageSubject: PageSubject;
  sections: SectionInstance[];
}

/**
 * PresetRegistry maps preset keys to their definitions.
 */
export type PresetRegistry = Record<string, PresentationPreset>;

// ============================================================================
// Database Row Types
// ============================================================================

export interface PresentationPresetRow {
  id: string;
  key: string;
  name: string;
  signature: string; // JSON string
  config: string;    // JSON string
  version: number;
  content_hash: string | null;
  account_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageTemplateRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
  subject_target: string | null;
  subject_cardinality: string | null;
  sections: string; // JSON string
  content_hash: string | null;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a NumberParam with default values.
 */
export function mkParam(value: number, endValue: number | null = null, isLinked = false): NumberParam {
  return { value, endValue, isLinked };
}

/**
 * Create a default ConfigState.
 * All NumberParams start at sensible defaults.
 */
export function createDefaultConfig(): Partial<ConfigState> {
  return {
    height: mkParam(100),
    baseWidth: mkParam(1),
    scale: mkParam(1),
    glow: mkParam(0),
    noise: mkParam(0),
    bloom: mkParam(0),
    hueShift: mkParam(0),
    colorFrequency: mkParam(1),
    timeScale: mkParam(1),
    animationType: 'static',
    shape: 'cube',
    hoverStrength: mkParam(0),
    inertia: mkParam(0.9),
    offsetX: mkParam(0),
    offsetY: mkParam(0),
    offsetZ: mkParam(0),
    saturation: mkParam(1),
    rainbow: mkParam(0),
    density: mkParam(1),
    opacity: mkParam(1),
    rotateX: mkParam(0),
    rotateY: mkParam(0),
    rotateZ: mkParam(0),
    tileHeading: '',
    tileLabel: '',
    tileSubtitle: '',
    tileTrailing: '',
    tileTrailingIcon: '',
    tileAlign: 'left',
    tileTag: 'h2',
    leadingPlacement: 'none',
    leadingKind: 'icon',
    leadingIcon: '',
    leadingImage: '',
    leadingSize: mkParam(24),
    leadingGap: mkParam(8),
    leadingOpacity: mkParam(1),
    leadingRadius: mkParam(0),
    leadingFit: 'contain',
    leadingPadding: mkParam(0),
    leadingBackground: 'transparent',
    leadingColor: 'currentColor',
    headingSize: mkParam(24),
    headingSpacing: mkParam(0),
    headingHeight: mkParam(1.2),
    headingColor: 'inherit',
    labelSize: mkParam(14),
    labelSpacing: mkParam(0),
    labelColor: 'inherit',
    subSize: mkParam(16),
    subColor: 'inherit',
    textureUrl: '',
    sizingMode: 'cover',
    borderRadius: mkParam(0),
    cardWidth: mkParam(320),
    cardHeight: mkParam(400),
    cardRadius: '8px',
    cardBackground: '#ffffff',
    cardPadding: mkParam(16),
    cardBorder: 'none',
    cardElevation: mkParam(1),
    cardOpacity: mkParam(1),
    cardClip: true,
    cardMediaSrc: '',
    cardMediaFit: 'cover',
    cardMediaHeight: mkParam(200),
    cardBorderWidth: mkParam(0),
    cardBorderColor: 'transparent',
    listLayout: 'grid',
    listTemplate: {},
    listItems: [],
    listCount: mkParam(10),
    listGap: mkParam(16),
    listColumns: mkParam(3),
    listRows: mkParam(2),
    listPage: mkParam(0),
    listSpeed: mkParam(1),
    listDirection: mkParam(1),
    listRadiusPattern: '8px',
    marqueeHoverPause: true,
    itemHoverScale: mkParam(1.05),
    itemBaseGrayscale: mkParam(0),
    itemHoverGrayscale: mkParam(0),
    listSmoothness: mkParam(0.1),
    bufferPx: mkParam(100),
    containerOverflow: 'visible',
    itemOverflow: 'visible',
    clipWithinSection: false,
  };
}
