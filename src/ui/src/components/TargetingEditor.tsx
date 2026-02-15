import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import type { DimensionValue } from '../lib/api';
import { X, Tag, Users } from 'lucide-react';
import { PERSONA_KEYS, PERSONA_LABELS, PERSONA_STYLES, TARGETING_DIMENSIONS, type PersonaKey } from '../lib/constants';

type PersonaTargeting = Record<string, string[]>;
type Personas = Record<PersonaKey, PersonaTargeting>;

const TARGETING_DIM_SET: ReadonlySet<string> = new Set(TARGETING_DIMENSIONS);

interface TargetingEditorProps {
  entityId: string;
}

export function TargetingEditor({ entityId }: TargetingEditorProps) {
  const [personas, setPersonas] = useState<Personas>({ DM: {}, EU: {}, IN: {} });
  const [dimensionValues, setDimensionValues] = useState<Record<string, DimensionValue[]>>({});
  const [availableDimensions, setAvailableDimensions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load entity data and dimension values
  useEffect(() => {
    loadData();
  }, [entityId]);

  const loadData = async () => {
    try {
      const [entity, dimTypes] = await Promise.all([
        api.getEntity(entityId),
        api.getDimensionTypes(),
      ]);

      // Load personas from entity data
      if (entity.data?.personas) {
        setPersonas({
          DM: entity.data.personas.DM || {},
          EU: entity.data.personas.EU || {},
          IN: entity.data.personas.IN || {},
        });
      }

      // Get available dimension types that match our targeting dimensions
      const available = dimTypes
        .map(d => d.dimension)
        .filter(d => TARGETING_DIM_SET.has(d));
      setAvailableDimensions(available);

      // Load values for each available dimension
      const valueMap: Record<string, DimensionValue[]> = {};
      await Promise.all(
        available.map(async (dim: string) => {
          const vals = await api.listDimensionValues(dim);
          valueMap[dim] = vals;
        })
      );
      setDimensionValues(valueMap);
    } catch (err) {
      console.error('Failed to load targeting data', err);
    }
  };

  const toggleValue = (personaKey: string, dimension: string, slug: string) => {
    setPersonas(prev => {
      const persona = { ...prev[personaKey as keyof Personas] };
      const current = persona[dimension] || [];
      if (current.includes(slug)) {
        persona[dimension] = current.filter(s => s !== slug);
      } else {
        persona[dimension] = [...current, slug];
      }
      return { ...prev, [personaKey]: persona };
    });
    setDirty(true);
  };

  const removeValue = (personaKey: string, dimension: string, slug: string) => {
    setPersonas(prev => {
      const persona = { ...prev[personaKey as keyof Personas] };
      persona[dimension] = (persona[dimension] || []).filter(s => s !== slug);
      return { ...prev, [personaKey]: persona };
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Get the current entity, update data.personas, then save
      const entity = await api.getEntity(entityId);
      const updatedData = { ...entity.data, personas: personas };
      await api.updateEntity(entityId, {
        type: entity.type,
        slug: entity.slug,
        name: entity.name,
        description: entity.description || '',
        data: updatedData,
      });
      setDirty(false);
    } catch (err) {
      setError('Failed to save targeting');
    } finally {
      setSaving(false);
    }
  };

  const getValueLabel = (dimension: string, slug: string): string => {
    const val = dimensionValues[dimension]?.find(v => v.slug === slug);
    return val?.label || slug;
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <div className="px-5 py-3 bg-zinc-800/50 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-indigo-400" />
          <h3 className="font-semibold text-zinc-200">Persona Targeting</h3>
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-3 py-1 text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded text-white font-medium"
          >
            {saving ? 'Saving...' : 'Save Targeting'}
          </button>
        )}
      </div>

      {error && (
        <div className="mx-5 mt-4 p-2 bg-red-900/50 border border-red-700 rounded text-red-200 text-xs">{error}</div>
      )}

      <div className="p-5 space-y-6">
        {PERSONA_KEYS.map(key => {
          const styles = PERSONA_STYLES[key];
          return (
            <div key={key} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${styles.dot}`}></span>
                <h4 className="font-medium text-zinc-300">{PERSONA_LABELS[key]} ({key})</h4>
              </div>

              {availableDimensions.length === 0 ? (
                <p className="text-zinc-600 text-sm italic pl-4">
                  No dimensions imported yet. Import dimension values first.
                </p>
              ) : (
                <div className="pl-4 space-y-3">
                  {availableDimensions.map(dim => {
                    const selected = personas[key][dim] || [];
                    const values = dimensionValues[dim] || [];

                    return (
                      <div key={dim} className="flex items-start gap-3">
                        <span className="text-xs text-zinc-500 w-24 pt-1.5 text-right shrink-0 capitalize">
                          {dim}
                        </span>
                        <div className="flex-1">
                          <div className="flex flex-wrap gap-1.5 mb-1.5">
                            {selected.map(slug => (
                              <span
                                key={slug}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${styles.chip}`}
                              >
                                <Tag size={10} />
                                {getValueLabel(dim, slug)}
                                <button
                                  onClick={() => removeValue(key, dim, slug)}
                                  className="ml-0.5 hover:text-white"
                                >
                                  <X size={10} />
                                </button>
                              </span>
                            ))}
                          </div>
                          <select
                            value=""
                            onChange={e => {
                              if (e.target.value) toggleValue(key, dim, e.target.value);
                            }}
                            className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-400 w-48"
                          >
                            <option value="">+ Add {dim}...</option>
                            {values
                              .filter(v => !selected.includes(v.slug))
                              .map(v => (
                                <option key={v.slug} value={v.slug}>{v.label}</option>
                              ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
