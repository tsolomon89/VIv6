import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
    FieldDependencyProvider,
    useFieldDependency,
    useFieldDependencyOptional
} from './FieldDependencyContext';

// Test component that uses the context
function TestConsumer({ onValues }: { onValues: (v: ReturnType<typeof useFieldDependency>) => void }) {
    const ctx = useFieldDependency();
    onValues(ctx);
    return <div data-testid="values">{JSON.stringify(ctx.fieldValues)}</div>;
}

describe('FieldDependencyContext', () => {
    describe('FieldDependencyProvider', () => {
        it('provides context to children', () => {
            const onValues = vi.fn();
            render(
                <FieldDependencyProvider>
                    <TestConsumer onValues={onValues} />
                </FieldDependencyProvider>
            );
            expect(onValues).toHaveBeenCalled();
            expect(onValues.mock.calls[0][0]).toHaveProperty('fieldValues');
            expect(onValues.mock.calls[0][0]).toHaveProperty('setFieldValue');
            expect(onValues.mock.calls[0][0]).toHaveProperty('getFilterForField');
            expect(onValues.mock.calls[0][0]).toHaveProperty('registerField');
        });

        it('accepts initialValues prop', () => {
            render(
                <FieldDependencyProvider initialValues={{ Field1: 'value1' }}>
                    <TestConsumer onValues={() => {}} />
                </FieldDependencyProvider>
            );
            expect(screen.getByTestId('values')).toHaveTextContent('value1');
        });

        it('starts with empty fieldValues when no initialValues', () => {
            render(
                <FieldDependencyProvider>
                    <TestConsumer onValues={() => {}} />
                </FieldDependencyProvider>
            );
            expect(screen.getByTestId('values')).toHaveTextContent('{}');
        });
    });

    describe('setFieldValue', () => {
        it('updates field values', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            act(() => {
                contextRef!.setFieldValue('Department', 'engineering');
            });

            expect(screen.getByTestId('values')).toHaveTextContent('engineering');
        });

        it('preserves existing values when updating', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider initialValues={{ Existing: 'value' }}>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            act(() => {
                contextRef!.setFieldValue('New', 'newvalue');
            });

            const values = screen.getByTestId('values').textContent;
            expect(values).toContain('Existing');
            expect(values).toContain('newvalue');
        });

        it('overwrites existing field value', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider initialValues={{ Field: 'old' }}>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            act(() => {
                contextRef!.setFieldValue('Field', 'new');
            });

            expect(screen.getByTestId('values')).toHaveTextContent('"Field":"new"');
        });
    });

    describe('getFilterForField', () => {
        it('returns filter based on dependsOn fields', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider initialValues={{ Sector: 'tech' }}>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            const filter = contextRef!.getFilterForField(['Sector']);
            expect(filter).toEqual({ sector: 'tech' });
        });

        it('uses registered dimension names', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider initialValues={{ 'My Field': 'value' }}>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            act(() => {
                contextRef!.registerField('My Field', 'custom_dimension');
            });

            const filter = contextRef!.getFilterForField(['My Field']);
            expect(filter).toEqual({ custom_dimension: 'value' });
        });

        it('skips empty values', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider initialValues={{ A: '', B: 'value' }}>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            const filter = contextRef!.getFilterForField(['A', 'B']);
            expect(filter).toEqual({ b: 'value' });
            expect(filter).not.toHaveProperty('a');
        });

        it('returns empty object when no dependsOn fields have values', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider initialValues={{ Other: 'value' }}>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            const filter = contextRef!.getFilterForField(['Missing', 'Also Missing']);
            expect(filter).toEqual({});
        });

        it('converts field names to slug format', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider initialValues={{ 'Job Title': 'engineer' }}>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            const filter = contextRef!.getFilterForField(['Job Title']);
            expect(filter).toEqual({ job_title: 'engineer' });
        });
    });

    describe('registerField', () => {
        it('registers field with dimension mapping', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            act(() => {
                contextRef!.registerField('Department', 'function');
            });

            const dimension = contextRef!.getDimensionForField('Department');
            expect(dimension).toBe('function');
        });

        it('does not register when no dimension provided', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            act(() => {
                contextRef!.registerField('Department');
            });

            const dimension = contextRef!.getDimensionForField('Department');
            expect(dimension).toBeUndefined();
        });
    });

    describe('getDimensionForField', () => {
        it('returns registered dimension', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            act(() => {
                contextRef!.registerField('Sector', 'sector');
                contextRef!.registerField('Industry', 'industry');
            });

            expect(contextRef!.getDimensionForField('Sector')).toBe('sector');
            expect(contextRef!.getDimensionForField('Industry')).toBe('industry');
        });

        it('returns undefined for unregistered field', () => {
            let contextRef: ReturnType<typeof useFieldDependency>;
            render(
                <FieldDependencyProvider>
                    <TestConsumer onValues={(ctx) => { contextRef = ctx; }} />
                </FieldDependencyProvider>
            );

            expect(contextRef!.getDimensionForField('NotRegistered')).toBeUndefined();
        });
    });

    describe('useFieldDependency', () => {
        it('throws when used outside provider', () => {
            const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                render(<TestConsumer onValues={() => {}} />);
            }).toThrow('useFieldDependency must be used within a FieldDependencyProvider');

            consoleError.mockRestore();
        });
    });

    describe('useFieldDependencyOptional', () => {
        function OptionalConsumer({ onResult }: { onResult: (v: ReturnType<typeof useFieldDependencyOptional>) => void }) {
            const ctx = useFieldDependencyOptional();
            onResult(ctx);
            return <div data-testid="optional">{ctx ? 'has context' : 'no context'}</div>;
        }

        it('returns null when used outside provider', () => {
            const onResult = vi.fn();
            render(<OptionalConsumer onResult={onResult} />);
            expect(onResult).toHaveBeenCalledWith(null);
            expect(screen.getByTestId('optional')).toHaveTextContent('no context');
        });

        it('returns context when used inside provider', () => {
            const onResult = vi.fn();
            render(
                <FieldDependencyProvider>
                    <OptionalConsumer onResult={onResult} />
                </FieldDependencyProvider>
            );
            expect(onResult).toHaveBeenCalled();
            expect(onResult.mock.calls[0][0]).not.toBeNull();
            expect(screen.getByTestId('optional')).toHaveTextContent('has context');
        });
    });
});
