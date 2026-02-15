import React, { useState, useCallback, useMemo } from 'react';
import { FieldGroupStruct, PropertyStruct, EntityData } from '../../../../../core/types';
import { FieldGroupList } from '../fields';
import { Loader2 } from 'lucide-react';
import { apiClient } from '../../../api/client';

/** Default image upload handler using apiClient */
const defaultImageUpload = (file: File): Promise<string> => {
  return apiClient.uploadImage(file);
};

interface DynamicSchemaFormProps {
  /** Field group definitions from the entity's data.fieldGroups */
  fieldGroups: FieldGroupStruct[];
  /** Initial values keyed by field ID */
  initialValues?: Record<string, PropertyStruct[]>;
  /** Called when the form is submitted with validated data */
  onSubmit: (values: Record<string, PropertyStruct[]>) => void | Promise<void>;
  /** Form title */
  title?: string;
  /** Cancel handler */
  onCancel?: () => void;
  /** Custom image upload handler */
  onImageUpload?: (file: File) => Promise<string>;
  /** Whether to show field groups as collapsible */
  collapsible?: boolean;
  /** Whether field groups are expanded by default */
  defaultExpanded?: boolean;
  /** Submit button text */
  submitLabel?: string;
  /** Whether the form is in a loading/saving state */
  isLoading?: boolean;
}

/**
 * Dynamic form that renders fields based on FieldGroupStruct definitions.
 * This is the EAV-style form that complements the static Zod-based SchemaForm.
 */
export function DynamicSchemaForm({
  fieldGroups,
  initialValues = {},
  onSubmit,
  title = 'Edit Record',
  onCancel,
  onImageUpload,
  collapsible = true,
  defaultExpanded = true,
  submitLabel = 'Save',
  isLoading = false
}: DynamicSchemaFormProps) {
  const [values, setValues] = useState<Record<string, PropertyStruct[]>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use provided upload handler or default to apiClient
  const imageUploadHandler = useMemo(
    () => onImageUpload ?? defaultImageUpload,
    [onImageUpload]
  );

  const handleFieldChange = useCallback((fieldId: string, value: PropertyStruct[]) => {
    setValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
    // Clear error when field is modified
    if (errors[fieldId]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  }, [errors]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate required fields (fields where isSystem is false and have no default value)
    for (const group of fieldGroups) {
      for (const field of group.fieldStructs) {
        const fieldValue = values[field.idRefFieldRecord];
        const isEmpty = !fieldValue || fieldValue.length === 0 ||
          (fieldValue.length === 1 && fieldValue[0].valueProperty === null);

        // For now, we don't enforce required validation
        // This could be extended based on field metadata
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isLoading || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-2xl max-w-3xl w-full mx-auto"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-neutral-800 pb-4">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="text-sm text-neutral-400 hover:text-white disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Field Groups */}
      <div className="space-y-6">
        <FieldGroupList
          fieldGroups={fieldGroups}
          values={values}
          onChange={handleFieldChange}
          errors={errors}
          onImageUpload={imageUploadHandler}
          collapsible={collapsible}
          defaultExpanded={defaultExpanded}
        />
      </div>

      {/* Footer */}
      <div className="mt-8 flex justify-end gap-3 border-t border-neutral-800 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="px-4 py-2 rounded-lg text-neutral-300 hover:bg-neutral-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isBusy}
          className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition disabled:opacity-50 flex items-center gap-2"
        >
          {isBusy && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

/**
 * Helper function to convert EntityData to the values format expected by DynamicSchemaForm.
 * This extracts property values from the nested FieldGroupStruct structure.
 */
export function extractValuesFromEntityData(
  entityData: EntityData
): Record<string, PropertyStruct[]> {
  const values: Record<string, PropertyStruct[]> = {};

  if (!entityData.fieldGroups) {
    return values;
  }

  for (const group of entityData.fieldGroups) {
    for (const field of group.fieldStructs) {
      values[field.idRefFieldRecord] = field.propertyStructs || [];
    }
  }

  return values;
}

/**
 * Helper function to merge updated values back into the EntityData structure.
 * This preserves the FieldGroupStruct hierarchy while updating property values.
 */
export function mergeValuesToEntityData(
  entityData: EntityData,
  values: Record<string, PropertyStruct[]>
): EntityData {
  if (!entityData.fieldGroups) {
    return entityData;
  }

  const updatedFieldGroups = entityData.fieldGroups.map(group => ({
    ...group,
    fieldStructs: group.fieldStructs.map(field => ({
      ...field,
      propertyStructs: values[field.idRefFieldRecord] || field.propertyStructs
    }))
  }));

  return {
    ...entityData,
    fieldGroups: updatedFieldGroups
  };
}
