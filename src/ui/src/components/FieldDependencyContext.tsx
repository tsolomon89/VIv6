import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface FieldDependencyContextValue {
  fieldValues: Record<string, string>;
  setFieldValue: (fieldName: string, value: string) => void;
  getFilterForField: (dependsOn: string[]) => Record<string, string>;
  registerField: (fieldName: string, dimension?: string) => void;
  getDimensionForField: (fieldName: string) => string | undefined;
}

const FieldDependencyContext = createContext<FieldDependencyContextValue | null>(null);

interface FieldDependencyProviderProps {
  children: ReactNode;
  initialValues?: Record<string, string>;
}

/**
 * FieldDependencyProvider - Provides shared state for tracking field values within a form.
 * This enables dimension fields to observe sibling field values for cascading filtering.
 *
 * Usage:
 * <FieldDependencyProvider>
 *   <YourForm />
 * </FieldDependencyProvider>
 *
 * Inside components:
 * const { fieldValues, setFieldValue, getFilterForField } = useFieldDependency();
 */
export function FieldDependencyProvider({ children, initialValues = {} }: FieldDependencyProviderProps) {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>(initialValues);
  const [fieldDimensions, setFieldDimensions] = useState<Record<string, string>>({});

  const setFieldValue = useCallback((fieldName: string, value: string) => {
    setFieldValues(prev => ({ ...prev, [fieldName]: value }));
  }, []);

  const registerField = useCallback((fieldName: string, dimension?: string) => {
    if (dimension) {
      setFieldDimensions(prev => ({ ...prev, [fieldName]: dimension }));
    }
  }, []);

  const getDimensionForField = useCallback((fieldName: string) => {
    return fieldDimensions[fieldName];
  }, [fieldDimensions]);

  const getFilterForField = useCallback((dependsOn: string[]) => {
    const filter: Record<string, string> = {};

    for (const dep of dependsOn) {
      const value = fieldValues[dep];
      if (value) {
        // Get the dimension name for the dependent field, or derive from field name
        const dimension = fieldDimensions[dep] || dep.toLowerCase().replace(/\s+/g, '_');
        filter[dimension] = value;
      }
    }

    return filter;
  }, [fieldValues, fieldDimensions]);

  return (
    <FieldDependencyContext.Provider
      value={{
        fieldValues,
        setFieldValue,
        getFilterForField,
        registerField,
        getDimensionForField
      }}
    >
      {children}
    </FieldDependencyContext.Provider>
  );
}

/**
 * Hook to access field dependency context.
 * Must be used within a FieldDependencyProvider.
 */
export function useFieldDependency() {
  const ctx = useContext(FieldDependencyContext);
  if (!ctx) {
    throw new Error('useFieldDependency must be used within a FieldDependencyProvider');
  }
  return ctx;
}

/**
 * Hook to check if we're inside a FieldDependencyProvider.
 * Returns null if not inside provider (allows graceful fallback).
 */
export function useFieldDependencyOptional() {
  return useContext(FieldDependencyContext);
}
