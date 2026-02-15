import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RelationshipManager } from './RelationshipManager';
import { api } from '../lib/api';

// Type the mocked api
const mockApi = vi.mocked(api);

describe('RelationshipManager', () => {
    const mockOnUpdate = vi.fn();
    const defaultProps = {
        entityId: 'entity-123',
        entityType: 'product',
        relationships: [],
        onUpdate: mockOnUpdate,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockApi.listEntities.mockResolvedValue([]);
    });

    describe('rendering', () => {
        it('renders with correct title based on entity type rules', async () => {
            render(<RelationshipManager {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/Related features/i)).toBeInTheDocument();
            });
        });

        it('shows empty state when no relationships exist', async () => {
            render(<RelationshipManager {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/No linked features yet/i)).toBeInTheDocument();
            });
        });

        it('returns null when entity type has no relationship rules', () => {
            const { container } = render(
                <RelationshipManager {...defaultProps} entityType="unknown_type" />
            );
            expect(container.firstChild).toBeNull();
        });
    });

    describe('listing existing relationships', () => {
        it('displays linked entities with their names', async () => {
            mockApi.listEntities.mockResolvedValue([
                { id: 'feature-1', name: 'Feature One', type: 'feature', slug: 'feature-one', data: {} },
                { id: 'feature-2', name: 'Feature Two', type: 'feature', slug: 'feature-two', data: {} },
            ]);

            const relationships = [
                { id: 'rel-1', from_id: 'entity-123', to_id: 'feature-1', type: 'has_feature' },
            ];

            render(
                <RelationshipManager {...defaultProps} relationships={relationships} />
            );

            await waitFor(() => {
                expect(screen.getByText('Feature One')).toBeInTheDocument();
            });
        });

        it('shows relationship type badge', async () => {
            mockApi.listEntities.mockResolvedValue([
                { id: 'feature-1', name: 'Feature One', type: 'feature', slug: 'feature-one', data: {} },
            ]);

            const relationships = [
                { id: 'rel-1', from_id: 'entity-123', to_id: 'feature-1', type: 'has_feature' },
            ];

            render(
                <RelationshipManager {...defaultProps} relationships={relationships} />
            );

            await waitFor(() => {
                expect(screen.getByText('has_feature')).toBeInTheDocument();
            });
        });
    });

    describe('adding relationships', () => {
        it('shows dropdown with available entities', async () => {
            mockApi.listEntities.mockResolvedValue([
                { id: 'feature-1', name: 'Feature One', type: 'feature', slug: 'feature-one', data: {} },
                { id: 'feature-2', name: 'Feature Two', type: 'feature', slug: 'feature-two', data: {} },
            ]);

            render(<RelationshipManager {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('combobox')).toBeInTheDocument();
            });
        });

        it('filters out already linked entities from dropdown', async () => {
            mockApi.listEntities.mockResolvedValue([
                { id: 'feature-1', name: 'Feature One', type: 'feature', slug: 'feature-one', data: {} },
                { id: 'feature-2', name: 'Feature Two', type: 'feature', slug: 'feature-two', data: {} },
            ]);

            const relationships = [
                { id: 'rel-1', from_id: 'entity-123', to_id: 'feature-1', type: 'has_feature' },
            ];

            render(
                <RelationshipManager {...defaultProps} relationships={relationships} />
            );

            await waitFor(() => {
                const options = screen.getAllByRole('option');
                const optionTexts = options.map(opt => opt.textContent);
                expect(optionTexts).toContain('Feature Two');
                expect(optionTexts).not.toContain('Feature One');
            });
        });

        it('calls createRelationship when Link button is clicked', async () => {
            mockApi.listEntities.mockResolvedValue([
                { id: 'feature-1', name: 'Feature One', type: 'feature', slug: 'feature-one', data: {} },
            ]);
            mockApi.createRelationship.mockResolvedValue({ id: 'new-rel', from_id: 'entity-123', to_id: 'feature-1', type: 'has_feature' });

            render(<RelationshipManager {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('combobox')).toBeInTheDocument();
            });

            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'feature-1' } });
            fireEvent.click(screen.getByText('Link'));

            await waitFor(() => {
                expect(mockApi.createRelationship).toHaveBeenCalledWith({
                    from_id: 'entity-123',
                    to_id: 'feature-1',
                    type: 'has_feature',
                });
            });
        });

        it('calls onUpdate after successful relationship creation', async () => {
            mockApi.listEntities.mockResolvedValue([
                { id: 'feature-1', name: 'Feature One', type: 'feature', slug: 'feature-one', data: {} },
            ]);
            mockApi.createRelationship.mockResolvedValue({ id: 'new-rel', from_id: 'entity-123', to_id: 'feature-1', type: 'has_feature' });

            render(<RelationshipManager {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByRole('combobox')).toBeInTheDocument();
            });

            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'feature-1' } });
            fireEvent.click(screen.getByText('Link'));

            await waitFor(() => {
                expect(mockOnUpdate).toHaveBeenCalled();
            });
        });

        it('disables Link button when no entity is selected', async () => {
            mockApi.listEntities.mockResolvedValue([
                { id: 'feature-1', name: 'Feature One', type: 'feature', slug: 'feature-one', data: {} },
            ]);

            render(<RelationshipManager {...defaultProps} />);

            await waitFor(() => {
                const linkButton = screen.getByText('Link');
                expect(linkButton).toBeDisabled();
            });
        });
    });

    describe('quick create', () => {
        it('shows quick create form when New button is clicked', async () => {
            mockApi.listEntities.mockResolvedValue([]);

            render(<RelationshipManager {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/New feature/i)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText(/New feature/i));

            await waitFor(() => {
                expect(screen.getByText('Quick Create feature')).toBeInTheDocument();
                expect(screen.getByPlaceholderText(/New feature Name/i)).toBeInTheDocument();
            });
        });

        it('creates entity and relationship when Create & Link is clicked', async () => {
            mockApi.listEntities.mockResolvedValue([]);
            mockApi.createEntity.mockResolvedValue({
                id: 'new-feature-id',
                name: 'New Feature',
                type: 'feature',
                slug: 'new-feature',
                data: {},
            });
            mockApi.createRelationship.mockResolvedValue({
                id: 'new-rel',
                from_id: 'entity-123',
                to_id: 'new-feature-id',
                type: 'has_feature',
            });

            render(<RelationshipManager {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/New feature/i)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText(/New feature/i));

            await waitFor(() => {
                expect(screen.getByPlaceholderText(/New feature Name/i)).toBeInTheDocument();
            });

            fireEvent.change(screen.getByPlaceholderText(/New feature Name/i), {
                target: { value: 'Amazing Feature' },
            });
            fireEvent.click(screen.getByText('Create & Link'));

            await waitFor(() => {
                expect(mockApi.createEntity).toHaveBeenCalledWith(
                    expect.objectContaining({
                        type: 'feature',
                        name: 'Amazing Feature',
                        slug: 'amazing-feature',
                    })
                );
                expect(mockApi.createRelationship).toHaveBeenCalledWith({
                    from_id: 'entity-123',
                    to_id: 'new-feature-id',
                    type: 'has_feature',
                });
                expect(mockOnUpdate).toHaveBeenCalled();
            });
        });

        it('hides quick create form when Cancel is clicked', async () => {
            mockApi.listEntities.mockResolvedValue([]);

            render(<RelationshipManager {...defaultProps} />);

            await waitFor(() => {
                expect(screen.getByText(/New feature/i)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText(/New feature/i));

            await waitFor(() => {
                expect(screen.getByText('Quick Create feature')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('Cancel'));

            await waitFor(() => {
                expect(screen.queryByText('Quick Create feature')).not.toBeInTheDocument();
            });
        });

        it('disables Create & Link button when name is empty', async () => {
            mockApi.listEntities.mockResolvedValue([]);

            render(<RelationshipManager {...defaultProps} />);

            fireEvent.click(screen.getByText(/New feature/i));

            await waitFor(() => {
                const createButton = screen.getByText('Create & Link');
                expect(createButton).toBeDisabled();
            });
        });
    });

    describe('removing relationships', () => {
        it('calls deleteRelationship when remove button is clicked', async () => {
            // Mock window.confirm
            vi.spyOn(window, 'confirm').mockReturnValue(true);

            mockApi.listEntities.mockResolvedValue([
                { id: 'feature-1', name: 'Feature One', type: 'feature', slug: 'feature-one', data: {} },
            ]);
            mockApi.deleteRelationship.mockResolvedValue(undefined);

            const relationships = [
                { id: 'rel-1', from_id: 'entity-123', to_id: 'feature-1', type: 'has_feature' },
            ];

            render(
                <RelationshipManager {...defaultProps} relationships={relationships} />
            );

            await waitFor(() => {
                expect(screen.getByText('Feature One')).toBeInTheDocument();
            });

            // Click the remove button (X icon)
            const removeButton = screen.getByRole('button', { name: '' });
            fireEvent.click(removeButton);

            await waitFor(() => {
                expect(mockApi.deleteRelationship).toHaveBeenCalledWith('rel-1');
                expect(mockOnUpdate).toHaveBeenCalled();
            });
        });

        it('does not delete when confirm is cancelled', async () => {
            vi.spyOn(window, 'confirm').mockReturnValue(false);

            mockApi.listEntities.mockResolvedValue([
                { id: 'feature-1', name: 'Feature One', type: 'feature', slug: 'feature-one', data: {} },
            ]);

            const relationships = [
                { id: 'rel-1', from_id: 'entity-123', to_id: 'feature-1', type: 'has_feature' },
            ];

            render(
                <RelationshipManager {...defaultProps} relationships={relationships} />
            );

            await waitFor(() => {
                expect(screen.getByText('Feature One')).toBeInTheDocument();
            });

            const removeButton = screen.getByRole('button', { name: '' });
            fireEvent.click(removeButton);

            expect(mockApi.deleteRelationship).not.toHaveBeenCalled();
        });
    });

    describe('different entity types', () => {
        it('shows correct target type for brand entities', async () => {
            mockApi.listEntities.mockResolvedValue([]);

            render(
                <RelationshipManager {...defaultProps} entityType="brand" />
            );

            await waitFor(() => {
                expect(screen.getByText(/Related products/i)).toBeInTheDocument();
            });
        });

        it('shows correct target type for solution entities', async () => {
            mockApi.listEntities.mockResolvedValue([]);

            render(
                <RelationshipManager {...defaultProps} entityType="solution" />
            );

            await waitFor(() => {
                expect(screen.getByText(/Related useCases/i)).toBeInTheDocument();
            });
        });
    });
});
