import type { FieldGroup, Field, FieldInputType } from '../lib/api';
import { Calendar, Link, Image as ImageIcon, Type, DollarSign, List, AlignLeft, CheckSquare, User, Layers } from 'lucide-react';
import { RefPicker } from './RefPicker';
import { DimensionSelect } from './DimensionSelect';
import { useFieldDependencyOptional } from './FieldDependencyContext';

interface DynamicFieldRendererProps {
  fieldGroups: FieldGroup[];
  onChange: (groupIndex: number, fieldIndex: number, value: string | number | boolean | null) => void;
  readOnly?: boolean;
}

export function DynamicFieldRenderer({ fieldGroups, onChange, readOnly = false }: DynamicFieldRendererProps) {
  if (!fieldGroups || fieldGroups.length === 0) {
    return (
      <div className="p-8 text-center border-2 border-dashed border-zinc-800 rounded-lg text-zinc-500">
        No specific fields configured for this entity type.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {fieldGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3 bg-zinc-800/50 border-b border-zinc-800 flex items-center gap-2">
            <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
            <h3 className="font-semibold text-zinc-200">{group.name}</h3>
          </div>
          
          <div className="p-5 space-y-5">
            {group.fields.map((field, fieldIndex) => (
              <FieldInput 
                key={fieldIndex}
                field={field}
                onChange={(value) => onChange(groupIndex, fieldIndex, value)}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function FieldInput({ field, onChange, readOnly }: { field: Field; onChange: (v: any) => void; readOnly: boolean }) {
  const commonClasses = "w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all outline-none";
  const labelClasses = "block text-sm font-medium text-zinc-400 mb-1.5 flex items-center gap-2";

  // Phase 4: Access field dependency context for cascading pick-lists
  const depContext = useFieldDependencyOptional();

  const getIcon = (type: FieldInputType) => {
    // Check if this is a dimension field
    if (field.dimension) return <Layers size={14} />;

    switch(type) {
      case 'text': return <Type size={14} />;
      case 'textarea': return <AlignLeft size={14} />;
      case 'currency': return <DollarSign size={14} />;
      case 'date': return <Calendar size={14} />;
      case 'url': return <Link size={14} />;
      case 'image': return <ImageIcon size={14} />;
      case 'boolean': return <CheckSquare size={14} />;
      case 'select':
      case 'multiselect':
        return <List size={14} />;
      case 'Record':
      case 'ref':
        return <User size={14} />;
      default: return <Type size={14} />;
    }
  };

  const renderInput = () => {
    switch (field.inputType) {
      case 'Record':
      case 'ref': // legacy alias
        return (
          <RefPicker 
            value={typeof field.value === 'string' ? field.value : null} 
            onChange={(val) => onChange(val)}
            targetType={field.ref_target || 'contact'} // default fallback
            disabled={readOnly}
          />
        );
      case 'textarea':
      case 'richtext': // Fallback to textarea for now
        return (
          <textarea
            value={String(field.value || '')}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            rows={4}
            className={`${commonClasses} resize-y`}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center cursor-pointer gap-3">
            <div className={`relative w-11 h-6 rounded-full transition-colors ${field.value ? 'bg-indigo-600' : 'bg-zinc-700'}`}>
              <div 
                className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${field.value ? 'translate-x-5' : ''}`}
              />
            </div>
            <span className="text-zinc-300 select-none">
              {field.value ? 'Enabled' : 'Disabled'}
            </span>
            <input 
              type="checkbox" 
              className="hidden" 
              checked={!!field.value} 
              onChange={(e) => onChange(e.target.checked)}
              disabled={readOnly}
            />
          </label>
        );

      case 'select':
        // Phase 4: Check if this is a dimension field (has field.dimension property)
        if (field.dimension) {
          // Build sibling values from dependency context
          const siblingValues = depContext?.fieldValues || {};

          return (
            <DimensionSelect
              dimension={field.dimension}
              value={typeof field.value === 'string' ? field.value : null}
              onChange={(val) => {
                onChange(val);
                // Update dependency context if available
                depContext?.setFieldValue(field.name, val);
              }}
              dependsOn={field.dependsOn}
              siblingValues={siblingValues}
              disabled={readOnly}
              placeholder={`Select ${field.name.toLowerCase()}...`}
            />
          );
        }

        // Regular select with static options
        return (
          <select
            value={String(field.value || '')}
            onChange={(e) => onChange(e.target.value)}
            disabled={readOnly}
            className={commonClasses}
          >
            <option value="">Select option...</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );

      case 'date':
        return (
           <div className="relative">
             <input
               type="date"
               value={String(field.value || '')}
               onChange={(e) => onChange(e.target.value)}
               disabled={readOnly}
               className={commonClasses}
             />
           </div>
        );

      case 'currency':
        return (
           <div className="relative">
             <span className="absolute left-3 top-2.5 text-zinc-500">$</span>
             <input
               type="number"
               step="0.01"
               value={String(field.value || '')}
               onChange={(e) => onChange(e.target.value)}
               disabled={readOnly}
               className={`${commonClasses} pl-8`}
               placeholder="0.00"
             />
           </div>
        );

      case 'multiselect':
        const selectedValues = Array.isArray(field.value) ? field.value : [];
        return (
          <div className="space-y-2">
             <div className="flex flex-wrap gap-2 mb-2">
                 {selectedValues.map((val: string) => (
                    <span key={val} className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-500/20 text-indigo-300 text-xs rounded-md">
                        {val}
                        <button 
                           type="button" 
                           onClick={() => onChange(selectedValues.filter((v: string) => v !== val))}
                           className="hover:text-white"
                        >
                           ×
                        </button>
                    </span>
                 ))}
             </div>
             <select
               onChange={(e) => {
                   if (e.target.value && !selectedValues.includes(e.target.value)) {
                       onChange([...selectedValues, e.target.value]);
                   }
                   e.target.value = ''; // Reset select
               }}
               disabled={readOnly}
               className={commonClasses}
             >
               <option value="">+ Add {field.name}...</option>
               {field.options?.filter(opt => !selectedValues.includes(opt)).map(opt => (
                 <option key={opt} value={opt}>{opt}</option>
               ))}
             </select>
          </div>
        );

      default: // text, number, url, image
        return (
          <div className="space-y-2">
            <input
              type={field.inputType === 'number' ? 'number' : 'text'}
              value={String(field.value || '')}
              onChange={(e) => onChange(e.target.value)}
              disabled={readOnly}
              className={commonClasses}
              placeholder={field.name}
            />
            {field.inputType === 'image' && field.value && typeof field.value === 'string' && (
              <div className="relative w-full h-32 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden flex items-center justify-center group">
                 <img 
                   src={field.value} 
                   alt={field.name} 
                   className="max-w-full max-h-full object-contain"
                   onError={(e) => (e.currentTarget.style.display = 'none')} 
                 />
                 <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-xs text-white">Preview</span>
                 </div>
              </div>
            )}
            {field.inputType === 'url' && field.value && typeof field.value === 'string' && (
               <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                 <Link size={12} /> Open Link
               </a>
            )}
          </div>
        );
    }
  };

  const charCount = (field.inputType === 'text' || field.inputType === 'textarea' || field.inputType === 'richtext') && field.maxChars
    ? String(field.value || '').length
    : null;

  const charRatio = charCount !== null && field.maxChars ? charCount / field.maxChars : 0;

  return (
    <div>
      <label className={labelClasses}>
        {getIcon(field.inputType)}
        {field.name}
        {field.required && <span className="text-red-400">*</span>}
        {field.maxChars && (
          <span className={`ml-auto text-xs font-mono ${
            charRatio >= 1 ? 'text-red-400' : charRatio >= 0.8 ? 'text-yellow-400' : 'text-zinc-500'
          }`}>
            {charCount}/{field.maxChars}
            {field.typographyRole && <span className="text-zinc-600 ml-1">{field.typographyRole}</span>}
          </span>
        )}
      </label>
      {renderInput()}
    </div>
  );
}
