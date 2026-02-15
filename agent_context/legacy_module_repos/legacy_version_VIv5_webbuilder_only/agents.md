# Section Binding + Templates v1.1 — Agent Brief

## Goal

Build the site as a **data-driven compiler**: a small set of generic renderers (**Page → Sections → Elements**) where **meaning** comes from explicit **binding**, not bespoke TSX section components.

This brief upgrades the existing spec by making the missing critical dimension first-class and machine-checkable:

> **A concrete section is always**: **SectionFrame + Binding + PresentationPreset (+ Overrides)**

### Non-goals (v1)

* No routing required.
* No backend or file CRUD from the UI.
* No bespoke semantic React sections like `Products.tsx` (temporary wrappers allowed only during migration).

---

## Core Invariant

A section instance has three orthogonal axes:

1. **Semantics (Meaning):** `binding` (self vs related + target set)
2. **Placement (Position):** `slot` + `order` (start/end/free)
3. **Visuals (Rendering):** a **versioned presentation preset** (`presentationKey`)

**Hero/CTA are not types.** They are UI labels for:

* `binding.kind = self` + `slot = start` → “Hero (Self)”
* `binding.kind = self` + `slot = end` → “CTA (Self)”
* `binding.kind = self` + `slot = free` → “Self section”

---

## Terminology

### SectionFrame (structural container)

A generic container defining:

* coordinate space, height, pinning behavior
* visibility rules and culling
* background/effects layering

### Binding (semantic pointer)

Defines what the section is “about” and which entity set it targets.

### Presentation preset (visual compiler)

A **defined library** of versioned layout/effect presets (grid/marquee/stack, etc.).

---

## Data Model (v1.1)

### Entity axis

```ts
type EntityType = "brand" | "product" | "feature" | "solution" | "useCase";
```

### Page context (explicit)

Avoid encoding index/detail into template names.

```ts
type PageContext = {
  kind: "detail" | "index"; // detail = one entity, index = many entities
};
```

### Page subject

```ts
type PageSubject = {
  target: EntityType;
  cardinality: "one" | "many"; // matches PageContext.kind conceptually
};
```

**Invariant (v1.1):** treat `pageContext.kind` and `pageSubject.cardinality` as the same truth expressed twice.

* `pageContext.kind = "detail"` ⇔ `pageSubject.cardinality = "one"`
* `pageContext.kind = "index"` ⇔ `pageSubject.cardinality = "many"`

If they disagree, the page config is invalid and must fail validation (with a safe fallback UI message).

### Binding (semantic axis)

```ts
type Binding =
  | { kind: "self" }
  | {
      kind: "related";
      target: EntityType;
      cardinality: "one" | "many";
      relationKey?: string; // reserved for v2+: multiple relation flavors
      scope?: {
        limit?: number;
        sort?: string; // can be enum later
        filter?: Record<string, unknown>;
      };
    };
```

### Placement (positional axis)

```ts
type Placement = {
  slot: "start" | "end" | "free";
  order?: number; // only meaningful when slot === "free"
};
```

### Presentation preset (visual axis)

`presentationKey` is a **presentation preset id** (versioned). Semantics must not be *derived* from the string; they are validated by `PresentationPreset.signature`.

```ts
type PresentationPreset = {
  key: string; // e.g. "self.hero.v1", "related.product.many.marquee.v1"
  signature: BindingSignature; // semantic compatibility
  config: SectionConfig; // the default section config produced by this preset
};

type BindingSignature =
  | { kind: "self" }
  | { kind: "related"; target: EntityType; cardinality: "one" | "many"; relationKey?: string };
```

### Section instance

```ts
type SectionInstance = {
  schemaVersion: 1;
  id: string;

  // Placement axis (not semantic)
  placement: Placement;

  // Semantic axis (meaning)
  binding: Binding;

  // Visual axis (presentation preset)
  presentationKey: string;

  // Overrides: patch the instantiated config without mutating presets
  overrides?: Partial<SectionConfig>;
};
```

### Page template

```ts
type PageTemplate = {
  schemaVersion: 1;
  id: string;
  name: string;

  pageContext: PageContext;
  pageSubject: PageSubject;

  sections: SectionInstance[];
};
```

---

## Rendering Contract

### 1) Page rendering

