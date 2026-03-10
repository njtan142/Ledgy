import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LedgerTable } from '../src/features/ledger/LedgerTable';
import { useLedgerStore } from '../src/stores/useLedgerStore';
import { useProfileStore } from '../src/stores/useProfileStore';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useUIStore } from '../src/stores/useUIStore';

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
    })),
}));

vi.mock('../src/stores/useLedgerStore', () => ({
    useLedgerStore: vi.fn(),
}));

vi.mock('../src/stores/useProfileStore', () => ({
    useProfileStore: vi.fn(),
}));

vi.mock('../src/stores/useUIStore', () => ({
    useUIStore: vi.fn().mockReturnValue({
        setSelectedEntryId: vi.fn(),
        setRightInspector: vi.fn(),
    }),
}));

const mockSchema = {
    _id: 'schema:virt-123',
    type: 'schema' as const,
    name: 'Virt Test Ledger',
    fields: [
        { name: 'Title', type: 'text' as const },
        { name: 'Value', type: 'number' as const },
    ],
    profileId: 'profile-1',
    projectId: 'project-1',
    schema_version: 1,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
};

const makeEntry = (n: number) => ({
    _id: `entry:virt-${n}`,
    type: 'entry' as const,
    schemaId: 'schema:virt-123',
    ledgerId: 'schema:virt-123',
    data: { Title: `Entry ${n}`, Value: n * 10 },
    profileId: 'profile-1',
    schema_version: 1,
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
});

const mockEntries3 = [makeEntry(1), makeEntry(2), makeEntry(3)];

function setupStore(entries = mockEntries3) {
    (useLedgerStore as any).mockReturnValue({
        schemas: [mockSchema],
        entries: { 'schema:virt-123': entries },
        allEntries: { 'schema:virt-123': entries },
        fetchEntries: vi.fn(),
        deleteEntry: vi.fn(),
        backLinks: {},
        fetchBackLinks: vi.fn(),
    });
    (useProfileStore as any).mockReturnValue({
        activeProfileId: 'profile-1',
    });
}

describe('dataLabVirtualizedCore', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupStore();
    });

    it('calls useVirtualizer with count equal to ledgerEntries.length', () => {
        render(<LedgerTable schemaId="schema:virt-123" />);

        expect(useVirtualizer).toHaveBeenCalledWith(
            expect.objectContaining({ count: mockEntries3.length })
        );
    });

    it('renders exactly the same number of row elements as entries (not 10,000)', () => {
        render(<LedgerTable schemaId="schema:virt-123" />);

        // Rows inside the role="grid" scroll container (excludes the sticky column header row)
        const grid = screen.getByRole('grid');
        const rows = grid.querySelectorAll('[role="row"]');
        expect(rows.length).toBe(3);
    });

    it('renders InlineEntryRow outside the virtualizer when Add Entry button is clicked', () => {
        render(<LedgerTable schemaId="schema:virt-123" />);

        const addButton = screen.getByText(/add entry/i);
        fireEvent.click(addButton);

        // Save and Cancel buttons appear — InlineEntryRow is rendered
        expect(screen.getByText('Save')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();

        // The inline row should appear BEFORE the virtualizer spacer (outside the virtualizer loop)
        const grid = screen.getByRole('grid');
        const gridChildren = Array.from(grid.children);
        // First child is the InlineEntryRow wrapper div, not the virtualizer spacer
        const virtualizerSpacer = gridChildren.find(
            (el) => (el as HTMLElement).style.position === 'relative'
        ) as HTMLElement | undefined;
        const inlineWrapper = gridChildren[0] as HTMLElement;
        // Inline wrapper should come before the virtualizer spacer in DOM order
        expect(gridChildren.indexOf(inlineWrapper)).toBeLessThan(
            gridChildren.indexOf(virtualizerSpacer as Element)
        );
    });

    it('clicking a rendered row calls setSelectedEntryId with that entry _id', () => {
        const mockSetSelectedEntryId = vi.fn();
        const mockSetRightInspector = vi.fn();
        (useUIStore as any).mockReturnValue({
            setSelectedEntryId: mockSetSelectedEntryId,
            setRightInspector: mockSetRightInspector,
        });

        render(<LedgerTable schemaId="schema:virt-123" />);

        const firstRowText = screen.getByText('Entry 1');
        fireEvent.click(firstRowText);

        expect(mockSetSelectedEntryId).toHaveBeenCalledWith('entry:virt-1');
    });

    it('pressing N key opens the inline entry row (Save button appears)', () => {
        render(<LedgerTable schemaId="schema:virt-123" />);

        fireEvent.keyDown(window, { key: 'N', code: 'KeyN' });

        expect(screen.getByText('Save')).toBeInTheDocument();
    });
});
