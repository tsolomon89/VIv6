# Inventory Schema v2 — What Changed and Why

## The Core Fix: UseCases Belong on Solutions, Not Products

### Before (v1)
```
Product → hasFeature → Feature
Feature → delivers → Solution  (via featureSolutionEdges)
Product → hasUseCase → UseCase  ← WRONG
```

Products had `useCaseIds` directly. This was manual and violated the derivation principle.

### After (v2)
```
Product → hasFeature → Feature
Feature → delivers → Solution  (via featureSolutionEdges)
Solution → appliesTo → UseCase  (via solutionUseCaseEdges)  ← NEW

Product.useCases = DERIVED from Product → Features → Solutions → UseCases
```

Now UseCases live where they belong: on Solutions. A Product's applicable company sizes are **computed** from its solutions.

---

## Complete Brand List (7 Brands)

| Brand | Domain | Products Label | Features Label | Solutions Label |
|-------|--------|----------------|----------------|-----------------|
| TimothySolomon | timothysolomon.com | Publications / Talks / Workshops | Topics | Principles |
| HireTimothy | hiretimothysolomon.com | Services | Capabilities | Outcomes |
| FTL | ftlmarketing.com | Services | Capabilities | Solutions |
| Victory | victoryinitiative.com | Properties / Tools / Games | Stack | — |
| Oblio | oblio.app | Platform / Modules | Features | Workflows |
| Keimenon | keimenon.com | Tools | Capabilities | Discoveries |
| Keimai | keimai.app | Tools | Modules | Patterns |

---

## New Edge Type: `solutionUseCaseEdges`

Maps each Solution to its applicable company sizes (from the table):

| Solution | Applicable Sizes |
|----------|------------------|
| Clarify Position | P, Micro, SMB, Mid |
| Price Offers | P, Micro, SMB |
| Prove ROI | SMB, Mid, Large, Ent |
| Track Journey | SMB, Mid, Large, Ent |
| Add Structure | P, Micro, SMB, Mid, Large |
| Fix Pipeline | Mid, Large, Ent |
| Reduce Entropy | Mid, Large, Ent |
| Run Experiments | SMB, Mid, Large |
| Compound Content | ALL |
| Ship Systems | Mid, Large, Ent |
| Launch Campaigns | P, Micro, SMB, Mid |
| Visualize Dynamics | ALL |

---

## New: Products Now Have Explicit `solutionIds`

### Why?

A Product uses Features, but it **sells** Solutions. Not every Solution reachable through Features is emphasized by the Product.

Example: "Fractional Growth Lead" uses `feat_reporting`, which connects to:
- sol_proveROI
- sol_trackJourney  
- sol_runExperiments

