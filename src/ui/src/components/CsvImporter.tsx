import { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../lib/api';
import type { ApiError, CsvImportMappings, CsvImportResult } from '../lib/api';

interface CsvImporterProps {
  onImported: () => void;
  onClose: () => void;
}

export function CsvImporter({ onImported, onClose }: CsvImporterProps) {
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);
  const [mappings, setMappings] = useState<CsvImportMappings>({
    dimension: '', slugColumn: '', labelColumn: '',
    parentDimension: '', parentColumn: '', metadataColumns: [],
  });
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasFile, setHasFile] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) {
        setError('CSV must have a header row and at least one data row');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        const obj: Record<string, string> = {};
        headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
        return obj;
      });

      setCsvColumns(headers);
      setCsvRows(rows);
      setMappings(prev => ({ ...prev, slugColumn: headers[0], labelColumn: headers[0] }));
      setResult(null);
      setError(null);
      setHasFile(true);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!mappings.dimension || !mappings.labelColumn) {
      setError('Dimension name and label column are required');
      return;
    }
    setImporting(true);
    setError(null);
    try {
      const res = await api.importDimensionCsv(csvRows, mappings);
      setResult(res);
      onImported();
    } catch (err) {
      setError((err as ApiError).error || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  const updateMapping = <K extends keyof CsvImportMappings>(key: K, value: CsvImportMappings[K]) => {
    setMappings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase">
          CSV Import {hasFile && `(${csvRows.length} rows, ${csvColumns.length} columns)`}
        </h2>
        <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={16} /></button>
      </div>

      {!hasFile ? (
        <label className="flex items-center justify-center h-24 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
          <span className="text-sm text-zinc-500">Click to select a CSV file</span>
          <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
        </label>
      ) : (
        <>
          {/* Column mappings */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Dimension Name</label>
              <input
                value={mappings.dimension}
                onChange={e => updateMapping('dimension', e.target.value)}
                placeholder="e.g., industry, sector"
                className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Label Column</label>
              <select value={mappings.labelColumn} onChange={e => updateMapping('labelColumn', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white">
                {csvColumns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Slug Column (or same as label)</label>
              <select value={mappings.slugColumn} onChange={e => updateMapping('slugColumn', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white">
                {csvColumns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Parent Dimension (optional)</label>
              <input
                value={mappings.parentDimension || ''}
                onChange={e => updateMapping('parentDimension', e.target.value)}
                placeholder="e.g., sector"
                className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Parent Column (optional)</label>
              <select value={mappings.parentColumn || ''} onChange={e => updateMapping('parentColumn', e.target.value)}
                className="w-full px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded text-sm text-white">
                <option value="">None</option>
                {csvColumns.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="max-h-40 overflow-auto mb-3 rounded border border-zinc-800">
            <table className="w-full text-xs">
              <thead className="bg-zinc-800 sticky top-0">
                <tr>{csvColumns.map(c => <th key={c} className="px-2 py-1 text-left text-zinc-400">{c}</th>)}</tr>
              </thead>
              <tbody>
                {csvRows.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t border-zinc-800">
                    {csvColumns.map(c => <td key={c} className="px-2 py-1 text-zinc-300">{row[c]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-3 p-2 bg-red-900/50 border border-red-700 rounded text-red-200 text-xs">{error}</div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button onClick={handleImport} disabled={importing || !mappings.dimension}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg text-sm">
              {importing ? 'Importing...' : `Import ${csvRows.length} rows`}
            </button>
            {result && (
              <span className="text-sm text-zinc-400">
                Created: {result.created}, Skipped: {result.skipped}, Parents: {result.parents}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
