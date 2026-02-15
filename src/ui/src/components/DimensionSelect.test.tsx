import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DimensionSelect } from './DimensionSelect';
import { api } from '../lib/api';

// Type the mocked api
const mockApi = vi.mocked(api);

describe('DimensionSelect', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        mockApi.listFilteredDimensionValues.mockReturnValue(new Promise(() => {}));
        render(<DimensionSelect dimension="sector" value={null} onChange={() => {}} />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders options after loading', async () => {
        mockApi.listFilteredDimensionValues.mockResolvedValue({
            dimension: 'sector',
            values: [
                { id: '1', slug: 'tech', label: 'Technology', parentId: null, metadata: {} },
                { id: '2', slug: 'finance', label: 'Finance', parentId: null, metadata: {} },
            ],
            filtered: false,
            filterApplied: {},
        });

        render(<DimensionSelect dimension="sector" value={null} onChange={() => {}} />);

        await waitFor(() => {
            expect(screen.getByText('Technology')).toBeInTheDocument();
            expect(screen.getByText('Finance')).toBeInTheDocument();
        });
    });

    it('calls onChange when selection changes', async () => {
        mockApi.listFilteredDimensionValues.mockResolvedValue({
            dimension: 'sector',
            values: [{ id: '1', slug: 'tech', label: 'Technology', parentId: null, metadata: {} }],
            filtered: false,
            filterApplied: {},
        });
        const onChange = vi.fn();

        render(<DimensionSelect dimension="sector" value={null} onChange={onChange} />);

        await waitFor(() => screen.getByText('Technology'));
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'tech' } });
        expect(onChange).toHaveBeenCalledWith('tech');
    });

    it('clears value when no longer in options', async () => {
        const onChange = vi.fn();
        mockApi.listFilteredDimensionValues.mockResolvedValue({
            dimension: 'sector',
            values: [{ id: '2', slug: 'other', label: 'Other', parentId: null, metadata: {} }],
            filtered: true,
            filterApplied: { industry: 'software' },
        });

        render(<DimensionSelect dimension="sector" value="tech" onChange={onChange} />);

        await waitFor(() => {
            expect(onChange).toHaveBeenCalledWith('');
        });
    });

    it('shows "filtered" indicator when filtered', async () => {
        mockApi.listFilteredDimensionValues.mockResolvedValue({
            dimension: 'sector',
            values: [{ id: '1', slug: 'tech', label: 'Technology', parentId: null, metadata: {} }],
            filtered: true,
            filterApplied: { industry: 'software' },
        });

        render(<DimensionSelect dimension="sector" value={null} onChange={() => {}} />);

        await waitFor(() => {
            expect(screen.getByText('filtered')).toBeInTheDocument();
        });
    });

    it('shows error message on API failure', async () => {
        mockApi.listFilteredDimensionValues.mockRejectedValue(new Error('Network error'));

        render(<DimensionSelect dimension="sector" value={null} onChange={() => {}} />);

        await waitFor(() => {
            expect(screen.getByText('Failed to load options')).toBeInTheDocument();
        });
    });

    it('refetches when sibling values change', async () => {
        mockApi.listFilteredDimensionValues.mockResolvedValue({
            dimension: 'industry',
            values: [{ id: '1', slug: 'sw', label: 'Software', parentId: null, metadata: {} }],
            filtered: false,
            filterApplied: {},
        });

        const { rerender } = render(
            <DimensionSelect
                dimension="industry"
                value={null}
                onChange={() => {}}
                dependsOn={['Sector']}
                siblingValues={{ Sector: '' }}
            />
        );

        await waitFor(() => screen.getByText('Software'));

        rerender(
            <DimensionSelect
                dimension="industry"
                value={null}
                onChange={() => {}}
                dependsOn={['Sector']}
                siblingValues={{ Sector: 'tech' }}
            />
        );

        // Should have called the API twice - once for initial load, once for filter change
        await waitFor(() => {
            expect(mockApi.listFilteredDimensionValues).toHaveBeenCalledTimes(2);
        });
    });

    it('renders with custom placeholder', async () => {
        mockApi.listFilteredDimensionValues.mockResolvedValue({
            dimension: 'sector',
            values: [],
            filtered: false,
            filterApplied: {},
        });

        render(
            <DimensionSelect
                dimension="sector"
                value={null}
                onChange={() => {}}
                placeholder="Choose a sector..."
            />
        );

        await waitFor(() => {
            expect(screen.getByText('Choose a sector...')).toBeInTheDocument();
        });
    });

    it('disables select when disabled prop is true', async () => {
        mockApi.listFilteredDimensionValues.mockResolvedValue({
            dimension: 'sector',
            values: [{ id: '1', slug: 'tech', label: 'Technology', parentId: null, metadata: {} }],
            filtered: false,
            filterApplied: {},
        });

        render(<DimensionSelect dimension="sector" value={null} onChange={() => {}} disabled={true} />);

        await waitFor(() => {
            expect(screen.getByRole('combobox')).toBeDisabled();
        });
    });

    it('selects correct value when value prop is provided', async () => {
        mockApi.listFilteredDimensionValues.mockResolvedValue({
            dimension: 'sector',
            values: [
                { id: '1', slug: 'tech', label: 'Technology', parentId: null, metadata: {} },
                { id: '2', slug: 'finance', label: 'Finance', parentId: null, metadata: {} },
            ],
            filtered: false,
            filterApplied: {},
        });

        render(<DimensionSelect dimension="sector" value="finance" onChange={() => {}} />);

        await waitFor(() => {
            const select = screen.getByRole('combobox') as HTMLSelectElement;
            expect(select.value).toBe('finance');
        });
    });
});
