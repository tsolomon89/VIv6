import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import type { Entity, EntityInput, ApiError, FieldGroup } from '../lib/api';
import { getDefaultFieldGroups } from '../lib/defaults';
import { DynamicFieldRenderer } from '../components/DynamicFieldRenderer';
import { FieldDependencyProvider } from '../components/FieldDependencyContext';
import { TargetingEditor } from '../components/TargetingEditor';
import { RelationshipManager } from '../components/RelationshipManager';
import { DerivedPagesPanel } from '../components/DerivedPagesPanel';
import type { Relationship } from '../lib/api';
import { useBrand } from '../lib/BrandContext';
import { ENTITY_TYPES } from '../lib/constants';

// Helper to extract dimension field values for cascading pick-list initialization
function extractDimensionFieldValues(fieldGroups: FieldGroup[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const group of fieldGroups) {
    for (const field of group.fields) {
      if (field.dimension && typeof field.value === 'string' && field.value) {
        values[field.name] = field.value;
      }
    }
  }
  return values;
}

export function EntityEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  // If route is /entities/new, id is undefined. If /entities/:id, id is set.
  // We also check for literal 'new' string just in case.
  const isNew = !id || id === 'new';
  const { activeBrandId } = useBrand();

  const [formData, setFormData] = useState<EntityInput>({
    type: 'brand',
    slug: '',
    name: '',
    description: '',
    data: { fieldGroups: getDefaultFieldGroups('brand') },
    brand_id: activeBrandId || undefined
  });

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relationships, setRelationships] = useState<Relationship[]>([]);

  // Extract initial values for dimension fields (for cascading pick-list initialization)
  const initialDimensionValues = useMemo(() => {
    if (!formData.data?.fieldGroups) return {};
    return extractDimensionFieldValues(formData.data.fieldGroups);
  }, [formData.data?.fieldGroups]);

  const loadRelationships = () => {
      if (!id || isNew) return;
      api.listRelationships(id).then(setRelationships).catch(console.error);
  };

  // Load existing entity
  useEffect(() => {
    if (!isNew && id) {
      setLoading(true);
      api.getEntity(id)
        .then((entity: Entity) => {
          // If entity has no field groups (old data), try to apply defaults
          let data = entity.data;
          
          // Legacy data migration shim (if API returned raw object but types say EntityData)
          // In practice, our backend now ensures 'fieldGroups' exists or is empty.
          // If empty, we might want to populate defaults IF it's appropriate, but for now respect what's in DB.
          if (!data.fieldGroups) {
            data = { fieldGroups: [] };
          }

          // Merge missing defaults (e.g. new field groups added to code but not in DB)
          const defaults = getDefaultFieldGroups(entity.type);
          defaults.forEach(defaultGroup => {
            const existingGroup = data.fieldGroups.find(g => g.name === defaultGroup.name);
            if (!existingGroup) {
              // Group missing, add it
              data.fieldGroups.push(defaultGroup);
            } else {
              // Group exists, check for missing fields
              defaultGroup.fields.forEach(defaultField => {
                const existingField = existingGroup.fields.find(f => f.name === defaultField.name);
                if (!existingField) {
                  existingGroup.fields.push(defaultField);
                }
              });
            }
          });
          
          setFormData({
            type: entity.type,
            slug: entity.slug,
            name: entity.name,
            description: entity.description || '',
            data: data,
          });
          loadRelationships();
        })
        .catch((err: ApiError) => {
          setError(err.error || 'Failed to load entity');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  // When type changes (only allowed for new entities), update defaults
  const handleTypeChange = (newType: string) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      data: { fieldGroups: getDefaultFieldGroups(newType) }
    }));
  };

  const handleChange = (field: keyof EntityInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === 'name' && isNew) {
      const slug = value.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleFieldChange = (groupIndex: number, fieldIndex: number, value: string | number | boolean | null) => {
    setFormData(prev => {
      // Deep copy to avoid mutation
      const newData = JSON.parse(JSON.stringify(prev.data));
      if (newData.fieldGroups[groupIndex]?.fields[fieldIndex]) {
        newData.fieldGroups[groupIndex].fields[fieldIndex].value = value;
      }
      return { ...prev, data: newData };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (isNew) {
        await api.createEntity(formData);
        navigate('/entities');
      } else if (id) {
        await api.updateEntity(id, formData);
        navigate('/entities'); // Or stay on page
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to save entity');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-zinc-400">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => navigate('/entities')}
          className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">
          {isNew ? 'New Entity' : 'Edit Entity'}
        </h1>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-400 mt-0.5" size={20} />
          <div>
            <p className="text-red-200 font-medium">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Identity Section */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4 border-b border-zinc-800 pb-2">Core Identity</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                disabled={!isNew}
              >
                {ENTITY_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Slug */}
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                placeholder="entity-slug"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white font-mono placeholder-zinc-500"
              />
              <p className="text-xs text-zinc-500 mt-1">URL-friendly identifier</p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Entity name"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Optional description"
              rows={3}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 resize-none"
            />
          </div>
        </div>

        {/* Dynamic Fields Section */}
        {formData.data?.fieldGroups && (
          <FieldDependencyProvider initialValues={initialDimensionValues}>
            <DynamicFieldRenderer
              fieldGroups={formData.data.fieldGroups}
              onChange={handleFieldChange}
            />
          </FieldDependencyProvider>
        )}

        {/* Targeting Section - Only for persisted entities that act as Offerings (Product, Solution) */}
        {!isNew && id && ['product', 'solution'].includes(formData.type) && (
            <TargetingEditor entityId={id} />
        )}

        {/* Relationship Section - Only for persisted entities */}
        {!isNew && id && (
            <RelationshipManager 
                entityId={id} 
                entityType={formData.type} 
                relationships={relationships} 
                onUpdate={loadRelationships}
            />
        )}

        {/* Derived Pages - Only for persisted entities */}
        {!isNew && id && formData.slug && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-zinc-800/50 border-b border-zinc-800 flex items-center gap-2">
              <span className="w-1 h-4 bg-emerald-500 rounded-full"></span>
              <h3 className="font-semibold text-zinc-200">Derived Pages</h3>
            </div>
            <div className="p-5">
              <DerivedPagesPanel entitySlug={formData.slug} />
            </div>
          </div>
        )}

        {/* Sticky Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-3 z-50">
           {/* Restricted width container to match layout */}
           <div className="w-full max-w-4xl mx-auto flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/entities')}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name || !formData.slug}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors font-medium shadow-lg shadow-indigo-500/20"
            >
              <Save size={18} />
              {saving ? 'Saving...' : 'Save Entity'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
