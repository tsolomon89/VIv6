import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { FieldStruct } from '../../../../../core/types';

interface FieldDateTimeProps {
  field: FieldStruct;
  value: string | null;
  onChange: (value: string | null) => void;
  error?: string;
  includeTime?: boolean;
}

export function FieldDateTime({
  field,
  value,
  onChange,
  error,
  includeTime = false
}: FieldDateTimeProps) {
  const inputType = includeTime ? 'datetime-local' : 'date';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val || null);
  };

  // Format value for display
  const displayValue = value || '';

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
        {includeTime ? <Clock className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
        {field.nameField}
      </label>
      <input
        type={inputType}
        value={displayValue}
        onChange={handleChange}
        className={`w-full bg-neutral-800 border rounded p-2 text-white focus:outline-none transition
          ${error ? 'border-red-500 focus:border-red-500' : 'border-neutral-700 focus:border-blue-500'}
          [color-scheme:dark]
        `}
      />
      {error && (
        <span className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
    </div>
  );
}
