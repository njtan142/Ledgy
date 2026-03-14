# Story 3.12: Data Lab - Bulk Selection & Edit States

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a power user managing large ledgers with 100+ entries,
I want to select multiple rows with a checkbox column and perform bulk actions (mass delete, tag assignment),
so that I can efficiently batch-modify entries without entering each one individually.

## Acceptance Criteria

1. **Checkbox column appears first** — Pressing `N` to open an inline entry row, or viewing any data grid, shows a checkbox column to the left of all data fields. The column header has a "Select All" checkbox.

2. **Row selection toggle** — Clicking a row's checkbox toggles selection state for that row. The checkbox state is immediately visual (checked/unchecked).

3. **Select All toggles all visible rows** — Clicking the column header checkbox selects or deselects all visible rows in the current viewport.

4. **Bulk Delete action** — When ≥1 row is selected, a "Bulk Delete" button appears in a floating action bar (or context menu). Clicking it opens a confirmation dialog showing count of selected rows (e.g., "Delete 5 entries?"). Confirming deletes all selected rows from PouchDB in a single batch operation.

5. **Tag assignment to bulk selection** — When ≥1 row is selected, a "Bulk Assign Tag" option appears (via button or context menu). Opens a small modal/dropdown to select or create a tag. Assigning adds the tag to all selected entries.

6. **Keyboard support for selection** — `Space` key on a focused data cell (when inline entry row is NOT open) toggles selection for that row. `Shift+Click` selects a range of rows (from first clicked to Shift-clicked).

7. **Selection state survives scroll** — If user selects rows, scrolls the virtualized grid, and scrolls back, previously selected rows remain visually checked.

8. **Bulk edit visual feedback** — When ≥2 rows are selected, a subtle highlight (e.g., light blue/gray background) appears on selected rows to indicate batch edit mode is active.

9. **Clear selection after action** — After a bulk delete or tag assignment completes successfully, all row checkboxes are unchecked and the selection state is cleared from the Zustand store.

10. **No regression — existing entry flow** — Pressing `N` to create a new inline entry row still works identically. The inline entry row fields use the same focus management (Tab/Shift+Tab wrapping) from Story 3-11 without modification.

11. **TypeScript** — `npx tsc --noEmit` emits zero new errors after all changes.

12. **Test coverage** — New test file `tests/dataLabBulkSelection.test.tsx` with ≥10 test cases (see Tasks section).

## Tasks / Subtasks

- [ ] Task 1 — Add bulk selection state to Zustand store
  - [ ] 1.1 Open `src/stores/ledgerStore.ts`
  - [ ] 1.2 Add new state and actions:
    ```ts
    // Bulk selection management
    selectedRowIds: Set<string>;
    toggleRowSelection: (rowId: string) => void;
    selectAll: (rowIds: string[]) => void;
    clearSelection: () => void;
    ```
  - [ ] 1.3 Implement `toggleRowSelection`: add rowId to Set if not present, remove if present
  - [ ] 1.4 Implement `selectAll`: populate selectedRowIds with all provided rowIds
  - [ ] 1.5 Implement `clearSelection`: empty the Set and reset to initial state

- [ ] Task 2 — Implement checkbox column in LedgerTable grid
  - [ ] 2.1 Open `src/features/ledger/LedgerTable.tsx`
  - [ ] 2.2 Import the new store selectors: `selectedRowIds`, `toggleRowSelection`, `selectAll`, `clearSelection`
  - [ ] 2.3 Add checkbox column header as first virtualizer row (before field headers)
    - [ ] 2.3a Render "Select All" checkbox in header
    - [ ] 2.3b Checkbox state: checked if all visible rows are selected, indeterminate if partial, unchecked if none
    - [ ] 2.3c onClick handler calls `selectAll(allVisibleRowIds)` or `clearSelection()` based on current state
  - [ ] 2.4 For each data row, render checkbox in first column
    - [ ] 2.4a Checkbox state: `selectedRowIds.has(rowId)`
    - [ ] 2.4b onClick handler calls `toggleRowSelection(rowId)`
    - [ ] 2.4c CSS class `.selected-row` applied to row when checkbox is checked (for visual highlight)
  - [ ] 2.5 Space key handler on focused cell toggles selection for that row (integrate into existing keyboard handler)
  - [ ] 2.6 Shift+Click handler: determine first and last clicked row indices, select range (inclusive)

