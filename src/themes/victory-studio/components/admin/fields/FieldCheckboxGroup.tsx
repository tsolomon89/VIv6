import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { FieldStruct } from '../../../../../core/types';

interface Option {
  value: string;
  label: string;
}

interface FieldCheckboxGroupProps {
  field: FieldStruct;
  options: Option[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  error?: string;
}

export function FieldCheckboxGroup({
  field,
  options,
  selectedValues,
  onChange,
  error
}: FieldCheckboxGroupProps) {
  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="flex flex-col gap-2 mb-4">
      <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
        {field.nameField}
      </label>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleToggle(option.value)}
              className={`flex items-center gap-3 p-3 rounded border transition text-left
                ${isSelected
                  ? 'bg-blue-900/30 border-blue-500'
                  : 'bg-neutral-800 border-neutral-700 hover:border-neutral-600'
                }
              `}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition
                ${isSelected
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-neutral-600'
                }
              `}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm ${isSelected ? 'text-blue-400' : 'text-neutral-300'}`}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
      {error && (
        <span className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> {error}
        </span>
      )}
    </div>
  );
}
