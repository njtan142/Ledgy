# Story 3.10: Data Lab - Relation Combobox Querying

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a power user linking entries across large ledgers,
I want to type partial text in the relation combobox and see fuzzy-matched results instantly,
so that I can find and connect distant entries without lag even in ledgers with thousands of rows.

## Acceptance Criteria

1. **Fuzzy Search** — Typing in the combobox search input uses fuzzy (subsequence) matching instead of the current naive `includes()`. For example, typing `"alp"` matches `"Alpha"` and `"Alphabet"`, and `"cb"` matches `"Capital Budget"`. Results are sorted by match quality (best score first). Non-matching entries are hidden.

2. **Deferred Computation** — The filter computation uses `React.useDeferredValue` on the search term so that rapid keystroke input (typing faster than a single frame) does not block the UI thread. The search `<input>` remains responsive at all times.

3. **Result Capping** — The dropdown list shows a maximum of **50 results** at a time. When there are more than 50 total matches (or when no search term is set and entries exceed 50), a footer hint is rendered inside the dropdown: `"Showing 50 of N — type to filter"`. When 50 or fewer results are available, no hint is shown.

4. **Selected Entry Name Display** — The trigger button shows entry display values instead of `"X selected"`:
   - **Single-select, 1 entry chosen**: show the entry's display value (e.g., `"Alpha"`)
   - **Multi-select, ≤ 2 entries chosen**: show comma-separated display values (e.g., `"Alpha, Beta"`)
   - **Multi-select, > 2 entries chosen**: show first entry name followed by overflow count (e.g., `"Alpha +2 more"`)
   - **Nothing selected**: continue showing the `placeholder` prop text

5. **No Regression — Existing Tests** — All 7 tests in `tests/RelationCombobox.test.tsx` continue to pass without modification.

6. **No Regression — Keyboard Navigation** — `ArrowUp` / `ArrowDown` / `Enter` / `Escape` keyboard handling (established in Story 3-9) continues to work correctly over the fuzzy-filtered, capped result set.

7. **Test Coverage** — A new test file `tests/dataLabRelationComboboxQuerying.test.tsx` must pass with ≥ 8 test cases covering: fuzzy hit, fuzzy miss, partial-word fuzzy (subsequence), result capping with overflow hint, no hint when ≤ 50 results, trigger display for single-select, trigger display for multi-select ≤ 2, trigger display for multi-select > 2.

8. **TypeScript** — `npx tsc --noEmit` must emit zero new errors after all changes.

## Tasks / Subtasks

