import { useState, useEffect } from 'react';
import { RefreshCw, FileCode, ArrowRight, Globe, Layers } from 'lucide-react';
import { api } from '../lib/api';

interface DerivedSection {
  id: string;
  binding: { kind: string; target?: string; cardinality?: string; relationKey?: string };
  presentationKey: string | null;
  placement: { slot: string; order: number };
  entities: Array<{ id: string; slug: string; name: string; type: string }>;
}

interface DerivedPage {
  entityId: string;
  entitySlug: string;
  entityType: string;
  entityName: string;
  route: string;
  sections: DerivedSection[];
  segmentPages: Array<{ path: string; entity: string; segment?: string }>;
}

export function DerivedPagesPanel({ entitySlug }: { entitySlug: string }) {
  const [derived, setDerived] = useState<DerivedPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    if (!entitySlug) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.derivePage(entitySlug);
      setDerived(data);
    } catch (err: any) {
      setError(err.error || 'Failed to derive page');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, [entitySlug]);

  if (loading) {
    return (
      <div className="text-zinc-400 flex items-center gap-2 py-4">
        <RefreshCw size={16} className="animate-spin" /> Deriving page...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
        {error}
      </div>
    );
  }

  if (!derived) {
    return (
      <div className="text-zinc-500 py-4 text-sm">
        Save the entity first to see derived pages.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Route */}
      <div className="flex items-center gap-2 text-sm">
        <Globe size={14} className="text-indigo-400" />
        <span className="font-mono text-indigo-300">{derived.route}</span>
        <button onClick={fetch} className="ml-auto p-1 hover:bg-zinc-800 rounded" title="Refresh">
          <RefreshCw size={14} className="text-zinc-500" />
        </button>
      </div>

      {/* Sections */}
      <div>
        <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2 flex items-center gap-1">
          <Layers size={12} /> Sections ({derived.sections.length})
        </h4>
        <div className="space-y-2">
          {derived.sections.map((section, i) => (
            <div key={section.id} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-zinc-500">#{i + 1}</span>
                {section.binding.kind === 'self' ? (
                  <span className="px-2 py-0.5 text-xs rounded bg-emerald-900/50 text-emerald-300">self</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <span className="px-2 py-0.5 text-xs rounded bg-blue-900/50 text-blue-300">related</span>
                    <ArrowRight size={10} className="text-zinc-600" />
                    <span className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-300">{section.binding.target}</span>
                    <span className="text-xs text-zinc-500">{section.binding.cardinality}</span>
                  </span>
                )}
                <span className="ml-auto px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400">
                  {section.placement.slot}
                </span>
              </div>
              {section.presentationKey && (
                <div className="flex items-center gap-1 text-xs text-zinc-500 mt-1">
                  <FileCode size={10} />
                  <span className="font-mono">{section.presentationKey}</span>
                </div>
              )}
              {section.entities.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {section.entities.map(e => (
                    <span key={e.id} className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-300">
                      {e.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Segment Pages */}
      {derived.segmentPages.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-zinc-500 uppercase mb-2">
            Segment Pages ({derived.segmentPages.length})
          </h4>
          <div className="space-y-1">
            {derived.segmentPages.map(seg => (
              <div key={seg.path} className="flex items-center gap-2 text-sm px-3 py-2 bg-zinc-950 border border-zinc-800 rounded">
                <Globe size={12} className="text-zinc-500" />
                <span className="font-mono text-zinc-300">{seg.path}</span>
                {seg.segment && (
                  <span className="ml-auto px-2 py-0.5 text-xs rounded bg-amber-900/50 text-amber-300">
                    {seg.segment}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
