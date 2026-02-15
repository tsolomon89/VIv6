import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FieldStruct } from '../../../../../core/types';

interface FieldNumberProps {
  field: FieldStruct;
  value: number | null;
  onChange: (value: number | null) => void;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
}

export function FieldNumber({
  field,
  value,
  onChange,
  error,
  min,
  max,
  step = 1
}: FieldNumberProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(null);
    } else {
      const num = parseFloat(val);
      if (!isNaN(num)) {
        onChange(num);
      }
    }
  };

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
        {field.nameField}
      </label>
      <input
        type="number"
        value={value ?? ''}
        onChange={handleChange}
        min={min}
        max={max}
        step={step}
        className={`w-full bg-neutral-800 border rounded p-2 text-white focus:outline-none transition
          ${error ? 'border-red-500 focus:border-red-500' : 'border-neutral-700 focus:border-blue-500'}
        `}
        placeholder={`Enter ${field.nameField}`}
      />
      {error && (
        <span className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
    </div>
  );
}
