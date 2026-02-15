import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { FieldDependencyProvider } from './FieldDependencyContext';
import type { FieldGroup } from '../lib/api';

// Mock child components that make API calls
vi.mock('./RefPicker', () => ({
    RefPicker: ({ value, onChange, targetType, disabled }: any) => (
        <select
            data-testid="ref-picker"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        >
            <option value="">Select {targetType}...</option>
            <option value="contact-1">Contact 1</option>
        </select>
    ),
}));

vi.mock('./DimensionSelect', () => ({
    DimensionSelect: ({ dimension, value, onChange, disabled, placeholder }: any) => (
        <select
            data-testid={`dimension-select-${dimension}`}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
        >
            <option value="">{placeholder || `Select ${dimension}...`}</option>
            <option value="option1">Option 1</option>
        </select>
    ),
}));

describe('DynamicFieldRenderer', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('empty state', () => {
        it('renders empty state when no field groups provided', () => {
            render(<DynamicFieldRenderer fieldGroups={[]} onChange={mockOnChange} />);
            expect(screen.getByText(/No specific fields configured/)).toBeInTheDocument();
        });

        it('renders empty state when fieldGroups is undefined', () => {
            render(<DynamicFieldRenderer fieldGroups={undefined as any} onChange={mockOnChange} />);
            expect(screen.getByText(/No specific fields configured/)).toBeInTheDocument();
        });
    });

    describe('field group rendering', () => {
        it('renders field group with name', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'Basic Info',
                fields: [{ name: 'Title', inputType: 'text', value: '' }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('Basic Info')).toBeInTheDocument();
        });

        it('renders multiple field groups', () => {
            const fieldGroups: FieldGroup[] = [
                { name: 'Group A', fields: [{ name: 'Field A', inputType: 'text', value: '' }] },
                { name: 'Group B', fields: [{ name: 'Field B', inputType: 'text', value: '' }] },
            ];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('Group A')).toBeInTheDocument();
            expect(screen.getByText('Group B')).toBeInTheDocument();
        });
    });

    describe('text field', () => {
        it('renders text input with label', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{ name: 'Title', inputType: 'text', value: 'Test Value' }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('Title')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Test Value')).toBeInTheDocument();
        });

        it('calls onChange when text input changes', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{ name: 'Title', inputType: 'text', value: '' }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            const input = screen.getByPlaceholderText('Title');
            fireEvent.change(input, { target: { value: 'New Title' } });
            expect(mockOnChange).toHaveBeenCalledWith(0, 0, 'New Title');
        });

        it('shows required indicator for required fields', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{ name: 'Email', inputType: 'text', value: '', required: true }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('*')).toBeInTheDocument();
        });
    });

    describe('textarea field', () => {
        it('renders textarea for textarea inputType', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{ name: 'Description', inputType: 'textarea', value: 'Long text' }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('Description')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Long text')).toBeInTheDocument();
        });
    });

    describe('boolean field', () => {
        it('renders toggle for boolean inputType', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{ name: 'Active', inputType: 'boolean', value: false }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('Active')).toBeInTheDocument();
            expect(screen.getByText('Disabled')).toBeInTheDocument();
        });

        it('shows Enabled when boolean is true', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{ name: 'Active', inputType: 'boolean', value: true }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('Enabled')).toBeInTheDocument();
        });

        it('calls onChange when toggle is clicked', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{ name: 'Active', inputType: 'boolean', value: false }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);
            expect(mockOnChange).toHaveBeenCalledWith(0, 0, true);
        });
    });

    describe('select field', () => {
        it('renders select with options', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{
                    name: 'Status',
                    inputType: 'select',
                    value: '',
                    options: ['Draft', 'Published', 'Archived'],
                }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('Status')).toBeInTheDocument();
            expect(screen.getByRole('combobox')).toBeInTheDocument();
        });

        it('calls onChange when select changes', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{
                    name: 'Status',
                    inputType: 'select',
                    value: '',
                    options: ['Draft', 'Published'],
                }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            const select = screen.getByRole('combobox');
            fireEvent.change(select, { target: { value: 'Published' } });
            expect(mockOnChange).toHaveBeenCalledWith(0, 0, 'Published');
        });
    });

    describe('dimension field', () => {
        it('renders DimensionSelect when field has dimension property', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{
                    name: 'Sector',
                    inputType: 'select',
                    value: '',
                    dimension: 'sector',
                }],
            }];

            render(
                <FieldDependencyProvider>
                    <DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />
                </FieldDependencyProvider>
            );
            expect(screen.getByTestId('dimension-select-sector')).toBeInTheDocument();
        });
    });

    describe('date field', () => {
        it('renders date input', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{ name: 'Due Date', inputType: 'date', value: '2024-01-15' }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('Due Date')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2024-01-15')).toBeInTheDocument();
        });
    });

    describe('currency field', () => {
        it('renders currency input with dollar sign', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{ name: 'Price', inputType: 'currency', value: '99.99' }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('Price')).toBeInTheDocument();
            expect(screen.getByText('$')).toBeInTheDocument();
            expect(screen.getByDisplayValue('99.99')).toBeInTheDocument();
        });
    });

    describe('ref field', () => {
        it('renders RefPicker for Record inputType', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{
                    name: 'Owner',
                    inputType: 'Record',
                    value: '',
                    ref_target: 'user',
                }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByTestId('ref-picker')).toBeInTheDocument();
        });
    });

    describe('multiselect field', () => {
        it('renders multiselect with selected values as chips', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{
                    name: 'Tags',
                    inputType: 'multiselect',
                    value: ['Tag1', 'Tag2'],
                    options: ['Tag1', 'Tag2', 'Tag3'],
                }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('Tag1')).toBeInTheDocument();
            expect(screen.getByText('Tag2')).toBeInTheDocument();
        });

        it('removes chip when X is clicked', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{
                    name: 'Tags',
                    inputType: 'multiselect',
                    value: ['Tag1', 'Tag2'],
                    options: ['Tag1', 'Tag2', 'Tag3'],
                }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            const removeButtons = screen.getAllByText('×');
            fireEvent.click(removeButtons[0]);
            expect(mockOnChange).toHaveBeenCalledWith(0, 0, ['Tag2']);
        });
    });

    describe('readOnly mode', () => {
        it('disables text input when readOnly is true', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{ name: 'Title', inputType: 'text', value: 'Test' }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} readOnly={true} />);
            const input = screen.getByDisplayValue('Test');
            expect(input).toBeDisabled();
        });

        it('disables select when readOnly is true', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{
                    name: 'Status',
                    inputType: 'select',
                    value: '',
                    options: ['Draft', 'Published'],
                }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} readOnly={true} />);
            const select = screen.getByRole('combobox');
            expect(select).toBeDisabled();
        });
    });

    describe('character count', () => {
        it('shows character count when maxChars is set', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{
                    name: 'Title',
                    inputType: 'text',
                    value: 'Hello',
                    maxChars: 100,
                }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            expect(screen.getByText('5/100')).toBeInTheDocument();
        });
    });

    describe('image field', () => {
        it('renders image preview when value is provided', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{
                    name: 'Thumbnail',
                    inputType: 'image',
                    value: 'https://example.com/image.jpg',
                }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            const img = screen.getByRole('img');
            expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
        });
    });

    describe('url field', () => {
        it('renders link when url value is provided', () => {
            const fieldGroups: FieldGroup[] = [{
                name: 'General',
                fields: [{
                    name: 'Website',
                    inputType: 'url',
                    value: 'https://example.com',
                }],
            }];

            render(<DynamicFieldRenderer fieldGroups={fieldGroups} onChange={mockOnChange} />);
            const link = screen.getByText('Open Link');
            expect(link).toHaveAttribute('href', 'https://example.com');
        });
    });
});
