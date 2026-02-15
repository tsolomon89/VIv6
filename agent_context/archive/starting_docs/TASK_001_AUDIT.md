# TASK_001_AUDIT.md — Existing Code Audit

> **Priority:** BLOCKING
> **Estimated time:** 2-4 hours
> **Output:** `AUDIT_REPORT.md`

---

## Objective

Before writing any new code, understand what exists in `old-builder/`.

The existing codebase has **working patterns** for:
- Section rendering with scroll-based animations
- On-page editing controls
- Overlay and sidebar editor arrangements
- Template configuration UI
- WebGL effects

**We do not rewrite these.** We extract, generalize, and connect them to the data layer.

---

## What We're Looking For

### 1. Editor Architecture

The `old-builder/` should have two editor arrangements already built:
- **Overlay Mode:** Editor panel floats on page
- **Sidebar Mode:** Page in resizable column + forms in separate column

**Find:**
- How are these modes implemented?
- How do they share form components?
- What state management pattern is used?
- Where is the view switcher?

### 2. Section Rendering

**Find:**
- The main section container component
- How scroll-based animation works
- What props a section accepts
- How section dimensions are controlled
- The "pin" or scroll-lock mechanism

### 3. Configuration Controls

**Find:**
- Where editing controls are defined
- What can be configured (list all options)
- How configuration state is stored during editing
- What happens on "save" (where does it go?)
- How controls communicate changes to sections

### 4. Template System

**Find:**
- Any existing template concept
- How different layouts are selected
- Whether templates are data-driven or hardcoded

### 5. Styling System

**Find:**
- CSS methodology (Tailwind? Modules? Custom properties?)
- Theme or token system
- Morphism/elevation patterns if any

---

## Instructions

### Step 1: Environment Setup

```bash
cd old-builder
npm install
npm run dev
```

Open in browser. Click around. Understand what it does.

### Step 2: File Exploration

```bash
# Structure
find src -type f -name "*.tsx" | head -50

# Components
find src -name "*.tsx" -path "*/components/*"

# State management
grep -r "useState\|useReducer\|createContext" src --include="*.tsx" -l

# Any data/storage
grep -r "sqlite\|localStorage\|indexedDB\|fetch" src --include="*.ts" -l

# CSS approach
find src -name "*.css" -o -name "*.scss" -o -name "*.module.css"
```

### Step 3: Document Findings

Create `AUDIT_REPORT.md` with this structure:

```markdown
# VIv5 Old-Builder Audit Report

**Date:** [date]
**Auditor:** Claude
**Folder:** old-builder/

## Executive Summary

[2-3 paragraphs: what this codebase does, what's working, what's relevant to our goals]

## Project Structure

```
old-builder/src/
├── [actual structure]
```

## Editor Modes

### Overlay Mode
- Location: [file path]
- Implementation: [how it works]
- State: [how state is managed]

### Sidebar Mode
- Location: [file path]
- Implementation: [how it works]
- Responsive testing: [is there viewport resize?]

### Mode Switching
- Location: [file path]
- Mechanism: [how switching works]

## Section System

### Core Components
| Component | Location | Purpose |
|-----------|----------|---------|
| [name] | [path] | [what it does] |

### Scroll Handling
[How scroll position affects rendering]

### Section Config
```typescript
// The actual interface, if found
interface SectionConfig {
  // ...
}
```

## Configuration Controls

### Control Types
| Control | Configures | Location |
|---------|------------|----------|
| [name] | [what property] | [path] |

### Data Flow
[How control changes propagate to section]

### Save Mechanism
[What happens on save — where does data go?]

## Template System

### Current State
[Is there a template concept? How are layouts selected?]

### Template Structure (if exists)
```typescript
// ...
```

## Styling

### Approach
[CSS methodology]

### Tokens/Variables
[Any CSS custom properties?]

### Theme System
[Any theming?]

## Reuse Assessment

### Keep As-Is
| Component | Reason |
|-----------|--------|
| [name] | [why keep] |

### Extract and Adapt
| Component | What to Extract | How to Adapt |
|-----------|----------------|--------------|
| [name] | [what] | [how] |

### Replace
| Component | Reason | Replace With |
|-----------|--------|--------------|
| [name] | [why] | [what] |

## Integration Points

### Connecting to Database
[What needs to change to save to SQLite via Core Functions]

### Supporting Derived Pages
[What needs to change to render from page JSON]

### Content Constraints
[Where to enforce character limits and validation]

## Gaps

What's missing that we need:
1. [gap 1]
2. [gap 2]
...

## Recommended Sequence

1. [first thing to do]
2. [second thing]
...

## Code Snippets

### [Relevant snippet]
```typescript
// File: [path]
// [the code]
```
```

---

## Completion Criteria

The audit is complete when:

- [ ] `AUDIT_REPORT.md` exists with all sections filled
- [ ] Executive summary accurately describes current state
- [ ] All editor modes documented with file paths
- [ ] Section system understood and documented
- [ ] Configuration controls inventoried
- [ ] Styling approach documented
- [ ] Reuse recommendations are specific and actionable
- [ ] Integration points identified

---

## What Comes Next

After this audit:
1. TASK_002: Build database schema and Core Functions
2. Adapt existing components to call Core Functions
3. Connect section renderer to derived page JSON
4. Unify editor components across modes

The audit determines HOW we do tasks 2-4. Don't skip it.
