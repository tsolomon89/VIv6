import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { api, type FilteredDimensionResponse } from '../lib/api';

interface DimensionSelectProps {
  dimension: string;
  value: string | null;
  onChange: (value: string) => void;
  dependsOn?: string[];
  siblingValues?: Record<string, string>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

interface DimensionOption {
  id: string;
  slug: string;
  label: string;
}

/**
 * DimensionSelect - A select component that fetches dimension values from the API
 * and supports cascading/interdependent filtering via dimension_dependencies.
 *
 * Usage:
 * <DimensionSelect
 *   dimension="job_title"
 *   value={currentValue}
 *   onChange={(val) => setField('Job Title', val)}
 *   dependsOn={['Department']}
 *   siblingValues={{ Department: 'engineering' }}
 * />
 */
export function DimensionSelect({
  dimension,
  value,
  onChange,
  dependsOn = [],
  siblingValues = {},
  disabled = false,
  placeholder,
  className = ''
}: DimensionSelectProps) {
  const [options, setOptions] = useState<DimensionOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isFiltered, setIsFiltered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable refs to avoid infinite loops
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  onChangeRef.current = onChange;
  valueRef.current = value;

  // Build a stable filter key from sibling values
  // Only recalculate when the actual filter values change
  const filterKey = useMemo(() => {
    if (dependsOn.length === 0) return '';
    return dependsOn.map(dep => {
      const val = siblingValues[dep];
      const dimName = dep.toLowerCase().replace(/\s+/g, '_');
      return val ? `${dimName}:${val}` : '';
    }).filter(Boolean).join('|');
  }, [dependsOn, siblingValues]);

  // Build filter object from the key
  const buildFilter = useCallback((): Record<string, string> | undefined => {
    if (!filterKey) return undefined;
    const filter: Record<string, string> = {};
    for (const part of filterKey.split('|')) {
      const [dim, val] = part.split(':');
      if (dim && val) filter[dim] = val;
    }
    return Object.keys(filter).length > 0 ? filter : undefined;
  }, [filterKey]);

  // Fetch options whenever dimension or filter changes
  useEffect(() => {
    const fetchOptions = async () => {
      setLoading(true);
      setError(null);

      try {
        const filter = buildFilter();
        const result: FilteredDimensionResponse = await api.listFilteredDimensionValues(dimension, filter);

        setOptions(result.values.map(v => ({
          id: v.id,
          slug: v.slug,
          label: v.label
        })));
        setIsFiltered(result.filtered);

        // If current value is no longer in options, clear it (use refs to avoid dep issues)
        const currentValue = valueRef.current;
        if (currentValue && !result.values.some(v => v.slug === currentValue)) {
          onChangeRef.current('');
        }
      } catch (err) {
        console.error(`Failed to load ${dimension} values:`, err);
        setError(`Failed to load options`);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [dimension, buildFilter]); // Removed value and onChange from deps - use refs instead

  const baseClasses = "w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none";

  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading}
        className={`${baseClasses} ${className} ${loading ? 'opacity-50 cursor-wait' : ''} ${error ? 'border-red-500' : ''}`}
      >
        <option value="">
          {loading ? 'Loading...' : placeholder || `Select ${dimension.replace(/_/g, ' ')}...`}
        </option>
        {options.map(opt => (
          <option key={opt.slug} value={opt.slug}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Filter indicator */}
      {isFiltered && !loading && (
        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-[10px] text-indigo-400 font-medium uppercase tracking-wider">
          filtered
        </span>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
