import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import type { Entity, Domain } from '../lib/api';
import { useBrand } from '../lib/BrandContext';
import { Globe, ArrowRight, Plus, Trash2, ExternalLink, Server, BookOpen, FileCode, Layout, X } from 'lucide-react';

const DOMAIN_TYPE_META: Record<string, { label: string; icon: typeof Globe; color: string }> = {
  www: { label: 'Website', icon: Globe, color: 'text-blue-400 bg-blue-500/10' },
  blog: { label: 'Blog', icon: BookOpen, color: 'text-emerald-400 bg-emerald-500/10' },
  docs: { label: 'Docs', icon: FileCode, color: 'text-amber-400 bg-amber-500/10' },
  app: { label: 'App', icon: Layout, color: 'text-purple-400 bg-purple-500/10' },
  custom: { label: 'Custom', icon: Server, color: 'text-zinc-400 bg-zinc-500/10' },
};

const ENTITY_TYPE_OPTIONS = ['product', 'feature', 'solution', 'useCase', 'persona', 'brand'];

interface BrandWithDomains {
  brand: Entity;
  domains: Domain[];
}

export function SiteStructure() {
  const [brands, setBrands] = useState<BrandWithDomains[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState<string | null>(null); // brand_id
  const navigate = useNavigate();
  const { setActiveBrandId } = useBrand();

  const loadData = async () => {
    setLoading(true);
    try {
      const allBrands = await api.listEntities('brand');
      const siteBrands = allBrands.filter(b => {
        const configGroup = b.data?.fieldGroups?.find((g: any) => g.name === 'Configuration');
        const isSiteField = configGroup?.fields?.find((f: any) => f.name === 'Is Site Owner');
        return isSiteField?.value === true;
      });

      const allDomains = await api.listDomains();
      const domainsByBrand = new Map<string, Domain[]>();
      for (const d of allDomains) {
        if (!domainsByBrand.has(d.brand_id)) domainsByBrand.set(d.brand_id, []);
        domainsByBrand.get(d.brand_id)!.push(d);
      }

      setBrands(siteBrands.map(brand => ({
        brand,
        domains: domainsByBrand.get(brand.id) || [],
      })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleDeleteDomain = async (domainId: string) => {
    if (!confirm('Delete this domain?')) return;
    await api.deleteDomain(domainId);
    loadData();
  };

  if (loading) return <div className="text-zinc-400">Loading sites...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Sites & Domains</h1>

      {brands.map(({ brand, domains }) => (
        <div key={brand.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          {/* Brand Header */}
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <Globe size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">{brand.name}</h3>
                <span className="font-mono text-xs text-zinc-500">{brand.slug}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(showAddForm === brand.id ? null : brand.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors"
              >
                <Plus size={12} /> Add Domain
              </button>
              <button
                onClick={() => { setActiveBrandId(brand.id); navigate('/records/content'); }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-xs font-medium transition-colors"
              >
                Manage Content <ArrowRight size={12} />
              </button>
            </div>
          </div>

          {/* Add Domain Form */}
          {showAddForm === brand.id && (
            <AddDomainForm
              brandId={brand.id}
              onCreated={() => { setShowAddForm(null); loadData(); }}
              onCancel={() => setShowAddForm(null)}
            />
          )}

          {/* Domains List */}
          <div className="divide-y divide-zinc-800/50">
            {domains.map(domain => {
              const meta = DOMAIN_TYPE_META[domain.type] || DOMAIN_TYPE_META.custom;
              const Icon = meta.icon;
              return (
                <div key={domain.id} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex p-1.5 rounded ${meta.color}`}>
                      <Icon size={14} />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-200 font-mono">{domain.hostname}</span>
                        {domain.is_primary && (
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 rounded font-medium">
                            Primary
                          </span>
                        )}
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded">
                          {domain.type}
                        </span>
                      </div>
                      {domain.entity_types.length > 0 && (
                        <div className="flex gap-1 mt-0.5">
                          {domain.entity_types.map(et => (
                            <span key={et} className="text-[10px] text-zinc-600">{et}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`http://${domain.hostname}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-600 hover:text-zinc-400 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => handleDeleteDomain(domain.id)}
                      className="text-zinc-600 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
            {domains.length === 0 && (
              <div className="px-4 py-6 text-center text-zinc-600 text-sm">
                No domains configured. Click "Add Domain" to get started.
              </div>
            )}
          </div>
        </div>
      ))}

      {brands.length === 0 && (
        <div className="text-center p-12 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500">
          <Globe size={48} className="mx-auto mb-4 opacity-50" />
          <p>No sites found. Create a Brand entity with "Is Site Owner" enabled.</p>
        </div>
      )}
    </div>
  );
}

function AddDomainForm({ brandId, onCreated, onCancel }: { brandId: string; onCreated: () => void; onCancel: () => void }) {
  const [hostname, setHostname] = useState('');
  const [type, setType] = useState('www');
  const [isPrimary, setIsPrimary] = useState(false);
  const [entityTypes, setEntityTypes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleEntityType = (et: string) => {
    setEntityTypes(prev => prev.includes(et) ? prev.filter(t => t !== et) : [...prev, et]);
  };

  const handleSubmit = async () => {
    if (!hostname.trim()) { setError('Hostname is required'); return; }
    setSaving(true);
    setError('');
    try {
      await api.createDomain({
        brand_id: brandId,
        hostname: hostname.trim(),
        type: type as any,
        is_primary: isPrimary,
        entity_types: entityTypes,
      });
      onCreated();
    } catch (err: any) {
      setError(err.error || 'Failed to create domain');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 py-3 bg-zinc-800/30 border-b border-zinc-800 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">New Domain</span>
        <button onClick={onCancel} className="text-zinc-600 hover:text-zinc-400"><X size={14} /></button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <input
          value={hostname}
          onChange={e => setHostname(e.target.value)}
          placeholder="www.example.com"
          className="col-span-2 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
        />
        <select
          value={type}
          onChange={e => setType(e.target.value)}
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
        >
          <option value="www">www</option>
          <option value="blog">blog</option>
          <option value="docs">docs</option>
          <option value="app">app</option>
          <option value="custom">custom</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ENTITY_TYPE_OPTIONS.map(et => (
          <button
            key={et}
            onClick={() => toggleEntityType(et)}
            className={`px-2 py-0.5 rounded text-xs transition-colors ${
              entityTypes.includes(et)
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                : 'bg-zinc-800 text-zinc-500 border border-zinc-700 hover:border-zinc-600'
            }`}
          >
            {et}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs text-zinc-400">
          <input
            type="checkbox"
            checked={isPrimary}
            onChange={e => setIsPrimary(e.target.checked)}
            className="rounded border-zinc-600"
          />
          Primary domain
        </label>
        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-400">{error}</span>}
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg text-xs font-medium transition-colors"
          >
            {saving ? 'Creating...' : 'Create Domain'}
          </button>
        </div>
      </div>
    </div>
  );
}
