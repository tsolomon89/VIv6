# Section Binding + Templates v1.1 — Implementation Plan for VI Studio

This document translates the **Section Binding + Templates v1.1** brief into a set of **small, discrete, executable tasks** that can be completed by an AI agent without needing additional context. Read top-to-bottom, it doubles as documentation for how to migrate the current repo to the binding-driven compiler model.

## 0) Current Repo Snapshot (What We’re Starting From)

* **App composition** is hard-coded to TSX sections (`Hero`, `UseCases`, `Products`, etc.) and ordered manually in `App.tsx`.【F:App.tsx†L1-L171】
* **Sections** are stored as a `Record<string, SectionConfig>` in `data.ts` (`INITIAL_SECTIONS`), currently keyed by semantic names like `UseCases`, `Products`, etc.【F:data.ts†L235-L247】
* **Section structure** is minimal (`id`, `height`, `pinHeight`, `objects`) and does not encode binding, placement, or presentation presets.【F:types.ts†L154-L160】
* **Editor UI** is centered around selecting a section by its string key, then editing height, pin height, and objects; no binding/presentation controls exist yet.【F:components/editor/EditorOverlay.tsx†L13-L208】

These facts inform what needs to change, what must be migrated, and which components will be touched.

---

## 1) Target Architecture (Quick Restatement)

**Core invariant:** a section instance is always **SectionFrame + Binding + PresentationPreset (+ Overrides)**. Placement is its own axis.

**Axes:**
1. **Semantics (Binding):** `self` or `related` + target entity set
2. **Placement:** `slot` + `order`
3. **Visuals:** `presentationKey` referencing a preset registry

**Key outcome:** meaning must be data-driven by binding, not by TSX component filenames or section names.

---

## 2) Discrete Task List (Agent-Ready)

Each task below is intentionally small and self-contained. Completing them in order yields the full implementation.

### Phase A — Data Model Foundations

**A1. Add new binding/placement/page types in `types.ts`.**
* **Action:** Introduce types from the brief (`EntityType`, `PageContext`, `PageSubject`, `Binding`, `Placement`, `BindingSignature`, `SectionInstance`, `PageTemplate`, `PresentationPreset`).
* **Verify:** `rg -n \"EntityType|PageContext|PageSubject|Binding|Placement|BindingSignature|SectionInstance|PageTemplate|PresentationPreset\" types.ts`
* **Exit criteria:** TypeScript compiles and new types are exported from `types.ts`.

**A2. Introduce `PresentationPreset` registry module.**
* **Action:** Create a new file, e.g. `presets/registry.ts`, exporting a `PresetRegistry` map keyed by `presentationKey`.
* **Verify:** `rg -n \"PresetRegistry|presentationKey|self\\.hero\\.v1\" presets`
* **Exit criteria:** At least one `presentationKey` is registered (e.g. `self.hero.v1`) with a config stub.

**A3. Add runtime helpers for binding signatures.**
* **Action:** Create helpers to derive `BindingSignature` from `Binding` (dropping `scope`) and compare against preset signatures.
* **Verify:** `rg -n \"matchesSignature|BindingSignature\" src components utils hooks`
* **Exit criteria:** A helper `matchesSignature(binding, preset.signature)` returns a boolean and is unit-testable.

**A4. Define page template structure for the current demo.**
* **Action:** Create a `PageTemplate` JSON (or TS object) representing the current sections (`hero`, `UseCases`, `Products`, etc.) as `SectionInstance[]` with binding + placement + presentation.
* **Verify:** `rg -n \"PageTemplate|SectionInstance\\[\\]|pageContext|pageSubject\"`
* **Exit criteria:** A single place in the repo represents page layout using the new data model.

---

### Phase B — Validation + Safe Fallbacks

**B1. Add page-level validation helpers.**
* **Action:** Implement validation functions for:
  * `pageContext.kind` vs `pageSubject.cardinality` agreement
  * `presentationKey` existence
  * `preset.signature` compatibility with `binding`
* **Verify:** `rg -n \"validatePageTemplate|pageContext|pageSubject|presentationKey|signature\"`
* **Exit criteria:** A function like `validatePageTemplate(template, registry)` returns a list of errors.