- [ ] Task 1 — Implement fuzzy scoring and export it (AC: #1, #7)
  - [ ] 1.1 Add a `MAX_RESULTS = 50` constant near the top of `RelationCombobox.tsx`
  - [ ] 1.2 Add an **exported** `fuzzyScore(text: string, query: string): number` function in `RelationCombobox.tsx`:
    - Returns `0` when `query === ''` (everything matches with neutral score)
    - Checks for exact substring match first (returns `100 + (text.length - query.length)` — highest tier, shorter text ranks above longer for same substring)
    - Falls back to subsequence matching: iterate characters in `query` and advance a pointer through `text`; award consecutive-character bonuses; return cumulative score if all query chars matched, or `-1` if not all matched
    - All comparisons are case-insensitive
  - [ ] 1.3 Write a quick internal smoke-check mentally: `fuzzyScore('Alpha', 'alp')` → ≥ 100 (substring); `fuzzyScore('Capital Budget', 'cb')` → score ≥ 0 (subsequence); `fuzzyScore('Zeta', 'xyz')` → -1

- [ ] Task 2 — Replace `filteredEntries` with fuzzy + deferred + capped logic (AC: #1, #2, #3)
  - [ ] 2.1 Add `const deferredSearchTerm = React.useDeferredValue(searchTerm);` immediately after the `selectedValues` derivation
  - [ ] 2.2 Replace the existing `filteredEntries` array with an IIFE (or inline block) that:
    ```ts
    const { visibleEntries, totalCount } = (() => {
      if (!deferredSearchTerm) {
        return { visibleEntries: entries.slice(0, MAX_RESULTS), totalCount: entries.length };
      }
      const scored = entries
        .map(entry => ({ entry, score: fuzzyScore(getDisplayValue(entry), deferredSearchTerm) }))
        .filter(({ score }) => score >= 0)
        .sort((a, b) => b.score - a.score);
      return {
        visibleEntries: scored.slice(0, MAX_RESULTS).map(({ entry }) => entry),
        totalCount: scored.length,
      };
    })();
    const isOverflowing = totalCount > MAX_RESULTS;
    ```
  - [ ] 2.3 Update all references inside the JSX from `filteredEntries` to `visibleEntries` (ArrowUp/ArrowDown bounds, `filteredEntries.length`, `filteredEntries.map(...)`, empty-state check)
  - [ ] 2.4 The `handleKeyDown` bounds checks must use `visibleEntries.length` (not the old `filteredEntries.length`)

- [ ] Task 3 — Add overflow hint footer in dropdown (AC: #3)
  - [ ] 3.1 Inside the `<ul role="listbox">` block, after the mapped option `<li>` items, add a conditional overflow hint:
    ```tsx
    {isOverflowing && (
      <li className="px-3 py-1.5 text-xs text-zinc-500 border-t border-zinc-800 select-none">
        Showing {MAX_RESULTS} of {totalCount} — type to filter
      </li>
    )}
    ```
  - [ ] 3.2 The hint `<li>` must NOT be `role="option"` and must NOT be keyboard-navigable (it is purely informational)

- [ ] Task 4 — Update trigger button to show selected entry names (AC: #4)
  - [ ] 4.1 Add a `selectedDisplay` derived value above the `return` statement:
    ```ts
    const selectedDisplay = (() => {
      if (selectedValues.length === 0) return null;
      const names = selectedValues
        .map(id => entries.find(e => e._id === id))
        .filter((e): e is LedgerEntry => Boolean(e))
        .map(e => getDisplayValue(e));
      if (names.length === 0) return `${selectedValues.length} selected`; // fallback if entries not yet loaded
      if (names.length <= 2) return names.join(', ');
      return `${names[0]} +${names.length - 1} more`;
    })();
    ```
  - [ ] 4.2 In the trigger `<button>`, replace the existing display span:
    ```tsx
    // BEFORE:
    {selectedValues.length > 0 ? `${selectedValues.length} selected` : placeholder}
    // AFTER:
    {selectedDisplay ?? placeholder}
    ```

- [ ] Task 5 — Write new test file (AC: #7)
  - [ ] 5.1 Create `tests/dataLabRelationComboboxQuerying.test.tsx`
  - [ ] 5.2 Write test: **fuzzy hit - substring** — render component with `["Alpha", "Beta", "Zeta"]`, open dropdown, type `"al"` → only `"Alpha"` visible in list (via `getByText` / `queryByText`)
  - [ ] 5.3 Write test: **fuzzy hit - subsequence** — type `"bta"` → `"Beta"` visible (subsequence `b-t-a` matches `Beta` as `B-e-t-a` with chars in order)... actually `"bta"` — `b` at 0, `t` at 2, `a` at 3 — yes matches `Beta`. Alternatively test `"bt"` → matches `"Beta"`.
  - [ ] 5.4 Write test: **fuzzy miss** — type `"xyz"` → no matching entries → `"No entries found"` text visible
  - [ ] 5.5 Write test: **result capping - overflow hint shown** — render with 60 generated entries (no search term) → overflow hint text `"Showing 50 of 60"` is visible; only 50 option `<li>` items rendered (query `getAllByRole('option')` length === 50)
  - [ ] 5.6 Write test: **result capping - no hint when ≤ 50** — render with 10 entries → overflow hint NOT present
  - [ ] 5.7 Write test: **trigger display - single select** — pass `value="entry:1"` with matching entry `{ _id: 'entry:1', data: { Name: 'Alpha' } }` → trigger button text contains `"Alpha"` and NOT `"1 selected"`
  - [ ] 5.8 Write test: **trigger display - multi select ≤ 2** — pass `value={['entry:1', 'entry:2']}` with entries Alpha and Beta → trigger text is `"Alpha, Beta"`
  - [ ] 5.9 Write test: **trigger display - multi select > 2** — pass `value={['entry:1', 'entry:2', 'entry:3']}` with Alpha, Beta, Zeta → trigger text is `"Alpha +2 more"`
  - [ ] 5.10 Run full test suite — verify ≥ 66 files, pre-existing 7 failures unchanged, new 8+ tests pass, 0 new failures

- [ ] Task 6 — TypeScript validation (AC: #8)
  - [ ] 6.1 Run `npx tsc --noEmit` — confirm 0 new errors
  - [ ] 6.2 Ensure `fuzzyScore` export has explicit return type `: number` annotation
  - [ ] 6.3 Ensure the IIFE for `selectedDisplay` has the `(e): e is LedgerEntry` type guard so TypeScript narrows correctly after `.filter(Boolean)`

## Dev Notes

### Fuzzy Score Algorithm

```ts
export const MAX_RESULTS = 50;

/**
 * Fuzzy-match `query` against `text`. Returns a score ≥ 0 on match, -1 on no match.
 * Tier 1 (highest): exact substring match → score = 100 + (text.length - query.length)
 * Tier 2: subsequence match → score = sum of consecutive-character run lengths
 * All comparisons are case-insensitive.
 */
export function fuzzyScore(text: string, query: string): number {
  if (query === '') return 0;
  const t = text.toLowerCase();
  const q = query.toLowerCase();

  // Tier 1: substring
  if (t.includes(q)) return 100 + (t.length - q.length);

  // Tier 2: subsequence
  let score = 0;
  let consecutive = 0;
  let qi = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      qi++;
      consecutive++;
      score += consecutive;
    } else {
      consecutive = 0;
    }
  }
  return qi === q.length ? score : -1;
}
```

Export `fuzzyScore` and `MAX_RESULTS` as named exports. This lets the test file import and unit-test the algorithm directly without needing to drive a UI interaction.

### `useDeferredValue` in React 19

React 19 ships with Concurrent Mode always-on. `useDeferredValue` marks the deferred value as lower-priority, so React processes keystroke state updates (high priority) before re-running the filter computation (low priority). No manual `setTimeout`/debounce is needed.

```ts
const deferredSearchTerm = React.useDeferredValue(searchTerm);
// deferredSearchTerm lags behind searchTerm during rapid input
```

**Important**: `useDeferredValue` requires the component to be inside a React 19 Concurrent tree (which Vite + React 19 provides by default via `createRoot`). It is already available — no provider changes needed.

### `getDisplayValue` in the Filter Loop

`getDisplayValue` is a prop (inline arrow function from `InlineEntryRow`). It is **not** stable across renders, so wrapping the filter in `useMemo` with `getDisplayValue` in the deps array would invalidate the memo on every render (defeating the purpose). Since `useDeferredValue` already defers the computation to a low-priority render pass, no `useMemo` is needed — the IIFE runs inline in the deferred render. This is the correct React 19 pattern.

### Overflow Hint — Not a Listbox Option

The overflow hint `<li>` must **not** carry `role="option"` and must not be included in the keyboard-navigation index. The `ArrowUp`/`ArrowDown` bounds use `visibleEntries.length` (always ≤ 50), so the hint item is naturally excluded.

### Full Replace for `filteredEntries`

The existing `RelationCombobox.test.tsx` (7 tests) tests the component with small entry arrays (3 items). With `MAX_RESULTS = 50`, these tests are unaffected — they will never trigger the overflow path. The existing tests exercise: open/close, filter/search, select single, select multiple, keyboard navigation — all of which still work over the new fuzzy-filtered `visibleEntries` array. Do **not** modify `tests/RelationCombobox.test.tsx`.

### Architecture Guardrails

- **No `useMemo` around `getDisplayValue` calls** — `useDeferredValue` handles perf; `useMemo` with unstable deps adds confusion
- **No external fuzzy library** (no fuse.js, no miniSearch) — the in-file `fuzzyScore` function handles the use case and keeps the bundle lean
- **No virtual scrolling in dropdown** — with the 50-item cap, the DOM footprint is bounded; `@tanstack/react-virtual` is not needed here
- **No Zustand store changes** — entries continue to flow in as props from `InlineEntryRow`; no new store slices
- **No changes to `InlineEntryRow.tsx`** — it already passes the correct `entries`, `getDisplayValue`, `allowMultiple`, `onKeyDown` props
- **`highlightedIndex` reset on search change** — add `setHighlightedIndex(-1)` in the `onChange` of the search input to avoid stale highlighted index after list reorders

### `highlightedIndex` Reset

When the fuzzy filter re-orders results, the currently highlighted item shifts. Reset `highlightedIndex` to `-1` whenever the search term changes:

```tsx
<input
  ...
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setHighlightedIndex(-1);  // ← add this
  }}
  ...
/>
```

### Implementation Pattern — Full `visibleEntries` Derivation

```tsx
// Near top of component body (after selectedValues line):
const deferredSearchTerm = React.useDeferredValue(searchTerm);

const { visibleEntries, totalCount } = (() => {
  if (!deferredSearchTerm) {
    return { visibleEntries: entries.slice(0, MAX_RESULTS), totalCount: entries.length };
  }
  const scored = entries
    .map(entry => ({ entry, score: fuzzyScore(getDisplayValue(entry), deferredSearchTerm) }))
    .filter(({ score }) => score >= 0)
    .sort((a, b) => b.score - a.score);
  return {
    visibleEntries: scored.slice(0, MAX_RESULTS).map(({ entry }) => entry),
    totalCount: scored.length,
  };
})();
const isOverflowing = totalCount > MAX_RESULTS;
```

### Testing Pattern

Mock entries using the same shape as `tests/RelationCombobox.test.tsx`:
```ts
const makeEntries = (names: string[]) =>
  names.map((name, i) => ({
    _id: `entry:${i}`,
    data: { Name: name },
    _rev: '1-abc',
    schemaId: 'schema:1',
    createdAt: '',
    updatedAt: '',
  }));
```

The component renders standalone — no Zustand store mocks needed (entries are passed as props, not read from store).

For the overflow test, generate 60 entries:
```ts
const sixtyEntries = makeEntries(Array.from({ length: 60 }, (_, i) => `Entry ${i}`));
render(<RelationCombobox entries={sixtyEntries} value="" onChange={vi.fn()} />);
// open dropdown:
fireEvent.click(screen.getByRole('button'));
// the search input is empty → no search term → shows first 50:
const options = screen.getAllByRole('option');
expect(options).toHaveLength(50);
expect(screen.getByText(/Showing 50 of 60/)).toBeInTheDocument();
```

For the fuzzy test:
```ts
render(<RelationCombobox entries={makeEntries(['Alpha', 'Beta', 'Zeta'])} value="" onChange={vi.fn()} />);
fireEvent.click(screen.getByRole('button'));
fireEvent.change(screen.getByPlaceholderText('Search entries...'), { target: { value: 'al' } });
expect(screen.getByText('Alpha')).toBeInTheDocument();
expect(screen.queryByText('Beta')).toBeNull();
expect(screen.queryByText('Zeta')).toBeNull();
```

For the trigger display tests — the trigger button text is inside `<span className="truncate">`. Use `getByRole('button')` and check `.textContent`:
```ts
render(
  <RelationCombobox
    entries={makeEntries(['Alpha', 'Beta', 'Zeta'])}
    value={['entry:0', 'entry:1', 'entry:2']}
    onChange={vi.fn()}
    allowMultiple
  />
);
expect(screen.getByRole('button')).toHaveTextContent('Alpha +2 more');
```

### Type Guard for `filter(Boolean)`

TypeScript requires a type guard to narrow `LedgerEntry | undefined` after `Array.find`:
```ts
.filter((e): e is LedgerEntry => Boolean(e))
```
Without this, TypeScript infers `(LedgerEntry | undefined)[]` and the subsequent `.map(e => getDisplayValue(e))` call will error in strict mode.

### Files to Touch

| File | Change |
|---|---|
| `src/features/ledger/RelationCombobox.tsx` | Export `fuzzyScore` + `MAX_RESULTS`; add `useDeferredValue`; replace `filteredEntries` with fuzzy+deferred+capped `visibleEntries`; add overflow hint `<li>`; update trigger display; reset `highlightedIndex` on search change |
| `tests/dataLabRelationComboboxQuerying.test.tsx` | **Create new** — ≥ 8 test cases (see Tasks 5.2–5.9) |

### Files to NOT Touch

| File | Reason |
|---|---|
| `tests/RelationCombobox.test.tsx` | 7 existing tests must pass unchanged |
| `src/features/ledger/InlineEntryRow.tsx` | No interface changes needed; props flow is already correct |
| `src/stores/useLedgerStore.ts` | Entries are passed as props; no store changes |
| `src/stores/useUIStore.ts` | No new UI state needed |
| `src/components/Inspector/EntryInspector.tsx` | `window.confirm` replacement deferred (carry-forward from 3-9) |
| `src/features/projects/ProjectDashboard.tsx` | `window.confirm` replacement deferred (carry-forward from 3-9) |

### Do-Not-Introduce List

- ❌ No external fuzzy library (fuse.js, minisearch, etc.) — in-file `fuzzyScore` is sufficient
- ❌ No `useMemo` wrapping the filter with `getDisplayValue` in deps — unstable prop reference defeats memoization
- ❌ No `@tanstack/react-virtual` in the dropdown — 50-item cap makes it unnecessary
- ❌ No new Zustand store slices — entries are props
- ❌ No debounce utilities (lodash, custom hook) — `useDeferredValue` is the correct React 19 primitive
- ❌ No changes to `RelationCombobox` props interface — the existing interface is sufficient
- ❌ No `window.confirm` calls — existing ones are deferred; do not add new ones

### Carry-Forward Items (Deferred from Story 3-9)

| Item | Priority | Status |
|---|---|---|
| Replace `window.confirm()` in `EntryInspector.tsx` with Zustand confirm-dialog | MEDIUM | Deferred — not scoped to 3-10 |
| Replace `window.confirm()` in `ProjectDashboard.tsx` with Zustand confirm-dialog | LOW | Deferred — not scoped to 3-10 |

### Test Baseline

Story 3-9 completion: 66 files, 591 passed, 1 skipped, 0 failed.
Current run (post-3-9): 7 pre-existing failures in `src/components/ui/LoadingSkeleton.test.tsx` (unrelated timeout; do not fix in this story). Net new from this story: +1 test file, +8 or more test cases, 0 new failures.

### Project Structure Notes

- All test files in `/tests` — **non-negotiable** per `docs/project-context.md`
- New test: `tests/dataLabRelationComboboxQuerying.test.tsx` — follows `dataLabKeyboardInlineEntry.test.tsx` naming convention
- TypeScript strict mode: `tsconfig.json` has `"strict": true` — all new code must pass
- No barrel exports — import directly from source files

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic 3] — Story 3.10: "The optimized fuzzy-search dropdown to link distant ledger entries without lag"
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Key Component Specifications] — "Relation field | Combobox with live search; selected entry shown as chip"
- [Source: src/features/ledger/RelationCombobox.tsx#42-45] — Current naive `.includes()` filter to be replaced
- [Source: src/features/ledger/RelationCombobox.tsx#110-114] — Current `"X selected"` trigger display to be replaced
- [Source: tests/RelationCombobox.test.tsx] — 7 existing tests (must not regress)
- [Source: src/features/ledger/InlineEntryRow.tsx] — Consumer of RelationCombobox; passes `entries`, `getDisplayValue`, `allowMultiple`, `onKeyDown`
- [Source: docs/project-context.md] — Test co-location rule, TypeScript strict, Zustand patterns
- [Source: package.json] — React 19.1.0 (useDeferredValue available); @tanstack/react-virtual installed (not needed here); no fuse.js

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
