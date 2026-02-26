import { useMemo } from 'react';
import type { Entity } from '../../../lib/api';
import { OPPORTUNITY_STAGES } from '../../../../../core/types';
import { getRecordValue } from '../utils/record-utils';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { RecordField } from '../components/RecordField';

interface RecordKanbanBoardProps {
    records: Entity[];
    definition: Entity;
    groupByField: string;
    onRecordClick?: (id: string) => void;
    onUpdateRecord?: (id: string, updates: any) => void;
}

export function RecordKanbanBoard({ records, definition, groupByField, onRecordClick, onUpdateRecord }: RecordKanbanBoardProps) {
    // 1. Get Group Options from Definition (if dimension)
    // We expect the groupByField to be a dimension with options/values
    const groupOptions = useMemo((): string[] => {
        if (!definition.data?.fieldGroups) return [];

        // Find field definition in fieldGroups (handles both canonical and seed formats)
        let fieldDef;
        for (const group of definition.data.fieldGroups) {
            // Handle both formats: group.fields (seed) or group.fieldStructs (canonical)
            const fields = group.fields || group.fieldStructs || [];
            const found = fields.find((f: any) => {
                // Handle both formats: f.name (seed) or f.nameField (canonical)
                const fieldName = f.name || f.nameField || '';
                return fieldName.toLowerCase() === groupByField.toLowerCase();
            });
            if (found) {
                fieldDef = found;
                break;
            }
        }

        // If it's a dimension, we might need to fetch dimension values.
        // For V1, let's assume standard stages or extract unique values from records if not defined.
        if ((fieldDef as any)?.dimension === 'stage' || groupByField === 'stage' || groupByField === 'opportunity_stage') {
            // Use Source of Truth from types
            return [...OPPORTUNITY_STAGES].map(s => s.toUpperCase());
        }

        // Fallback: Extract unique values from records
        const unique = Array.from(new Set(records.map(r => {
            const val = getRecordValue(r, groupByField);
            return val != null ? String(val) : 'Unassigned';
        })));
        return unique.sort();
    }, [definition, groupByField, records]);

    // 2. Group Records
    const groupedRecords = useMemo(() => {
        const groups: Record<string, Entity[]> = {};
        groupOptions.forEach(opt => groups[opt] = []);

        records.forEach(record => {
            const rawVal = getRecordValue(record, groupByField);
            const val = rawVal != null ? String(rawVal) : 'Unassigned';
            // Simple normalization for matching
            const key = groupOptions.find(opt => opt.toLowerCase() === val.toLowerCase()) || 'Unassigned';
            if (!groups[key]) groups[key] = [];
            groups[key].push(record);
        });
        return groups;
    }, [records, groupOptions, groupByField]);

    const handleMove = (e: React.MouseEvent, record: Entity, direction: 'prev' | 'next') => {
        e.stopPropagation();
        if (!onUpdateRecord) return;

        const rawVal = getRecordValue(record, groupByField);
        const currentVal = rawVal != null ? String(rawVal) : 'Unassigned';
        // Normalize
        const currentIndex = groupOptions.findIndex(opt => opt.toLowerCase() === currentVal.toLowerCase());
        if (currentIndex === -1) return;

        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex < 0 || newIndex >= groupOptions.length) return;

        const newStage = groupOptions[newIndex];

        // Construct Update Payload
        let updates: Record<string, any> = {};
        
        // Find field definition (handles both canonical and seed formats)
        let fieldGroup = '';
        if (definition.data && definition.data.fieldGroups) {
             for (const g of definition.data.fieldGroups) {
                 // Handle both formats: g.fields (seed) or g.fieldStructs (canonical)
                 const fields = g.fields || g.fieldStructs || [];
                 const found = fields.find((f: any) => {
                     const fieldName = f.name || f.nameField || '';
                     return fieldName.toLowerCase() === groupByField.toLowerCase();
                 });
                 if (found) {
                     // Handle both formats: g.name (seed) or g.nameFieldGroup (canonical)
                     fieldGroup = g.name || g.nameFieldGroup || '';
                     break;
                 }
             }
        }

        if (fieldGroup) {
             updates = {
                 data: {
                     fieldGroups: [{
                         name: fieldGroup,
                         fields: [{ name: groupByField, value: newStage }]
                     }]
                 }
             };
        } else {
            if (groupByField.toLowerCase() === 'stage') {
                updates = { stage: newStage };
            }
        }
        
        onUpdateRecord(record.id, updates);
    };

    return (
        <div className="flex overflow-x-auto pb-4 gap-4 h-[calc(100vh-12rem)]">
            {groupOptions.map(group => (
                <div key={group} className="flex-none w-72 flex flex-col bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                    {/* Header */}
                    <div className="p-3 border-b border-zinc-800/50 flex items-center justify-between sticky top-0 bg-zinc-900/95 backdrop-blur-sm z-10 rounded-t-xl group/col">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-zinc-300">{group}</span>
                            <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded-full">
                                {groupedRecords[group]?.length || 0}
                            </span>
                        </div>
                        <button className="text-zinc-600 hover:text-zinc-400 opacity-0 group-hover/col:opacity-100 transition-opacity">
                           <Plus size={14} />
                        </button>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 min-h-0">
                        {groupedRecords[group]?.map(record => (
                            <div 
                                key={record.id}
                                className="group p-3 bg-zinc-900 border border-zinc-800 rounded-lg hover:border-zinc-700 cursor-pointer shadow-sm relative"
                                onClick={() => onRecordClick?.(record.id)}
                            >
                                <div className="mb-2 font-medium text-zinc-200">
                                   {record.name || 'Untitled'}
                                </div>
                                
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-500">Amount</span>
                                        <RecordField entity={record} field="amount" className="text-zinc-300" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-500">Yield</span>
                                        <RecordField entity={record} field="projected_yield" className="text-emerald-400" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-zinc-500">Prob</span>
                                        <RecordField entity={record} field="probability" className="text-zinc-400" />
                                    </div>
                                    <div className="flex justify-between items-center text-xs mt-2 pt-2 border-t border-zinc-800/50">
                                        <RecordField entity={record} field="account" className="text-zinc-400" />
                                    </div>
                                </div>
                                
                                {/* Hover Actions */}
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900/90 rounded border border-zinc-700">
                                    <button 
                                        className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                        onClick={(e) => handleMove(e, record, 'prev')}
                                        title="Move Previous"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button 
                                        className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-white"
                                        onClick={(e) => handleMove(e, record, 'next')}
                                        title="Move Next"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                         {(!groupedRecords[group] || groupedRecords[group].length === 0) && (
                            <div className="h-24 flex items-center justify-center text-zinc-700 text-xs italic border-2 border-dashed border-zinc-800/50 rounded-lg">
                                No Deals
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