**B2. Add safe fallback UI for validation errors.**
* **Action:** Create a generic UI message renderer (e.g. in `components/sections/ValidationNotice.tsx`) that displays issues without crashing.
* **Verify:** Temporarily inject a known validation error and confirm a fallback component renders instead of crashing.
* **Exit criteria:** Rendering a page with validation errors shows a safe UI message and does not throw.

---

### Phase C — Rendering Pipeline (Compiler Model)

**C1. Add a `PageRenderer` that iterates SectionInstances by placement.**
* **Action:** Create a `PageRenderer` component that:
  1. Orders sections by slot (`start`, `free` by order, `end`)
  2. Enforces at most one `start` and one `end`
  3. Renders each section using `SectionRenderer`
* **Verify:** `rg -n \"PageRenderer\" App.tsx components`
* **Exit criteria:** `App.tsx` renders the page via `PageRenderer` rather than hard-coded sections.

**C2. Add a `SectionRenderer` that applies the preset pipeline.**
* **Action:** For each `SectionInstance`, apply:
  1. Look up preset by `presentationKey`
  2. Deep-clone `preset.config`
  3. Resolve data via `binding` (stubbed is fine)
  4. Apply `overrides`
* **Verify:** Inspect for deep-clone usage (`structuredClone` or JSON clone) before overrides apply.
* **Exit criteria:** Editing one section does not mutate preset configs (no-bleed).

**C3. Map preset configs to existing `SectionChapter`/`SectionScene`.**
* **Action:** Adapt the new `SectionRenderer` to produce `SectionConfig`-compatible input for `SectionChapter` and `SectionScene`.
* **Verify:** Render a page with preset-driven sections and confirm `SectionChapter` receives expected props.
* **Exit criteria:** Existing visual renderers continue to work with the new compiler output.

---

### Phase D — Binding Resolution (v1 Stub)

**D1. Add `binding` resolution helpers.**
* **Action:** Create a stub data resolver that:
  * returns `pageSubject` for `binding.kind = self`
  * returns demo related data for `binding.kind = related`
* **Verify:** `rg -n \"resolveBinding|binding.kind\"`
* **Exit criteria:** `binding` drives UI semantics, even if data is static.

**D2. Connect binding to UI labels.**
* **Action:** Update section label logic (e.g., in the editor) to show “Hero (Self)” / “CTA (Self)” based on `binding.kind + placement.slot`.
* **Verify:** In the editor, change `binding.kind` and `placement.slot` and confirm label updates.
* **Exit criteria:** The UI labels do **not** come from section names or TSX file names.

---

### Phase E — Editor UI (Binding + Presentation)

**E1. Add binding controls to the editor.**
* **Action:** Extend the editor UI to edit `binding.kind`, `target`, `cardinality`, `relationKey`, `scope`.
* **Verify:** Change binding via UI and see changes reflected in serialized output.
* **Exit criteria:** Users can modify binding without touching code.

**E2. Add placement controls to the editor.**
* **Action:** Add slot selector (`start`, `end`, `free`) and `order` input (only for `free`).
* **Verify:** Change slot/order and confirm render order changes in the UI.
* **Exit criteria:** Changing slot reorders sections in the render output.

**E3. Add presentation selector filtered by binding signature.**
* **Action:** Populate a dropdown with preset keys filtered by `binding` compatibility. If incompatible, auto-reset selection.
* **Verify:** Change binding to an incompatible signature and confirm presentation resets.
* **Exit criteria:** Users cannot select incompatible presentation presets.

---

### Phase F — Export/Import & Local Persistence

**F1. Export `PageTemplate` JSON.**
* **Action:** Replace the current copy-to-clipboard to export the full `PageTemplate` structure.
* **Verify:** Paste clipboard JSON and run validation; confirm no errors.
* **Exit criteria:** The clipboard data matches the new schema and validates.

**F2. Add optional import + localStorage caching.**
* **Action:** Implement a small utility to read a template JSON and validate before applying; cache the latest template in localStorage.
* **Verify:** Refresh and confirm the cached template rehydrates or falls back safely on invalid data.
* **Exit criteria:** A stored template rehydrates on refresh (with validation guardrails).

---

### Phase G — Migration / Compatibility