Render by iterating `sections` with effective ordering:

1. all `placement.slot = "start"` sections
2. then `placement.slot = "free"` sections sorted by `placement.order`
3. then all `placement.slot = "end"` sections

**v1 rule (recommended):** enforce **at most one** `placement.slot = "start"` and **at most one** `placement.slot = "end"`.

### 2) Section rendering (SectionFrame)

SectionRenderer must:

* create a **section-local coordinate system** for element placement
* apply section height + pin height rules
* enforce clipping if enabled
* compute **section-relative progress** for animation drivers

### 3) Binding application

Binding resolves a dataset:

* `self` binds to `pageSubject`
* `related` binds to a related set identified by `(target, cardinality, relationKey?, scope?)`

**v1 allowance:** binding resolution may use static demo data, but the binding object must exist and drive:

* template filtering (compatibility)
* UI semantics and labels

### 4) Effective config pipeline (no-bleed + determinism)

Every section render must have a deterministic “effective config” derived in this order:

1. Look up `PresentationPreset` by `presentationKey`.
2. **Deep-clone** `preset.config` into a per-section instance (never share references).
3. Resolve data via `binding` (even if stubbed in v1).
4. Apply `SectionInstance.overrides` as a patch.
5. (Optional, later) Apply content/frontmatter overrides as a final patch.

This preserves the no-bleed invariant and makes export/import reproducible.

---

## Templates / Presets Library

### Template registry format (recommended)

Store presets as a deterministic registry (array or map) so you can:

* filter by `signature`
* count coverage
* validate configs

```ts
type PresetRegistry = Record<string, PresentationPreset>; // key = presentationKey
```

**Versioning rule:** if a preset’s meaning/behavior changes in a non-trivial way, bump the suffix (`.v2`, `.v3`, …) rather than mutating `.v1` in place.

### Key principle

* **Semantics** come from `binding`.
* **Visuals** come from `presentationKey`.

Therefore:

* `presentationKey` is allowed to look like `related.product.many.marquee.v1`.
* But its truth is not in the string; it’s in `PresentationPreset.signature`.

### Compatibility filtering

Template selection UI must filter presentation presets by signature:

* Selecting binding → only show compatible `presentationKey` options.
* Changing binding → must not silently retain incompatible `presentationKey`.

---

## Builder Operations (v1)

No backend and no repo file CRUD.

### Layer 1 — Runtime config (UI-editable)

Must support:

* add/remove/reorder sections
* change `binding` and `presentationKey`
* edit section `overrides`
* edit elements/effects within a section

**No-bleed invariant (mandatory):**

> Editing a section must never mutate any shared template preset object.
> Instantiation must deep-clone preset config into a section instance before overrides apply.

### Layer 2 — Export/import snapshots

Must support:

* export a full page config as JSON
  Optional:
* import JSON
* localStorage caching

### Layer 3 — Repo resources (read-only runtime)

Must support:

* templates/presets library
* icon registry (package ∪ repo SVG icons)
* markdown content folders (later)

Missing assets must not crash.

---

## Performance Contracts

### List item overrides (required for marquee and “feed” layouts)

For list-based presentations, items must be able to override visual fields without forking the preset.
Examples: per-card background image/effect, corner radius, mask, or media pointer.

Contract: list renderers accept `items[]` where each item can provide an `override` patch applied on top of the preset-derived item config.

This prevents “marquee becomes a special-case component” and keeps per-item variety within the config model.

### Section-local progress (pin vs height)

Define:

* `sectionHeightPx`: physical height in document flow
* `pinHeightPx`: scroll distance used for progress mapping

Progress:

* `rawProgress = (scrollY - sectionTop) / pinHeightPx`
* allow negative and >1 values for culling
* clamp only when an effect needs [0..1]

### Visibility culling + overscan

Offscreen sections should not run expensive renderers.
Use an overscan buffer in px to avoid pop-in.

### List performance policy (generic)

```ts
type RenderPolicy = {
  virtualization?: "none" | "window";
  overscanPx?: number;
  maxItems?: number;
};
```

Apply consistently to grid/stack/marquee.

### Marquee contract

* no per-frame React state updates
* seamless track with duplicated items (A + A)
* transform via refs; modulo reset

---

## Element Model (M3-ish, reductionist)

A page is lists-of-lists:

