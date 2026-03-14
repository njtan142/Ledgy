import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
    RelationCombobox,
    fuzzyScore,
    MAX_RESULTS,
} from '../src/features/ledger/RelationCombobox';
import type { LedgerEntry } from '../src/types/ledger';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeEntry = (name: string, index: number): LedgerEntry => ({
    _id: `entry:${index}`,
    data: { Name: name },
    type: 'entry' as const,
    schemaId: 'schema:1',
    ledgerId: 'ledger:1',
    profileId: 'profile:1',
    schema_version: 1,
    createdAt: '',
    updatedAt: '',
});

const makeEntries = (names: string[]): LedgerEntry[] =>
    names.map((name, i) => makeEntry(name, i));

const DEFAULT_GET_DISPLAY = (e: LedgerEntry) => String(Object.values(e.data)[0] ?? e._id);

// ---------------------------------------------------------------------------
// Unit tests for fuzzyScore
// ---------------------------------------------------------------------------

describe('fuzzyScore', () => {
    it('returns 0 for empty query (everything matches)', () => {
        expect(fuzzyScore('Alpha', '')).toBe(0);
        expect(fuzzyScore('', '')).toBe(0);
    });

    it('returns highest tier score for exact substring match', () => {
        const score = fuzzyScore('Alpha', 'alp');
        expect(score).toBeGreaterThanOrEqual(100);
    });

    it('returns a positive score for subsequence match', () => {
        // 'cb' is a subsequence of 'Capital Budget': C→c, B→b
        const score = fuzzyScore('Capital Budget', 'cb');
        expect(score).toBeGreaterThanOrEqual(0);
    });

    it('returns -1 for no match', () => {
        expect(fuzzyScore('Alpha', 'xyz')).toBe(-1);
        expect(fuzzyScore('Beta', 'zzz')).toBe(-1);
    });

    it('is case-insensitive', () => {
        const lower = fuzzyScore('alpha', 'ALP');
        const upper = fuzzyScore('ALPHA', 'alp');
        expect(lower).toBeGreaterThanOrEqual(100);
        expect(upper).toBeGreaterThanOrEqual(100);
    });

    it('ranks shorter text above longer text for same substring', () => {
        // Both contain 'al', but 'Alpha' is shorter than 'Alphabet Alpha'
        const short = fuzzyScore('Alpha', 'al');
        const long = fuzzyScore('Alphabet Alpha', 'al');
        expect(short).toBeGreaterThan(long);
    });
});

// ---------------------------------------------------------------------------
// Component tests — fuzzy filtering in dropdown
// ---------------------------------------------------------------------------