- [ ] Task 3 — Create floating action bar for bulk operations
  - [ ] 3.1 Create new file `src/features/ledger/BulkActionBar.tsx`
  - [ ] 3.2 Component displays only when `selectedRowIds.size >= 1`
  - [ ] 3.3 Floating position: fixed at bottom-center of viewport, above tab bar (z-index: 40)
  - [ ] 3.4 Display text: "X entries selected" with count
  - [ ] 3.5 Buttons: "Delete Selected" and "Assign Tag" (both disabled if 0 selected)
  - [ ] 3.6 Import this component in `src/features/ledger/DataLabView.tsx` (or parent layout) and render at layout bottom

- [ ] Task 4 — Implement bulk delete action
  - [ ] 4.1 In `BulkActionBar.tsx`, create `handleBulkDelete` function
  - [ ] 4.2 Show confirmation dialog: "Delete X entries? This cannot be undone."
  - [ ] 4.3 On confirm: batch delete all selected row IDs from PouchDB
    - [ ] 4.3a Use `db.bulkDocs()` or similar batch operation (check existing PouchDB patterns in codebase)
    - [ ] 4.3b Each delete doc: `{ _id: rowId, _deleted: true, _rev: latestRev }`
    - [ ] 4.3c Catch errors and display error toast if any delete fails
  - [ ] 4.4 On success: call `clearSelection()` from store
  - [ ] 4.5 Show success toast: "X entries deleted"

- [ ] Task 5 — Implement bulk tag assignment
  - [ ] 5.1 In `BulkActionBar.tsx`, create `handleBulkAssignTag` function
  - [ ] 5.2 Open a small modal/popover with tag selector or create-new-tag input
    - [ ] 5.2a Display existing tags (query from store or load from schema)
    - [ ] 5.2b Allow user to type new tag name if not in list
  - [ ] 5.3 On tag select: batch update all selected rows
    - [ ] 5.3a Load each selected row document
    - [ ] 5.3b Add tag to row's `tags` field (or create field if not present)
    - [ ] 5.3c Use batch update: `db.bulkDocs([...updatedDocs])`
  - [ ] 5.4 On success: call `clearSelection()` from store
  - [ ] 5.5 Show success toast: "Tagged X entries"

- [ ] Task 6 — Add CSS styling for selection highlight
  - [ ] 6.1 Open `src/index.css` or relevant Tailwind config
  - [ ] 6.2 Add `.selected-row` class: light background highlight (e.g., `bg-blue-50` or `bg-gray-100`)
  - [ ] 6.3 Ensure checkbox column width is consistent (~40-50px)
  - [ ] 6.4 Ensure checkbox is vertically centered in grid cells

- [ ] Task 7 — Write comprehensive tests
  - [ ] 7.1 Create `tests/dataLabBulkSelection.test.tsx`
  - [ ] 7.2 Set up mocks: Zustand store, PouchDB, virtualized grid (reuse boilerplate from `tests/dataLabFocusManagement.test.tsx`)
  - [ ] 7.3 Test 1 — Checkbox column header renders: verify "Select All" checkbox is in DOM
  - [ ] 7.4 Test 2 — Row checkbox toggles selection: click row checkbox → selectedRowIds updated in store
  - [ ] 7.5 Test 3 — Select All toggles all rows: click header checkbox → all rows marked as selected
  - [ ] 7.6 Test 4 — Partial selection → indeterminate header checkbox: select 2 of 3 rows → header checkbox aria-checked="mixed"
  - [ ] 7.7 Test 5 — Space key toggles selection: focus on data cell, press Space → row checkbox toggles
  - [ ] 7.8 Test 6 — Shift+Click selects range: click row 1, Shift+click row 3 → rows 1, 2, 3 all selected
  - [ ] 7.9 Test 7 — Bulk Delete modal shows count: select 3 rows, click "Delete Selected" → confirmation dialog shows "Delete 3 entries?"
  - [ ] 7.10 Test 8 — Bulk Delete removes rows from store: confirm delete → selectedRowIds cleared
  - [ ] 7.11 Test 9 — Bulk Tag modal opens: select rows, click "Assign Tag" → tag selector popover is visible
  - [ ] 7.12 Test 10 — Selection state survives scroll: select rows, virtualizer scrolls, scrolls back → rows still selected
  - [ ] 7.13 Test 11 (Optional) — No regression - inline entry row still works: press `N` → inline entry row opens without affecting checkboxes
  - [ ] 7.14 All tests ≥10 cases, all passing

