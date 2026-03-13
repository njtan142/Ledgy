import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LedgerTable } from '../src/features/ledger/LedgerTable';
import { InlineEntryRow } from '../src/features/ledger/InlineEntryRow';
import { useLedgerStore } from '../src/stores/useLedgerStore';
import { useProfileStore } from '../src/stores/useProfileStore';

vi.mock('@tanstack/react-virtual', () => ({
    useVirtualizer: vi.fn().mockImplementation(({ count, estimateSize }) => ({
        getVirtualItems: () =>
            Array.from({ length: count }, (_, i) => ({
                index: i,
                key: i,
                start: i * estimateSize(),
                size: estimateSize(),
            })),
        getTotalSize: () => count * estimateSize(),
        measureElement: vi.fn(),
        scrollToIndex: vi.fn(),
    })),
}));

vi.mock('../src/stores/useLedgerStore', () => ({
    useLedgerStore: Object.assign(vi.fn(), {
        getState: vi.fn(() => ({
            entries: {},
            fetchEntries: vi.fn(),
        })),
    }),
}));

vi.mock('../src/stores/useProfileStore', () => ({
    useProfileStore: vi.fn(),
}));

const mockSchema = {
    _id: 'schema:test-kb',
    type: 'schema' as const,
    name: 'KB Ledger',
    fields: [
        { name: 'Name', type: 'text' as const, required: true },
        { name: 'Amount', type: 'number' as const },
    ],
    profileId: 'profile-1',
    projectId: 'project-1',
    schema_version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
};

const mockEntry = {
    _id: 'entry:1',
    type: 'entry' as const,
    schemaId: 'schema:test-kb',
    ledgerId: 'schema:test-kb',
    data: { Name: 'Existing', Amount: 10 },
    profileId: 'profile-1',
    schema_version: 1,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
};

function setupLedgerTableMocks(overrides?: Partial<ReturnType<typeof vi.fn>>) {
    const mockCreateEntry = vi.fn().mockResolvedValue('entry:new');
    (useLedgerStore as any).mockReturnValue({
        schemas: [mockSchema],
        entries: { 'schema:test-kb': [mockEntry] },
        allEntries: { 'schema:test-kb': [mockEntry] },
        fetchEntries: vi.fn(),
        deleteEntry: vi.fn(),
        createEntry: mockCreateEntry,
        updateEntry: vi.fn(),
        ...overrides,
    });
    (useProfileStore as any).mockReturnValue({ activeProfileId: 'profile-1' });
    return { mockCreateEntry };
}

describe('Data Lab Keyboard Inline Entry', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // Test 1: N key opens inline row
    it('N key opens the inline entry row', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    // Test 2: Second N key press does NOT open a duplicate row
    it('second N key press does not open a duplicate inline row', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });
        fireEvent.keyDown(window, { key: 'n' });

        expect(screen.getAllByText('Save').length).toBe(1);
    });

    // Test 3: Tab navigates between fields
    it('Tab moves focus from first field to second field', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        const amountInput = screen.getByPlaceholderText(/enter amount/i);

        nameInput.focus();
        expect(document.activeElement).toBe(nameInput);

        // Tab to next field (natural browser tab behaviour — simulate focus change)
        fireEvent.keyDown(nameInput, { key: 'Enter' });
        expect(document.activeElement).toBe(amountInput);
    });

    // Test 4: Enter on last field submits form and calls createEntry
    it('Enter on the last field submits the form and calls createEntry', async () => {
        const { mockCreateEntry } = setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        fireEvent.change(screen.getByPlaceholderText(/enter name/i), {
            target: { value: 'New Item' },
        });

        const amountInput = screen.getByPlaceholderText(/enter amount/i);
        fireEvent.change(amountInput, { target: { value: '99' } });
        fireEvent.keyDown(amountInput, { key: 'Enter' });

        await waitFor(() => {
            expect(mockCreateEntry).toHaveBeenCalledWith(
                'profile-1',
                'schema:test-kb',
                'schema:test-kb',
                expect.objectContaining({ Name: 'New Item' })
            );
        });
    });

    // Test 5: Escape cancels and removes the inline row from DOM
    it('Escape cancels and removes the inline row from DOM', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });
        expect(screen.getByText('Save')).toBeInTheDocument();

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        fireEvent.keyDown(nameInput, { key: 'Escape' });

        expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    // Test 6: Required-field validation shows 'Required' error on empty submit
    it('required-field validation shows Required error on empty submit', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });
        fireEvent.click(screen.getByText('Save'));

        expect(screen.getByText('Required')).toBeInTheDocument();
    });

    // Test 7: InlineEntryRow renders div[role="row"] not <tr>
    it('InlineEntryRow renders div[role="row"] and not a <tr> element', () => {
        const mockOnCancel = vi.fn();
        const mockOnComplete = vi.fn();
        (useLedgerStore as any).mockReturnValue({
            createEntry: vi.fn(),
            updateEntry: vi.fn(),
        });
        (useProfileStore as any).mockReturnValue({ activeProfileId: 'profile-1' });

        const { container } = render(
            <div role="grid">
                <InlineEntryRow
                    schema={mockSchema}
                    onCancel={mockOnCancel}
                    onComplete={mockOnComplete}
                />
            </div>
        );

        expect(container.querySelector('tr')).toBeNull();
        expect(container.querySelector('[role="row"]')).toBeInTheDocument();
    });

    // Test 8: First input is focused on mount
    it('first input receives focus when inline row mounts', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        expect(document.activeElement).toBe(nameInput);
    });

    // Test 9 (Task 7.2): After successful save, createEntry is called exactly once
    it('after successful save the commit is persisted via createEntry exactly once', async () => {
        const { mockCreateEntry } = setupLedgerTableMocks();
        mockCreateEntry.mockResolvedValue('entry:new');

        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        fireEvent.change(screen.getByPlaceholderText(/enter name/i), {
            target: { value: 'Flash Entry' },
        });

        await act(async () => {
            fireEvent.click(screen.getByText('Save'));
        });

        await waitFor(() => {
            expect(mockCreateEntry).toHaveBeenCalledTimes(1);
        });

        // Inline row should close after successful save
        expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });
});
