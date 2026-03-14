import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { LedgerTable } from '../src/features/ledger/LedgerTable';
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

const mockSchemaWithRelation = {
    _id: 'schema:rel',
    type: 'schema' as const,
    name: 'Rel Ledger',
    fields: [
        { name: 'Name', type: 'text' as const, required: true },
        { name: 'Target', type: 'relation' as const, relationTarget: 'schema:other' },
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

const mockRelationEntry = {
    _id: 'entry:target-1',
    type: 'entry' as const,
    schemaId: 'schema:other',
    ledgerId: 'schema:other',
    data: { Name: 'Target Entry' },
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

function setupLedgerTableWithRelationMocks() {
    const mockCreateEntry = vi.fn().mockResolvedValue('entry:new');
    const mockFetchEntries = vi.fn().mockResolvedValue(undefined);
    
    (useLedgerStore as any).mockReturnValue({
        schemas: [mockSchemaWithRelation],
        entries: {
            'schema:rel': [],
            'schema:other': [mockRelationEntry],
        },
        allEntries: {
            'schema:rel': [],
            'schema:other': [mockRelationEntry],
        },
        fetchEntries: mockFetchEntries,
        deleteEntry: vi.fn(),
        createEntry: mockCreateEntry,
        updateEntry: vi.fn(),
    });

    (useLedgerStore as any).getState = vi.fn(() => ({
        entries: {
            'schema:other': [mockRelationEntry],
        },
        fetchEntries: mockFetchEntries,
    }));

    (useProfileStore as any).mockReturnValue({ activeProfileId: 'profile-1' });
    return { mockCreateEntry };
}

describe('Data Lab Focus Management', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    // Test 1: Tab on first field advances to second field
    it('Test 1 — Tab on first field advances to second field', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        const amountInput = screen.getByPlaceholderText(/enter amount/i);

        nameInput.focus();
        expect(document.activeElement).toBe(nameInput);

        fireEvent.keyDown(nameInput, { key: 'Tab', shiftKey: false });

        expect(document.activeElement).toBe(amountInput);
    });

    // Test 2: Tab on last field wraps to first field
    it('Test 2 — Tab on last field wraps to first field', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        const amountInput = screen.getByPlaceholderText(/enter amount/i);

        amountInput.focus();
        expect(document.activeElement).toBe(amountInput);

        fireEvent.keyDown(amountInput, { key: 'Tab', shiftKey: false });

        expect(document.activeElement).toBe(nameInput);
    });

    // Test 3: Shift+Tab on last field moves to first
    it('Test 3 — Shift+Tab on last field moves to first', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        const amountInput = screen.getByPlaceholderText(/enter amount/i);

        amountInput.focus();
        expect(document.activeElement).toBe(amountInput);

        fireEvent.keyDown(amountInput, { key: 'Tab', shiftKey: true });

        expect(document.activeElement).toBe(nameInput);
    });

    // Test 4: Shift+Tab on first field wraps to last
    it('Test 4 — Shift+Tab on first field wraps to last', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        const amountInput = screen.getByPlaceholderText(/enter amount/i);

        nameInput.focus();
        expect(document.activeElement).toBe(nameInput);

        fireEvent.keyDown(nameInput, { key: 'Tab', shiftKey: true });

        expect(document.activeElement).toBe(amountInput);
    });

    // Test 5: Tab does NOT reach Save button
    it('Test 5 — Tab does NOT reach Save button', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        const saveButton = screen.getByRole('button', { name: /save/i });

        nameInput.focus();
        expect(document.activeElement).toBe(nameInput);

        // Tab twice from first field (wraps back to first after second field)
        fireEvent.keyDown(nameInput, { key: 'Tab', shiftKey: false });
        fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Tab', shiftKey: false });

        // Should be back on name input, not on Save button
        expect(document.activeElement).toBe(nameInput);
        expect(document.activeElement).not.toBe(saveButton);
    });

    // Test 6: Escape closes inline row (regression)
    it('Test 6 — Escape closes inline row (regression)', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });
        expect(screen.getByText('Save')).toBeInTheDocument();

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        fireEvent.keyDown(nameInput, { key: 'Escape' });

        expect(screen.queryByText('Save')).not.toBeInTheDocument();
    });

    // Test 7: Enter on non-last field moves to next (regression)
    it('Test 7 — Enter on non-last field moves to next (regression)', () => {
        setupLedgerTableMocks();
        render(<LedgerTable schemaId="schema:test-kb" />);

        fireEvent.keyDown(window, { key: 'n' });

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        const amountInput = screen.getByPlaceholderText(/enter amount/i);

        nameInput.focus();
        expect(document.activeElement).toBe(nameInput);

        fireEvent.keyDown(nameInput, { key: 'Enter' });

        expect(document.activeElement).toBe(amountInput);
    });

    // Test 8: RelationCombobox trigger Tab closes dropdown and advances
    it('Test 8 — RelationCombobox trigger Tab closes dropdown and advances', async () => {
        setupLedgerTableWithRelationMocks();
        render(<LedgerTable schemaId="schema:rel" />);

        fireEvent.keyDown(window, { key: 'n' });

        const nameInput = screen.getByPlaceholderText(/enter name/i);
        expect(document.activeElement).toBe(nameInput);

        // Tab from Name to Target (combobox)
        fireEvent.keyDown(nameInput, { key: 'Tab', shiftKey: false });

        // Find the combobox trigger button for Target
        const comboboxBtn = screen.getByRole('button', { name: /select target/i });
        expect(document.activeElement).toBe(comboboxBtn);

        // Open the dropdown
        await act(async () => {
            fireEvent.click(comboboxBtn);
        });

        // Dropdown should be open, search input should be focused
        const searchInput = screen.getByPlaceholderText('Search entries...');
        expect(searchInput).toBeInTheDocument();
        expect(document.activeElement).toBe(searchInput);

        // Press Tab on search input
        fireEvent.keyDown(searchInput, { key: 'Tab', shiftKey: false });

        // Dropdown should close (verify aria-expanded is false or search input is not in DOM)
        expect(comboboxBtn).toHaveAttribute('aria-expanded', 'false');

        // Focus should wrap back to Name field (Target is last, Tab wraps to Name)
        const nameInputAfterTab = screen.getByPlaceholderText(/enter name/i);
        expect(document.activeElement).toBe(nameInputAfterTab);
    });
});