But the product might only emphasize "Prove ROI" — not "Run Experiments" (that's more of an FTL execution thing).

The `solutionIds` array captures **which solutions this product actually delivers**, not just which are theoretically reachable.

---

## Derivation Functions (Pseudocode)

### Get a Product's Features
```typescript
function getProductFeatures(productId: string): Feature[] {
  const product = products.find(p => p.id === productId);
  return product.featureIds.map(id => features.find(f => f.id === id));
}
```

### Get Solutions from Features
```typescript
function getFeatureSolutions(featureId: string): Solution[] {
  const edges = featureSolutionEdges.filter(e => e.featureId === featureId);
  return edges.map(e => solutions.find(s => s.id === e.solutionId));
}
```

### Get UseCases from Solutions
```typescript
function getSolutionUseCases(solutionId: string): UseCase[] {
  const edge = solutionUseCaseEdges.find(e => e.solutionId === solutionId);
  return edge ? edge.useCaseIds.map(id => useCases.find(u => u.id === id)) : [];
}
```

### Get a Product's Applicable UseCases (Derived)
```typescript
function getProductUseCases(productId: string): UseCase[] {
  const product = products.find(p => p.id === productId);
  const solutionIds = product.solutionIds;
  
  const useCaseIds = new Set<string>();
  for (const solId of solutionIds) {
    const edge = solutionUseCaseEdges.find(e => e.solutionId === solId);
    if (edge) edge.useCaseIds.forEach(id => useCaseIds.add(id));
  }
  
  return Array.from(useCaseIds).map(id => useCases.find(u => u.id === id));
}
```

---

## Complete Product Inventory

### TimothySolomon.com (4 products)
| Product | Price | Solutions |
|---------|-------|-----------|
| Newsletter / Subscribe | £0 | Compound Content, Track Journey |
| Speaking | £7,500/event | Clarify Position, Prove ROI |
| Workshops | £2,500/session | Clarify Position, Price Offers, Prove ROI |
| Publications | £0 | Compound Content, Visualize Dynamics |

### HireTimothySolomon.com (4 products)
| Product | Price | Solutions |
|---------|-------|-----------|
| Fractional Growth Lead | £8,000/mo | Clarify Position, Price Offers, Launch Campaigns, Run Experiments, Prove ROI, Track Journey, Add Structure, Reduce Entropy, Fix Pipeline |
| Measurement Audit Sprint | £4,500 | Track Journey, Prove ROI |
| CRM Rebuild Sprint | £7,500 | Add Structure, Reduce Entropy, Fix Pipeline, Ship Systems |
| Offer & Funnel Refactor | £6,000 | Clarify Position, Price Offers, Compound Content, Add Structure, Launch Campaigns, Track Journey, Prove ROI |

### FTLMarketing.com (4 products)
| Product | Price | Solutions |
|---------|-------|-----------|
| Managed Paid Media | £2,500/mo | Launch Campaigns, Run Experiments, Prove ROI, Track Journey, Add Structure |
| Growth Ops Retainer | £3,500/mo | Compound Content, Launch Campaigns, Track Journey, Fix Pipeline, Add Structure, Prove ROI |
| Marketing Ops & CRM | £4,000/mo | Add Structure, Reduce Entropy, Fix Pipeline, Ship Systems, Track Journey |
| Event Activation | £5,000/event | Launch Campaigns, Track Journey, Fix Pipeline, Prove ROI |

### VictoryInitiative.com (1 product)
| Product | Price | Solutions |
|---------|-------|-----------|
| Properties / Tools / Games | £0 | Ship Systems, Visualize Dynamics, Compound Content |

### Oblio.app (4 products)
| Product | Price | Solutions |
|---------|-------|-----------|
| Oblio Platform (Core) | £299/mo | Add Structure, Reduce Entropy, Fix Pipeline, Track Journey, Prove ROI |
| Campaigns Module | £99/mo | Launch Campaigns, Track Journey, Prove ROI |
| Pipeline Module | £99/mo | Fix Pipeline, Reduce Entropy, Add Structure, Track Journey, Prove ROI |
| Product Catalog Module | £49/mo | Price Offers, Add Structure |

### Keimenon.com (1 product)
| Product | Price | Solutions |
|---------|-------|-----------|
| Keimenon Parser | £0 | Visualize Dynamics, Compound Content, Reduce Entropy |

*AI conversation archaeology — parse, search, and excavate meaning from Claude/ChatGPT exports.*

### Keimai.app (1 product)
| Product | Price | Solutions |
|---------|-------|-----------|
| Keimai Schema Planner | £0 | Add Structure, Visualize Dynamics, Ship Systems |

*Lightweight schema planning tool — design entity graphs, relationships, and derive page structures. Can share nodes with Oblio under different roles.*

**Total: 19 Products across 7 Brands**

---

## Feature Count

| Feature | Used By # Products |
|---------|-------------------|
| feat_crmSchema | 6 |
| feat_reporting | 9 |
| feat_automation | 5 |
| feat_instrumentation | 7 |
| feat_positioning | 4 |
| feat_attribution | 4 |
| feat_lifecycleOps | 5 |
| feat_paidMedia | 2 |
| feat_contentEngine | 3 |
| feat_offerDesign | 4 |
| ... | |

Features are properly shared — no duplication.

---

## Page Derivation (What Victory Initiative Generates)

Given this inventory, the page builder derives:

**Per Brand Site:**
- 1 Home page
- N Product pages (from products where brandId matches)
- M Feature pages (from unique features across brand's products)
- K Solution pages (from unique solutions across brand's products)
- 0-6 UseCase pages (if brand uses useCases in nav)

**Example: HireTimothySolomon.com**
```
/                           → Home
/services/fractional-growth-lead → Product
/services/measurement-audit      → Product
/services/crm-rebuild            → Product
/services/offer-funnel-refactor  → Product
/capabilities/positioning        → Feature
/capabilities/paid-media         → Feature
/capabilities/crm-schema         → Feature
... (14 unique features)
/outcomes/clarify-position       → Solution
/outcomes/prove-roi              → Solution
/outcomes/add-structure          → Solution
... (9 unique solutions)
```

**Estimated pages per brand:**
| Brand | Products | Features | Solutions | Total |
|-------|----------|----------|-----------|-------|
| timothysolomon.com | 4 | 6 | 5 | ~16 |
| hiretimothysolomon.com | 4 | 14 | 9 | ~28 |
| ftlmarketing.com | 4 | 10 | 8 | ~23 |
| victoryinitiative.com | 1 | 3 | 3 | ~8 |
| oblio.app | 4 | 6 | 6 | ~17 |
| keimenon.com | 1 | 4 | 3 | ~9 |
| keimai.app | 1 | 3 | 3 | ~8 |

**Total derived pages: ~109** (before blog/docs/wiki content)