**G1. Create temporary wrapper presets for existing TSX sections.**
* **Action:** For each existing section (Hero/UseCases/etc.), register a preset that wraps the current TSX until fully migrated.
* **Verify:** Remove hard-coded TSX section order and confirm identical rendering via presets.
* **Exit criteria:** You can remove hard-coded section ordering from `App.tsx` without losing visual output.

**G2. Remove semantic reliance on TSX filenames.**
* **Action:** Update any UI labels, selection logic, or logic that relies on section IDs like `Products`.
* **Verify:** `rg -n \"Hero|UseCases|Products|Features|Solutions|CTA\" components hooks App.tsx` and confirm usage is purely presentation/migration-only.
* **Exit criteria:** No semantic logic remains tied to section component names.

---

### Phase H — Coverage + Validation Matrix

**H1. Add a binding signature coverage list.**
* **Action:** Create a `requiredBindingSignatures` list and validate preset coverage.
* **Verify:** A coverage report logs missing signatures at startup or in the editor.
* **Exit criteria:** A report lists which signatures are missing presets.

**H2. Validate preset meaning via signature.**
* **Action:** Add checks that a preset signature matches the binding signature (with `relationKey` rules from the brief).
* **Verify:** Force a mismatch and confirm a validation error is surfaced without crashing.
* **Exit criteria:** Incompatible bindings are rejected with safe UI fallback.

---

### Phase I — Performance + Rendering Contracts

**I1. Implement list item override patches.**
* **Action:** Ensure list renderers accept `items[]` where each item can provide an `override` patch applied on top of the preset-derived item config.
* **Verify:** Create a list preset and apply per-item overrides (e.g., media, radius) to confirm visual differences without forking the preset.
* **Exit criteria:** List items can override visual fields while preserving the base preset.

**I2. Formalize section-local progress math.**
* **Action:** Define and use `sectionHeightPx` and `pinHeightPx` to compute `rawProgress` with negative/over-1 values for culling.
* **Verify:** Log raw progress on scroll and confirm values go <0 and >1 outside the pinned region.
* **Exit criteria:** Progress is computed section-locally and clamped only where effects demand [0..1].

**I3. Add visibility culling + overscan.**
* **Action:** Skip expensive renderers when a section is outside an overscan buffer.
* **Verify:** Scroll offscreen and confirm culling logs or performance counters reflect skipped renders.
* **Exit criteria:** Offscreen sections are culled with a configurable overscan.

**I4. Add a shared list render policy.**
* **Action:** Implement `RenderPolicy` (`virtualization`, `overscanPx`, `maxItems`) and apply consistently to grid/stack/marquee.
* **Verify:** Toggle `virtualization` and confirm list length renders respect `maxItems`.
* **Exit criteria:** All list layouts respect the same policy surface.

**I5. Enforce marquee performance contract.**
* **Action:** Ensure marquee uses ref transforms (no per-frame React state updates) and a seamless A+A track.
* **Verify:** Confirm React render counts stay flat during marquee playback and track wraps without gaps.
* **Exit criteria:** Marquee animation is ref-driven and seamless.

---

### Phase J — Element Model + Icon Registry

**J1. Align element model to Page → Section → List → Card → Tile.**
* **Action:** Ensure list/layout behaviors live in list/presets, while Card/Tile remain single-instance primitives.
* **Verify:** Confirm new “many” behaviors are implemented in list renderers, not card/tile components.
* **Exit criteria:** No multi-item layout logic lives inside Card/Tile primitives.

**J2. Add typed leading slot model.**
* **Action:** Implement the `Leading` model (placement/kind/icon/image) for tile rendering.
* **Verify:** Swap `leading.kind` between icon/image and confirm correct rendering.
* **Exit criteria:** Tiles render leading content via the typed slot model.

**J3. Implement icon registry with namespace-safe keys.**
* **Action:** Create a registry merging package icons and repo SVGs with namespaced keys (`lucide:`, `repo:`).
* **Verify:** Confirm collisions are avoided and `placement=\"none\"` does not load assets.
* **Exit criteria:** Icon keys are namespace-safe and resolution is stable.

---

### Phase K — UX + Guardrails

