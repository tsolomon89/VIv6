import React from 'react';
import { AlertCircle } from 'lucide-react';
import { FieldStruct } from '../../../../../core/types';

interface FieldTextProps {
  field: FieldStruct;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  multiline?: boolean;
  maxLength?: number;
  placeholder?: string;
}

export function FieldText({
  field,
  value,
  onChange,
  error,
  multiline = false,
  maxLength,
  placeholder
}: FieldTextProps) {
  const currentLength = value?.length || 0;
  const isOverLimit = maxLength && currentLength > maxLength;

  const inputProps = {
    value: value || '',
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder: placeholder || `Enter ${field.nameField}`,
    className: `w-full bg-neutral-800 border rounded p-2 text-white focus:outline-none transition resize-none
      ${error || isOverLimit ? 'border-red-500 focus:border-red-500' : 'border-neutral-700 focus:border-blue-500'}
    `
  };

  return (
    <div className="flex flex-col gap-1 mb-4">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
          {field.nameField}
        </label>
        {maxLength && (
          <span className={`text-[10px] font-mono ${isOverLimit ? 'text-red-500 font-bold' : 'text-neutral-500'}`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>

      {multiline ? (
        <textarea
          {...inputProps}
          rows={4}
        />
      ) : (
        <input
          type="text"
          {...inputProps}
        />
      )}

      {error && (
        <span className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
      {isOverLimit && !error && (
        <span className="text-red-500 text-xs">Exceeds character limit</span>
      )}
    </div>
  );
}
