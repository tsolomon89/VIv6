import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { FieldGroupStruct, FieldStruct, PropertyStruct } from '../../../../../core/types';
import { FieldDynamic } from './FieldDynamic';

interface FieldGroupListProps {
  fieldGroups: FieldGroupStruct[];
  values: Record<string, PropertyStruct[]>;
  onChange: (fieldId: string, value: PropertyStruct[]) => void;
  errors?: Record<string, string>;
  onImageUpload?: (file: File) => Promise<string>;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

interface FieldGroupProps {
  fieldGroup: FieldGroupStruct;
  values: Record<string, PropertyStruct[]>;
  onChange: (fieldId: string, value: PropertyStruct[]) => void;
  errors?: Record<string, string>;
  onImageUpload?: (file: File) => Promise<string>;
  collapsible: boolean;
  defaultExpanded: boolean;
}

function FieldGroup({
  fieldGroup,
  values,
  onChange,
  errors,
  onImageUpload,
  collapsible,
  defaultExpanded
}: FieldGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Sort fields by displayPosition
  const sortedFields = [...fieldGroup.fieldStructs].sort(
    (a, b) => a.displayPosition - b.displayPosition
  );

  return (
    <div className="border border-neutral-700 rounded-lg overflow-hidden">
      {/* Group Header */}
      <button
        type="button"
        onClick={() => collapsible && setIsExpanded(!isExpanded)}
        className={`w-full flex items-center gap-2 px-4 py-3 bg-neutral-800/50 border-b border-neutral-700 text-left
          ${collapsible ? 'cursor-pointer hover:bg-neutral-800' : 'cursor-default'}
        `}
      >
        {collapsible && (
          isExpanded
            ? <ChevronDown className="w-4 h-4 text-neutral-500" />
            : <ChevronRight className="w-4 h-4 text-neutral-500" />
        )}
        <Layers className="w-4 h-4 text-neutral-500" />
        <span className="text-sm font-medium text-neutral-300">
          {fieldGroup.nameFieldGroup}
        </span>
        <span className="text-xs text-neutral-500 ml-auto">
          {sortedFields.length} field{sortedFields.length !== 1 ? 's' : ''}
        </span>
      </button>

      {/* Fields */}
      {(!collapsible || isExpanded) && (
        <div className="p-4 space-y-2">
          {sortedFields.map((field) => (
            <FieldDynamic
              key={field.idRefFieldRecord}
              field={field}
              value={values[field.idRefFieldRecord] || []}
              onChange={(val) => onChange(field.idRefFieldRecord, val)}
              error={errors?.[field.idRefFieldRecord]}
              onImageUpload={onImageUpload}
            />
          ))}
          {sortedFields.length === 0 && (
            <div className="text-sm text-neutral-500 text-center py-4">
              No fields in this group
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Renders a list of field groups with collapsible sections.
 * Each group contains dynamic fields based on FieldStruct definitions.
 */
export function FieldGroupList({
  fieldGroups,
  values,
  onChange,
  errors,
  onImageUpload,
  collapsible = true,
  defaultExpanded = true
}: FieldGroupListProps) {
  if (fieldGroups.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No field groups defined</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fieldGroups.map((group) => (
        <FieldGroup
          key={group.idRefFieldGroupRecord}
          fieldGroup={group}
          values={values}
          onChange={onChange}
          errors={errors}
          onImageUpload={onImageUpload}
          collapsible={collapsible}
          defaultExpanded={defaultExpanded}
        />
      ))}
    </div>
  );
}
