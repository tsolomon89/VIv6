
import React, { useState } from 'react';
import { useForm, UseFormReturn, Control, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sparkles, AlertCircle } from 'lucide-react';

interface SchemaFormProps<T extends z.ZodType<any, any>> {
    schema: T;
    defaultValues?: any;
    onSubmit: (data: z.infer<T>) => void;
    title?: string;
    onCancel?: () => void;
    highlightField?: string;
}

// Helper to extract max length and description metadata
function getFieldConstraints(schema: z.ZodTypeAny) {
    let max = -1;
    let role = '';
    
    // Recursive unwrap to find the underlying checkable schema
    let current = schema;
    while (
        current instanceof z.ZodOptional || 
        current instanceof z.ZodNullable || 
        (current as any)._def?.typeName === 'ZodEffects' ||
        (current as any)._def.innerType
    ) {
        if ((current as any)._def.innerType) {
            current = (current as any)._def.innerType;
        } else if ((current as any)._def.schema) {
            current = (current as any)._def.schema;
        } else {
            break;
        }
    }

    const def = (current as any)._def;

    // Check for .max() in checks (Zod 3/4 common pattern)
    if (def.checks) {
        const maxCheck = def.checks.find((c: any) => c.kind === 'max');
        if (maxCheck) max = maxCheck.value;
    }

    // Check for .describe() metadata
    const description = schema.description || current.description;
    if (description) {
        const parts = description.split('|');
        parts.forEach(part => {
            const [key, val] = part.split(':');
            if (key === 'max') max = parseInt(val, 10);
            if (key === 'role') role = val;
        });
    }

    return { max, role };
}

// Recursive helper to get fields from Zod Schema
function getZodFields(schema: z.ZodType<any, any>): Record<string, z.ZodTypeAny> {
    const def = (schema as any)._def;
    
    if (schema instanceof z.ZodObject) {
        return schema.shape;
    }
    
    // Handle Effects (refine, transform) - lenient check
    if (def.schema) {
        return getZodFields(def.schema);
    }
    
    // Handle Optional/Nullable
    if (def.innerType) {
         return getZodFields(def.innerType);
    }
    
    return {};
}

import { apiClient } from '../../../api/client'; // Add import

// ... (existing code, skipping to FieldRenderer)

// Field Renderer
const FieldRenderer = ({ name, fieldSchema, control, highlightField }: { name: string, fieldSchema: z.ZodTypeAny, control: Control<any>, highlightField?: string }) => {
    let type = 'text';
    let options: string[] = [];

    const { max, role } = getFieldConstraints(fieldSchema);
    const [isRewriting, setIsRewriting] = useState(false); // Local loading state

    // Schema Type Inference
    let actualSchema = fieldSchema;
    while ((actualSchema as any)._def.innerType) {
        actualSchema = (actualSchema as any)._def.innerType;
    }
    
    const def = (actualSchema as any)._def;

    if (actualSchema instanceof z.ZodNumber) type = 'number';
    if (actualSchema instanceof z.ZodEnum || (def.typeName === 'ZodEnum')) {
        type = 'select';
        options = def.values || [];
    }

    // Logic for AI Rewrite
    const handleRewrite = async (currentValue: string, onChange: (val: string) => void) => {
        if (!currentValue || isRewriting) return;
        
        try {
            setIsRewriting(true);
            const optimized = await apiClient.rewriteContent(currentValue, { max, role });
            onChange(optimized);
        } catch (e) {
            alert("Rewrite failed");
            console.error(e);
        } finally {
            setIsRewriting(false);
        }
    };

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState: { error } }) => {
                const currentLength = typeof field.value === 'string' ? field.value.length : 0;
                const isOverLimit = max > 0 && currentLength > max;
                
                return (
                    <div className="flex flex-col gap-1 mb-4 group">
                        <div className="flex justify-between items-baseline">
                            <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                                {name}
                                {role && <span className="bg-neutral-800 text-neutral-500 px-1 rounded text-[10px] lowercase">{role}</span>}
                            </label>
                            {max > 0 && (
                                <span className={`text-[10px] font-mono ${isOverLimit ? 'text-red-500 font-bold' : 'text-neutral-500'}`}>
                                    {currentLength}/{max}
                                </span>
                            )}
                        </div>
                        
                        <div className="relative">
                            {type === 'select' ? (
                                <select {...field} className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white">
                                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                            ) : (
                                 <input 
                                    {...field}
                                    type={type}
                                    autoFocus={highlightField === name}
                                    value={field.value || ''} 
                                    className={`w-full bg-neutral-800 border rounded p-2 text-white focus:outline-none transition pr-8
                                        ${isOverLimit ? 'border-red-500 focus:border-red-500' : 'border-neutral-700 focus:border-blue-500'}
                                    `}
                                />
                            )}
                            
                            {/* AI Rewrite Button (Only for text inputs) */}
                            {type === 'text' && (
                                <button
                                    type="button"
                                    onClick={() => handleRewrite(field.value, field.onChange)}
                                    className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md transition
                                        ${isOverLimit ? 'text-red-400 hover:bg-red-900/30' : 'text-neutral-500 hover:text-blue-400 hover:bg-neutral-700'}
                                        ${isRewriting ? 'opacity-100 animate-pulse text-blue-400' : 'opacity-0 group-hover:opacity-100 focus:opacity-100'}
                                    `}
                                    title="AI Rewrite"
                                >
                                    <Sparkles className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {error && <span className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3 h-3"/> {error.message}</span>}
                        {isOverLimit && !error && <span className="text-red-500 text-xs">Exceeds character limit</span>}
                    </div>
                );
            }}
        />
    );
};


// Main Component
export function SchemaForm<T extends z.ZodType<any, any>>({ schema, defaultValues, onSubmit, title, onCancel, highlightField }: SchemaFormProps<T>) {
    const form = useForm({
        resolver: zodResolver(schema),
        defaultValues
    });

    const shape = getZodFields(schema);
    
    // Special handling for our 'data' field nesting
    const dataShape = shape['data'] ? getZodFields(shape['data']) : null;

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl max-w-2xl w-full mx-auto">
            <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
                <h3 className="text-xl font-bold text-white">{title || 'Edit Entity'}</h3>
                {onCancel && (
                    <button type="button" onClick={onCancel} className="text-sm text-neutral-400 hover:text-white">Cancel</button>
                )}
            </div>

            <div className="space-y-6">
                {/* Top Level Fields (exclude id, type, data, brand_id if handled elsewhere) */}
                <div className="grid grid-cols-2 gap-4">
                    {['name', 'slug', 'description'].map(key => (
                         shape[key] && <FieldRenderer key={key} name={key} fieldSchema={shape[key]} control={form.control} highlightField={highlightField} />
                    ))}
                </div>

                {/* Data Fields */}
                {dataShape && (
                    <div className="border-t border-neutral-800 pt-4">
                        <h4 className="text-sm font-semibold text-neutral-500 mb-4">Properties</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(dataShape).map(([key, fieldSchema]) => (
                                <FieldRenderer key={`data.${key}`} name={`data.${key}`} fieldSchema={fieldSchema} control={form.control} highlightField={highlightField} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-end gap-3">
                {onCancel && (
                    <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 transition">
                        Cancel
                    </button>
                )}
                <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition">
                    Save Entity
                </button>
            </div>
        </form>
    );
}