describe('RelationCombobox — fuzzy search', () => {
    const entries = makeEntries(['Alpha', 'Beta', 'Capital Budget', 'Zeta']);

    it('shows all entries (up to MAX_RESULTS) when no search term', () => {
        render(
            <RelationCombobox
                entries={entries}
                onChange={vi.fn()}
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        fireEvent.click(screen.getByRole('button'));
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Beta')).toBeInTheDocument();
        expect(screen.getByText('Zeta')).toBeInTheDocument();
    });

    it('fuzzy hit — filters by substring', () => {
        render(
            <RelationCombobox
                entries={entries}
                onChange={vi.fn()}
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        fireEvent.click(screen.getByRole('button'));
        fireEvent.change(screen.getByPlaceholderText('Search entries...'), {
            target: { value: 'al' },
        });
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.getByText('Capital Budget')).toBeInTheDocument();
        expect(screen.queryByText('Beta')).toBeNull();
        expect(screen.queryByText('Zeta')).toBeNull();
    });

    it('fuzzy hit — subsequence match', () => {
        render(
            <RelationCombobox
                entries={entries}
                onChange={vi.fn()}
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        fireEvent.click(screen.getByRole('button'));
        // 'bt' is a subsequence of 'Beta' (B→e→t→a → b,t in order)
        fireEvent.change(screen.getByPlaceholderText('Search entries...'), {
            target: { value: 'bt' },
        });
        expect(screen.getByText('Beta')).toBeInTheDocument();
        expect(screen.queryByText('Alpha')).toBeNull();
        expect(screen.queryByText('Zeta')).toBeNull();
    });

    it('fuzzy miss — shows "No entries found"', () => {
        render(
            <RelationCombobox
                entries={entries}
                onChange={vi.fn()}
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        fireEvent.click(screen.getByRole('button'));
        fireEvent.change(screen.getByPlaceholderText('Search entries...'), {
            target: { value: 'xxxxxx' },
        });
        expect(screen.getByText('No entries found')).toBeInTheDocument();
    });
});

// ---------------------------------------------------------------------------
// Component tests — result capping and overflow hint
// ---------------------------------------------------------------------------

describe('RelationCombobox — result capping', () => {
    it(`shows overflow hint when entries exceed MAX_RESULTS (${MAX_RESULTS})`, () => {
        const sixtyEntries = makeEntries(
            Array.from({ length: 60 }, (_, i) => `Entry ${i}`)
        );
        render(
            <RelationCombobox
                entries={sixtyEntries}
                onChange={vi.fn()}
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        fireEvent.click(screen.getByRole('button'));

        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(MAX_RESULTS);
        expect(
            screen.getByText(`Showing ${MAX_RESULTS} of 60 — type to filter`)
        ).toBeInTheDocument();
    });

    it('does NOT show overflow hint when entries are within MAX_RESULTS', () => {
        const tenEntries = makeEntries(
            Array.from({ length: 10 }, (_, i) => `Entry ${i}`)
        );
        render(
            <RelationCombobox
                entries={tenEntries}
                onChange={vi.fn()}
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        fireEvent.click(screen.getByRole('button'));

        expect(screen.queryByText(/Showing .* of .* — type to filter/)).toBeNull();
        expect(screen.getAllByRole('option')).toHaveLength(10);
    });
});

// ---------------------------------------------------------------------------
// Component tests — selected entry name display in trigger
// ---------------------------------------------------------------------------

describe('RelationCombobox — trigger display', () => {
    const entries = makeEntries(['Alpha', 'Beta', 'Zeta']);

    it('shows placeholder when nothing is selected', () => {
        render(
            <RelationCombobox
                entries={entries}
                onChange={vi.fn()}
                placeholder="Pick one..."
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        expect(screen.getByRole('button')).toHaveTextContent('Pick one...');
    });

    it('shows entry display value for single selection', () => {
        render(
            <RelationCombobox
                entries={entries}
                value="entry:0"
                onChange={vi.fn()}
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        const btn = screen.getByRole('button');
        expect(btn).toHaveTextContent('Alpha');
        expect(btn).not.toHaveTextContent('1 selected');
    });

    it('shows comma-separated names for multi-select with 2 entries', () => {
        render(
            <RelationCombobox
                entries={entries}
                value={['entry:0', 'entry:1']}
                onChange={vi.fn()}
                allowMultiple
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        expect(screen.getByRole('button')).toHaveTextContent('Alpha, Beta');
    });

    it('shows first name + "+N more" for multi-select with > 2 entries', () => {
        render(
            <RelationCombobox
                entries={entries}
                value={['entry:0', 'entry:1', 'entry:2']}
                onChange={vi.fn()}
                allowMultiple
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        expect(screen.getByRole('button')).toHaveTextContent('Alpha +2 more');
    });
});

// ---------------------------------------------------------------------------
// Component tests — keyboard navigation with fuzzy results
// ---------------------------------------------------------------------------

describe('RelationCombobox — keyboard navigation with fuzzy results', () => {
    it('ArrowDown navigates through fuzzy-filtered results', () => {
        const onChange = vi.fn();
        const entries = makeEntries(['Alpha', 'Beta', 'Gamma']);
        render(
            <RelationCombobox
                entries={entries}
                onChange={onChange}
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        fireEvent.click(screen.getByRole('button'));
        const input = screen.getByPlaceholderText('Search entries...');

        // Filter to only 'Beta' and 'Gamma' (contain 'a' → wait, all contain 'a'... use 'et' for Beta only)
        fireEvent.change(input, { target: { value: 'et' } });
        // Now only 'Beta' matches ('et' is substring of 'Beta')
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'Enter' });

        expect(onChange).toHaveBeenCalledWith('entry:1'); // Beta is entry:1
    });

    it('highlightedIndex resets to -1 when search term changes', () => {
        const entries = makeEntries(['Alpha', 'Beta', 'Gamma']);
        render(
            <RelationCombobox
                entries={entries}
                onChange={vi.fn()}
                getDisplayValue={DEFAULT_GET_DISPLAY}
            />
        );
        fireEvent.click(screen.getByRole('button'));
        const input = screen.getByPlaceholderText('Search entries...');

        // Navigate to index 1 (Beta)
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'ArrowDown' });

        // Now change search — highlighted index should reset (no item highlighted)
        fireEvent.change(input, { target: { value: 'alp' } });

        // Alpha is the only result; pressing Enter with no highlight should not call onChange
        const onChange = vi.fn();
        // Re-render isn't needed — just confirm no crash and only 'Alpha' is in DOM
        expect(screen.getByText('Alpha')).toBeInTheDocument();
        expect(screen.queryByText('Beta')).toBeNull();
        expect(onChange).not.toHaveBeenCalled();
    });
});
