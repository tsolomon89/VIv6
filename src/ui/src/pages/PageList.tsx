import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Trash2, RefreshCw, Eye, Edit2 } from 'lucide-react';
import { api } from '../lib/api';
import { showToast } from '../hooks/useToast';
import type { PageAsset, ApiError } from '../lib/api';

export function PageList() {
  const [pages, setPages] = useState<PageAsset[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listPages(undefined, subjectFilter || undefined);
      setPages(data);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, [subjectFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete page "${name}"? This cannot be undone.`)) return;

    try {
      await api.deletePage(id);
      setPages(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      const apiError = err as ApiError;
      showToast.error(apiError.error || 'Failed to delete page');
    }
  };

  // Extract subject type from page config
  const getSubjectType = (page: PageAsset): string => {
    return page.data?.pageConfig?.pageSubject?.target || 'unknown';
  };

  // Get unique subject types from loaded pages for filter options
  const subjectTypes = Array.from(new Set(pages.map(getSubjectType))).sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchPages}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <Link
            to="/pages/new"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus size={18} />
            New Page
          </Link>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
        >
          <option value="">All Subject Types</option>
          {subjectTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <span className="text-sm text-zinc-500">
          {pages.length} page{pages.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="text-zinc-400 flex items-center gap-2">
          <RefreshCw size={18} className="animate-spin" />
          Loading...
        </div>
      ) : pages.length === 0 ? (
        <div className="text-center py-12">
          <FileText size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-zinc-400 mb-2">No pages found</h3>
          <p className="text-zinc-500 mb-4">
            {subjectFilter
              ? `No pages with subject type "${subjectFilter}"`
              : 'Create your first page to get started'}
          </p>
          <Link
            to="/pages/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus size={18} />
            Create Page
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <table className="w-full">
            <thead className="bg-zinc-900">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Subject</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Slug</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Sections</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-zinc-400">Updated</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-zinc-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link to={`/editor?pageId=${page.id}`} className="text-indigo-400 hover:underline">
                      {page.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 text-xs rounded bg-zinc-800 text-zinc-300">
                      {getSubjectType(page)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 font-mono text-sm">{page.slug}</td>
                  <td className="px-4 py-3 text-zinc-400 text-sm">
                    {page.data?.sections?.length || 0}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">
                    {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/editor?pageId=${page.id}&mode=overlay`}
                        className="p-1 text-zinc-500 hover:text-white transition-colors"
                        title="Edit in Visual Editor"
                      >
                        <Edit2 size={16} />
                      </Link>
                      <Link
                        to={`/preview/${page.slug}`}
                        className="p-1 text-zinc-500 hover:text-emerald-400 transition-colors"
                        title="Preview"
                      >
                        <Eye size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(page.id, page.name)}
                        className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