- [ ] Task 8 — TypeScript validation
  - [ ] 8.1 Run `npx tsc --noEmit`
  - [ ] 8.2 Confirm 0 new errors introduced

## Dev Notes

### Current State Analysis

#### Data Lab Grid Architecture
The data grid is built with `@tanstack/react-virtual` for virtualization (handles 10k+ rows efficiently). The grid renders field columns in a horizontal scroll container. The Zustand store (`ledgerStore.ts`) already manages entry data, inline editing state, and focus management from Story 3-11.

**Key files:**
- `src/features/ledger/LedgerTable.tsx` — Main grid container and row rendering
- `src/features/ledger/InlineEntryRow.tsx` — Inline entry mode (opened via `N` key)
- `src/stores/ledgerStore.ts` — Global state (entries, schemas, UI state)
- `tests/dataLabFocusManagement.test.tsx` — Test setup patterns and mocks

#### Story 3-11 Completion
Focus management was just completed in the most recent commit (`fcaa8e5`). This story builds directly on top:
- Tab/Shift+Tab wrapping within inline entry row fields is already working
- RelationCombobox dropdown handling is in place
- Test infrastructure (mocks, render helpers) is established and stable

This story should **NOT modify** InlineEntryRow or focus logic—only add the checkbox column and bulk actions.

#### Virtualization Challenge
The grid uses React Virtual to render only visible rows (~20-50 at a time in a typical viewport). When implementing:
- Checkbox state must come from Zustand store, not local component state (so selections persist across scroll)
- "Select All" must intelligently handle only visible rows unless you load full row list into store

#### PouchDB Batch Operations Pattern
From Story 3-11 and prior stories, batch operations follow this pattern:
```ts
const docs = selectedRowIds.map(rowId => ({
  _id: rowId,
  _rev: getLatestRev(rowId), // fetch from store or DB
  _deleted: true // or mutation object
}));
await db.bulkDocs(docs);
```

Check `src/lib/db.ts` for existing helpers.

### Previous Story Intelligence

**Story 3-11 (Focus Management)** — Just completed:
- Added Tab/Shift+Tab wrapping to InlineEntryRow
- Modified RelationCombobox to close dropdown on Tab and forward focus
- Established comprehensive test patterns in `tests/dataLabFocusManagement.test.tsx`

**Learnings from 3-11:**
- Test setup is complex but stable; reuse the mock patterns verbatim
- Zustand selectors with `useShallow` prevent unnecessary re-renders
- RelationCombobox required double-casting (`as unknown as React.KeyboardEvent<HTMLButtonElement>`) — be prepared for TypeScript gymnastics in complex interactions
- Focus wrapping with modulo arithmetic is clean: `(index + 1) % length`

### Git Intelligence Summary

**Recent commits (last 5):**
1. `f069f59` — Mark story 3-11 as done in artifact file
2. `c513e6e` — Update sprint status - story 3-11 moved to done  
3. `939e261` — Add type-cast documentation and correct story line numbers
4. `3539f85` — Update sprint status - story 3-11 moved to review
5. `fcaa8e5` — feat(data-lab): Implement focus management (full implementation)

**Code patterns from recent work:**
- All keyboard event handlers in data-lab features follow a `case 'KeyName': ...` pattern within `handleKeyDown`
- Zustand store updates are atomic (one action per mutation)
- Tests import and use `setupLedgerTableMocks()` helper from test setup
- PouchDB operations are abstracted in `src/lib/db.ts` — always check existing helpers before writing new ones
- TypeScript is strict; use `as unknown as TargetType` only when necessary, with comments explaining the cast

### Architecture Compliance

**From Architecture.md:**
- **State Management:** Zustand with `useShallow` selector pattern (established in prior stories)
- **Data Layer:** PouchDB batch operations via `db.bulkDocs()`
- **Keyboard Design:** All grid interactions must be keyboard-accessible (Tab, Space, Shift+Click, Arrow keys)
- **Virtualization:** Selection state in Zustand, not component state
- **Performance:** Checkbox toggles must not cause full grid re-render; use granular selectors

### Library & Framework Specifics

**@tanstack/react-virtual:**
- Renders only visible items; rowIndex in render callback reflects position in full list
- Selection state MUST be stored in persistent Zustand (not temporary React state)

