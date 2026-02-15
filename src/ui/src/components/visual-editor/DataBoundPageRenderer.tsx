import { useState, useEffect } from 'react';
import { api, type DerivedPage } from '../../lib/api';

/**
 * DataBoundPageRenderer bridges the DerivedPage API output to the old_builder's
 * PageTemplate format. It fetches derived page data for an entity and converts
 * it into the structure expected by PageRenderer.
 */

// Old_builder's PageTemplate shape (distinct from api.ts's PageTemplate which is DB-side)
interface PageTemplate {
  schemaVersion: 1;
  id: string;
  name: string;
  pageContext: { kind: 'detail' | 'index' };
  pageSubject: { target: string; cardinality: 'one' | 'many' };
  sections: SectionInstance[];
}

interface SectionInstance {
  schemaVersion: 1;
  id: string;
  placement: { slot: 'start' | 'end' | 'free'; order?: number };
  binding: { kind: 'self' } | { kind: 'related'; target: string; cardinality: 'one' | 'many' };
  presentationKey: string;
  overrides?: Record<string, any>;
}

// Entity data formatted for old_builder's resolution/injection system
export interface ResolvedEntityData {
  sectionId: string;
  items: any[];
}

interface DataBoundPageRendererProps {
  entitySlug: string;
  segment?: string;
  /** Callback with the converted PageTemplate and resolved entity data per section */
  onResolved?: (template: PageTemplate, dataMap: Map<string, any[]>) => void;
}

/**
 * Converts DerivedPage sections into old_builder SectionInstance format
 * and maps entity data for injection into the rendering pipeline.
 */
function derivedToPageTemplate(derived: DerivedPage): { template: PageTemplate; dataMap: Map<string, any[]> } {
  const dataMap = new Map<string, any[]>();

  const sections: SectionInstance[] = derived.sections.map((section, index) => {
    const sectionId = `section-${index}-${section.presentationKey}`;

    // Map entity data to old_builder's expected data format
    const items = section.entities.map(entity => ({
      id: entity.id,
      tileHeading: entity.name,
      tileSubtitle: (entity.data as Record<string, unknown>)?.description as string || '',
      tileLabel: entity.type,
      title: entity.name,
      category: entity.type,
      ...extractFieldValues(entity.data),
    }));

    dataMap.set(sectionId, items);

    // Determine placement: first section = start, last = end, rest = free
    let slot: 'start' | 'end' | 'free' = 'free';
    if (index === 0 && section.binding.kind === 'self') slot = 'start';

    const binding = section.binding.kind === 'self'
      ? { kind: 'self' as const }
      : {
          kind: 'related' as const,
          target: section.binding.target || 'feature',
          cardinality: (section.binding.cardinality || 'many') as 'one' | 'many',
        };

    return {
      schemaVersion: 1 as const,
      id: sectionId,
      placement: { slot, order: index },
      binding,
      presentationKey: section.presentationKey || '',
    };
  });

  const template: PageTemplate = {
    schemaVersion: 1,
    id: `derived-${derived.entitySlug}`,
    name: derived.entityName,
    pageContext: { kind: 'detail' },
    pageSubject: { target: derived.entityType, cardinality: 'one' },
    sections,
  };

  return { template, dataMap };
}

/** Map entity data fields to old_builder's expected data keys */
function extractFieldValues(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const fieldMap: Record<string, string> = {
    headline: 'tileHeading',
    subheadline: 'tileSubtitle',
    heroImage: 'textureUrl',
    metaTitle: 'title',
  };

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null || value === '') continue;
    result[key] = value;
    if (key in fieldMap) {
      result[fieldMap[key]] = value;
    }
  }
  return result;
}

export function DataBoundPageRenderer({ entitySlug, segment, onResolved }: DataBoundPageRendererProps) {
  const [derived, setDerived] = useState<DerivedPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.derivePage(entitySlug, segment)
      .then((data) => {
        setDerived(data);
        if (data && onResolved) {
          const { template, dataMap } = derivedToPageTemplate(data);
          onResolved(template, dataMap);
        }
      })
      .catch((err) => setError((err as { error?: string }).error || 'Failed to derive page'))
      .finally(() => setLoading(false));
  }, [entitySlug, segment]);

  if (loading) return <div className="text-zinc-400 text-sm p-4">Deriving page...</div>;
  if (error) return <div className="text-red-400 text-sm p-4">{error}</div>;
  if (!derived) return <div className="text-zinc-500 text-sm p-4">No page data</div>;

  const { template, dataMap } = derivedToPageTemplate(derived);

  return (
    <div className="space-y-4">
      <div className="text-xs text-zinc-500">
        Resolved PageTemplate: <code className="text-zinc-400">{template.id}</code> with {template.sections.length} sections
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
        <h4 className="text-sm font-medium text-zinc-300 mb-3">Resolved Template Structure</h4>
        <div className="space-y-2">
          {template.sections.map(section => (
            <div key={section.id} className="flex items-center gap-3 text-xs">
              <span className={`px-2 py-0.5 rounded ${
                section.placement.slot === 'start' ? 'bg-amber-900/50 text-amber-300' :
                section.placement.slot === 'end' ? 'bg-rose-900/50 text-rose-300' :
                'bg-zinc-800 text-zinc-400'
              }`}>
                {section.placement.slot}
              </span>
              <span className={`px-2 py-0.5 rounded ${
                section.binding.kind === 'self' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-blue-900/50 text-blue-300'
              }`}>
                {section.binding.kind === 'self' ? 'self' : `related.${'target' in section.binding ? section.binding.target : '?'}.${'cardinality' in section.binding ? section.binding.cardinality : '?'}`}
              </span>
              <span className="font-mono text-zinc-500">{section.presentationKey}</span>
              <span className="text-zinc-600">
                ({dataMap.get(section.id)?.length || 0} entities)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Creates a binding data resolver that uses real entity data from DerivedPage
 * instead of mock data. Drop-in replacement for old_builder's resolveBindingData.
 */
export function createEntityResolver(dataMap: Map<string, any[]>) {
  return (sectionId: string, _binding: any): any[] => {
    return dataMap.get(sectionId) || [];
  };
}
