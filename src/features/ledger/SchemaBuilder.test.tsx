import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SchemaBuilder } from './SchemaBuilder';
import { useLedgerStore } from '../../stores/useLedgerStore';
import { useProfileStore } from '../../stores/useProfileStore';

// Mock the stores
vi.mock('../../stores/useLedgerStore');
vi.mock('../../stores/useProfileStore');

describe('SchemaBuilder Component', () => {
    const mockOnClose = vi.fn();
    const mockCreateSchema = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useProfileStore as any).mockReturnValue({
            activeProfileId: 'profile-1',
        });

        (useLedgerStore as any).mockReturnValue({
            createSchema: mockCreateSchema,
            isLoading: false,
        });
    });

    it('renders the schema builder form', () => {
        render(<SchemaBuilder projectId="project-1" onClose={mockOnClose} />);

        expect(screen.getByText('Create Ledger Schema')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/e.g. Coffee Tracker/i)).toBeInTheDocument();
        expect(screen.getByText('Add Field')).toBeInTheDocument();
    });

    it('validates required fields on submit', async () => {
        render(<SchemaBuilder projectId="project-1" onClose={mockOnClose} />);

        // Set name but no fields
        fireEvent.change(screen.getByPlaceholderText(/e.g. Coffee Tracker/i), {
            target: { value: 'My Ledger' }
        });
        
        const saveButton = screen.getByRole('button', { name: /Create Schema/i });
        fireEvent.click(saveButton);
        expect(screen.getByText('At least one field is required')).toBeInTheDocument();
    });

    it('can add and remove fields', () => {
        render(<SchemaBuilder projectId="project-1" onClose={mockOnClose} />);

        const addFieldBtn = screen.getByText('Add Field');
        fireEvent.click(addFieldBtn);

        expect(screen.getByPlaceholderText('Field name')).toBeInTheDocument();
        
        // Find the trash button (it has no text, but we can find it by its SVG class or using getAllByRole)
        const buttons = screen.getAllByRole('button');
        const removeBtn = buttons.find(b => b.querySelector('.lucide-trash2'));
        
        if (removeBtn) {
            fireEvent.click(removeBtn);
        }
        
        expect(screen.queryByPlaceholderText('Field name')).not.toBeInTheDocument();
    });

    it('successfully creates a schema', async () => {
        mockCreateSchema.mockResolvedValue('new-schema-id');

        render(<SchemaBuilder projectId="project-1" onClose={mockOnClose} />);

        // Set name
        fireEvent.change(screen.getByPlaceholderText(/e.g. Coffee Tracker/i), {
            target: { value: 'Test Ledger' }
        });

        // Add field
        fireEvent.click(screen.getByText('Add Field'));
        fireEvent.change(screen.getByPlaceholderText('Field name'), {
            target: { value: 'Price' }
        });

        const saveButton = screen.getByRole('button', { name: /Create Schema/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(mockCreateSchema).toHaveBeenCalledWith(
                'profile-1',
                'project-1',
                'Test Ledger',
                [{ name: 'Price', type: 'text', required: false }]
            );
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('handles API errors gracefully', async () => {
        mockCreateSchema.mockRejectedValue(new Error('PouchDB Error'));

        render(<SchemaBuilder projectId="project-1" onClose={mockOnClose} />);

        fireEvent.change(screen.getByPlaceholderText(/e.g. Coffee Tracker/i), {
            target: { value: 'Error Ledger' }
        });
        fireEvent.click(screen.getByText('Add Field'));
        fireEvent.change(screen.getByPlaceholderText('Field name'), {
            target: { value: 'Field1' }
        });

        fireEvent.click(screen.getByRole('button', { name: /Create Schema/i }));

        await waitFor(() => {
            expect(screen.getByText('PouchDB Error')).toBeInTheDocument();
        });
    });
});
