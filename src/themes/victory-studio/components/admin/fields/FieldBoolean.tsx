import React from 'react';
import { Check } from 'lucide-react';
import { FieldStruct } from '../../../../../core/types';

interface FieldBooleanProps {
  field: FieldStruct;
  value: boolean;
  onChange: (value: boolean) => void;
  error?: string;
}

export function FieldBoolean({
  field,
  value,
  onChange,
  error
}: FieldBooleanProps) {
  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
        {field.nameField}
      </label>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`flex items-center gap-3 p-3 rounded border transition
          ${value
            ? 'bg-blue-900/30 border-blue-500 text-blue-400'
            : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-600'
          }
        `}
      >
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition
          ${value
            ? 'bg-blue-500 border-blue-500'
            : 'border-neutral-600'
          }
        `}>
          {value && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className="text-sm">{value ? 'Yes' : 'No'}</span>
      </button>
      {error && (
        <span className="text-red-500 text-xs">{error}</span>
      )}
    </div>
  );
}