**K1. Add a global PageTemplate dropdown.**
* **Action:** Place a template selector next to the power button to swap the entire `PageTemplate`.
* **Verify:** Selecting a new template replaces the active page config.
* **Exit criteria:** Template switching works and is reflected in the UI.

**K2. Add page creation defaults.**
* **Action:** When creating a blank page, auto-create `slot=start` + `slot=end` sections with `binding=self`.
* **Verify:** Create a blank page and confirm start/end sections are seeded.
* **Exit criteria:** Blank pages follow the v1 default rules.

**K3. Enforce guardrails + migrations.**
* **Action:** Enforce mandatory `binding` and `placement.slot`, keep `relationKey` optional, and add `schemaVersion` migrations when needed.
* **Verify:** Attempt to load invalid sections and confirm validation blocks with safe fallback.
* **Exit criteria:** Guardrails are enforced and schema migrations are explicit.

---

### Phase L — SectionFrame + Versioning + Non-goals

**L1. Implement a SectionFrame container.**
* **Action:** Add a structural SectionFrame wrapper that owns coordinate space, height/pin behavior, visibility rules, and background/effects layering.
* **Verify:** Confirm each section renders inside SectionFrame and that clipping/background rules apply consistently.
* **Exit criteria:** Section rendering is framed by a dedicated SectionFrame container.

**L2. Enforce preset versioning rules.**
* **Action:** Add a rule/check that non-trivial preset behavior changes require bumping the version suffix (`.v2`, `.v3`, …), not mutating `.v1`.
* **Verify:** Add a lint/checklist note or CI guard that flags changes to existing preset keys.
* **Exit criteria:** Preset behavior changes are versioned, not mutated in place.

**L3. Enforce pageContext ↔ pageSubject invariant.**
* **Action:** Treat `pageContext.kind` and `pageSubject.cardinality` as the same truth and fail validation if they disagree.
* **Verify:** Create a mismatched template and confirm validation errors appear with safe fallback.
* **Exit criteria:** The invariant is enforced in validation.

**L4. Document v1 non-goals and guardrail exclusions.**
* **Action:** Add explicit notes in the UI or docs that v1 has no routing, no backend/file CRUD, and no bespoke semantic TSX sections.
* **Verify:** Locate the non-goals note in the docs or help UI.
* **Exit criteria:** Non-goals are explicit and discoverable for implementers.

---

## 3) File/Module Targets (Where Changes Will Land)

This is a concrete map of likely touch points based on the current repo structure:

* **Types:** `types.ts` (new binding/preset/page types).【F:types.ts†L1-L160】
* **Data/Preset registry:** new `presets/registry.ts` and `presets/presets.ts` (or similar).
* **Runtime pipeline:** new `components/renderers/PageRenderer.tsx`, `components/renderers/SectionRenderer.tsx`.
* **Editor UI:** `components/editor/EditorOverlay.tsx` (add binding + placement + presentation panels).【F:components/editor/EditorOverlay.tsx†L13-L208】
* **App root:** `App.tsx` to replace hard-coded sections with template-driven renderer.【F:App.tsx†L1-L171】

---

## 4) Acceptance Checklist (Quick QA)

Use this to confirm the migration is complete:

* **Semantics**
  * Binding drives section meaning; no TSX names used for meaning.
* **Placement**
  * `start` renders first, `end` last, `free` ordered by `order`.
  * At most one `start` and one `end` enforced.
* **Template filtering**
  * Presentation preset selection is filtered by binding signature.
  * Incompatible presets cannot persist after binding change.
* **Section-locality**
  * Preset configs are deep-cloned; no bleed between sections.
* **Validation**
  * Missing preset, invalid signature, or page-context mismatch shows a safe fallback UI.
* **Programmability**
  * Any shipped default is achievable via UI configuration edits.

---

## 5) Suggested Next Actions (Shortest Critical Path)

If you want the fastest incremental progress, complete these five tasks first:

1. **A1** — Add types to `types.ts`.
2. **A2** — Add preset registry with one example preset.
3. **C1** — Add `PageRenderer` with ordered placement logic.
4. **C2** — Add `SectionRenderer` with deep-clone preset pipeline.
5. **B1** — Implement validation for page context + preset compatibility.

These unlock the compiler model and allow parallel work on editor UI and presets.