* **Page** = list of sections
* **Section** = list of elements (often lists)
* **List** (recommended) = the “many” mechanism (grid/marquee/stack behavior lives here)
* **Card** = container for one or many Tiles
* **Tile** = canonical text object with typed leading/trailing slots

**Guardrail:** keep Card/Tile as single-instance primitives. Put “many/layout” behaviors on List/presentation presets to avoid semantic and performance drift.

---

## Tile Leading Slot + Icon Registry

### Icon key namespacing (avoid collisions)

Because the icon registry merges **package icons ∪ repo SVG icons**, keys must be namespace-safe.

Recommendation:

* Package icons: `lucide:<name>` (or the chosen package namespace)
* Repo icons: `repo:<filename>`

If you don’t want prefixes in the UI, you can display friendly labels but store namespaced keys internally.
Leading is a slot with typed placement + kind.

```ts
type Leading = {
  placement: "none" | "left" | "above";
  kind?: "icon" | "image" | "custom";
  icon?: { name: string; size?: number; padding?: number };
  image?: { src: string; fit?: "cover" | "contain"; mask?: "none" | "circle" | "square"; align?: string };
};
```

Icon registry:

* repo folder SVGs auto-discovered (filename sans extension)
* merged with package icons
* when `placement="none"`, do not resolve/load assets

---

## Coverage Matrix + Validation

### Coverage matrix (v1.1)

Produce a deterministic list of required **BindingSignatures** for v1.1 and validate that each has ≥1 compatible preset.

Minimum required signatures:

* `{ kind: "self" }`
* For each `EntityType` as a related target:

  * `{ kind: "related", target: <EntityType>, cardinality: "one" }` (if used in v1 pages)
  * `{ kind: "related", target: <EntityType>, cardinality: "many" }` (if used in v1 pages)

This list should live in code (even if it’s hand-authored initially) and be countable/reviewable.

### Config validation rules (must be enforced)

* `binding` is mandatory.
* `placement.slot` is mandatory.
* `presentationKey` must exist in the preset registry.
* `preset.signature` must match the section’s binding signature.

  * Matching rule: derive a `BindingSignature` from `binding` by **dropping `scope`**.
  * `relationKey` rule: if the preset declares a `relationKey`, the section must match it exactly; if the preset omits `relationKey`, it matches any section `relationKey` (v1-friendly wildcard).
* `pageContext.kind` must agree with `pageSubject.cardinality` (see invariant above).

Validation failures must not crash rendering; show safe fallbacks and preserve editability.

---

## UX Requirements

### Global Page Template dropdown

* next to the power button
* swaps the whole `PageTemplate` (seed config)

### Section editor

Must surface explicitly:

* Binding selector: kind, target, cardinality, optional relationKey, optional scope
* Placement selector: slot (+ order for free)
* Presentation selector: filtered by binding signature

### Page creation defaults

When created blank:

* auto-create one `slot=start` with `binding=self`
* auto-create one `slot=end` with `binding=self`

Users can add any number of free sections, including additional self sections.

---

## Acceptance Criteria

### Semantics

* No section meaning depends on TSX filenames.
* Binding fully determines meaning; placement affects only ordering and UI labeling.

### Placement

* start renders first, end renders last, free is ordered by `order`.
* v1: at most one start and one end.

### Template filtering

* binding immediately filters presentation choices.
* incompatible presentation cannot remain selected after binding change.

### Section-locality

* positions/offsets/progress are section-relative.
* edits do not bleed across sections.

### Programmability

* anything shipped as a default must be achievable via UI config edits.

---

## Guardrails

* Treat `binding` as mandatory.
* Treat placement (`slot`) as mandatory.
* Keep `relationKey` optional but reserved.
* Do not create special-case hero/cta section types.
* Do not encode semantics into presentation names beyond signature compatibility.

### Stability rules (prevent invisible breaking changes)

* Never change the behavior/meaning of an existing `presentationKey` in-place.

  * If behavior changes materially, bump the version suffix (`.v2`, `.v3`, …).
* Maintain `schemaVersion` and write explicit migrations when it increments.
* Keep `EntityType` values canonical (lowercase strings) and treat them as public API.
* Keep icon keys namespace-safe (`package:<name>` / `repo:<name>`) to avoid collisions.