**Zustand:**
- Use `useShallow` when component needs multiple store fields to avoid re-renders per field change
- Batch updates in single `set()` call: `set({ field1: x, field2: y })`

**TypeScript in this codebase:**
- Strict mode enabled; all DB operations need type guards
- Common pattern: `const rowId = rowData._id as string` after validation

### File Structure Requirements

Alignment with established patterns:
- New component: `src/features/ledger/BulkActionBar.tsx`
- New test file: `tests/dataLabBulkSelection.test.tsx`
- Store mutations: add to existing `src/stores/ledgerStore.ts` (don't create new file)
- Styling: use Tailwind classes inline or add to `src/index.css`

### Testing Standards

From `tests/dataLabFocusManagement.test.tsx`:
- Mock PouchDB with Jest mocks
- Mock Zustand store with `beforeEach` setup
- Use `render()` from `@testing-library/react`
- Query with `getByRole()`, `getByPlaceholderText()`, `queryByText()` — never `querySelector`
- Fire keyboard events with `fireEvent.keyDown()` or `userEvent.keyboard()`
- Verify state updates with `waitFor()` for async operations

### Common Pitfalls to Avoid

1. **Selection state in component state** — If you use `useState` for selectedRowIds in LedgerTable, selections will reset on scroll. Store in Zustand.
2. **Not clearing selection after action** — After bulk delete/tag succeeds, forget to call `clearSelection()` → UI shows old selections
3. **Ignoring virtualization** — If you assume all 1000 rows are in DOM to select them, the UI will freeze. Load only visible row IDs or paginate.
4. **Missing rev in PouchDB updates** — Forgetting `_rev` field causes conflict errors. Always fetch current `_rev` before batch update.
5. **Not testing with 100+ rows** — Bulk ops feel fast with 5 rows but slow with 10k. Test suite should include virtualization edge cases (scrolled-out-of-view selections).

## References

- [Source: docs/project-context.md](../../docs/project-context.md) — Core design principles and tech stack
- [Source: planning-artifacts/prd.md#Success Criteria](../planning-artifacts/prd.md) — Ledgy measurable outcomes (Data integrity, Performance)
- [Source: planning-artifacts/architecture.md#Frontend Architecture](../planning-artifacts/architecture.md) — Zustand patterns, React Virtual, keyboard accessibility
- [Source: planning-artifacts/ux-design-specification.md#Effortless Interactions](../planning-artifacts/ux-design-specification.md) — "Speed of thought" principle; batch operations must feel instant
- [Source: _bmad-output/implementation-artifacts/3-11-data-lab-focus-management.md](./3-11-data-lab-focus-management.md) — Prior story: focus management patterns and test infrastructure
- [Source: _bmad-output/implementation-artifacts/3-9-data-lab-keyboard-first-inline-entry-row.md](./3-9-data-lab-keyboard-first-inline-entry-row.md) — Inline entry row keyboard support
- Epic Context: [Epic 3 — Relational Ledger Engine](../planning-artifacts/epics.md#epic-3-relational-ledger-engine-core-data) — Story 3-12 is bulk selection; follows focus management (3-11)

## Dev Agent Record

### Agent Model Used

Claude Haiku 4.5

### Debug Log References

None yet — this is the initial story file creation.

### Completion Notes List

- [ ] Story development started
- [ ] All acceptance criteria met
- [ ] All tests passing (≥10 test cases)
- [ ] TypeScript validation: 0 errors
- [ ] Code review passed
- [ ] Story marked done in sprint-status.yaml

### File List

**Files to create:**
- `src/features/ledger/BulkActionBar.tsx` — Floating action bar for bulk operations
- `tests/dataLabBulkSelection.test.tsx` — Test suite with ≥10 test cases

**Files to modify:**
- `src/stores/ledgerStore.ts` — Add bulk selection state and actions
- `src/features/ledger/LedgerTable.tsx` — Add checkbox column and selection UI
- `src/index.css` — Add `.selected-row` styling (if needed)

**Files NOT to modify (regression protection):**
- `src/features/ledger/InlineEntryRow.tsx` — Focus management from 3-11 stays untouched
- `src/features/ledger/RelationCombobox.tsx` — Tab forwarding from 3-11 stays untouched
- `tests/dataLabFocusManagement.test.tsx` — Existing focus tests must continue to pass
