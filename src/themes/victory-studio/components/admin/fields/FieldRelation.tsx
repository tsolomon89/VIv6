import React, { useState, useEffect } from 'react';
import { Link, Check, Search, AlertCircle, Loader2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { FieldStruct, RecordSnapshotStruct, PropertyStruct } from '../../../../../core/types';
import { apiClient, Entity } from '../../../api/client';

interface FieldRelationProps {
  field: FieldStruct;
  value: PropertyStruct[];
  onChange: (value: PropertyStruct[]) => void;
  targetType?: string;
  error?: string;
}

export function FieldRelation({
  field,
  value,
  onChange,
  targetType = 'product',
  error
}: FieldRelationProps) {
  const [options, setOptions] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const isMultiple = field.isSelectMany;

  useEffect(() => {
    if (isOpen) {
      loadOptions();
    }
  }, [isOpen, targetType]);

  const loadOptions = async () => {
    setLoading(true);
    try {
      const data = await apiClient.listEntities(targetType);
      setOptions(data);
    } catch (e) {
      console.error('Failed to load options', e);
    } finally {
      setLoading(false);
    }
  };

  const getSelectedIds = (): string[] => {
    return value
      .filter(p => p.recordSnapshotStruct?.idRefRecord)
      .map(p => p.recordSnapshotStruct!.idRefRecord);
  };

  const handleToggle = (entity: Entity) => {
    const selectedIds = getSelectedIds();
    const isSelected = selectedIds.includes(entity.id);

    if (isMultiple) {
      if (isSelected) {
        onChange(value.filter(p => p.recordSnapshotStruct?.idRefRecord !== entity.id));
      } else {
        const newProperty: PropertyStruct = {
          valueProperty: entity.id,
          recordSnapshotStruct: {
            idRefRecord: entity.id,
            data: { name: entity.name, type: entity.type },
            created_at: new Date().toISOString()
          }
        };
        onChange([...value, newProperty]);
      }
    } else {
      const newProperty: PropertyStruct = {
        valueProperty: entity.id,
        recordSnapshotStruct: {
          idRefRecord: entity.id,
          data: { name: entity.name, type: entity.type },
          created_at: new Date().toISOString()
        }
      };
      onChange([newProperty]);
      setIsOpen(false);
    }
  };

  const handleRemove = (id: string) => {
    onChange(value.filter(p => p.recordSnapshotStruct?.idRefRecord !== id));
  };

  const filteredOptions = options.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedIds = getSelectedIds();

  return (
    <div className="flex flex-col gap-2 mb-4">
      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
        <Link className="w-3 h-3" />
        {field.nameField}
        {isMultiple && <span className="text-neutral-500 font-normal">(multiple)</span>}
      </label>

      {/* Selected items display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((prop) => {
            const name = prop.recordSnapshotStruct?.data?.name || prop.valueProperty;
            const id = prop.recordSnapshotStruct?.idRefRecord || String(prop.valueProperty);
            return (
              <div
                key={id}
                className="flex items-center gap-1 px-2 py-1 bg-blue-900/30 border border-blue-500/50 rounded text-sm text-blue-300"
              >
                <span>{String(name)}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(id)}
                  className="p-0.5 hover:bg-blue-800 rounded transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Dropdown trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between p-3 rounded border transition
          ${isOpen
            ? 'border-blue-500 bg-neutral-800'
            : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
          }
        `}
      >
        <span className="text-sm text-neutral-400">
          {value.length === 0
            ? `Select ${targetType}...`
            : isMultiple
              ? `${value.length} selected`
              : 'Change selection'
          }
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-neutral-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-neutral-500" />
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 p-2 border-b border-neutral-700">
            <Search className="w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder={`Search ${targetType}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent outline-none text-sm w-full text-white placeholder-neutral-500"
              autoFocus
            />
          </div>

          {/* Options */}
          <div className="max-h-[200px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center gap-2 py-4">
                <Loader2 className="w-4 h-4 text-neutral-500 animate-spin" />
                <span className="text-sm text-neutral-500">Loading...</span>
              </div>
            )}

            {!loading && filteredOptions.map(opt => {
              const isSelected = selectedIds.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleToggle(opt)}
                  className={`w-full flex items-center justify-between p-3 text-left transition
                    ${isSelected
                      ? 'bg-blue-900/20 text-blue-200'
                      : 'hover:bg-neutral-700 text-neutral-300'
                    }
                  `}
                >
                  <span className="text-sm">{opt.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                </button>
              );
            })}

            {!loading && filteredOptions.length === 0 && (
              <div className="py-4 text-center text-sm text-neutral-500">
                No {targetType}s found
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
    </div>
  );
}
