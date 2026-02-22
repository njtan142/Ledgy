# Story 3.3: Bidirectional Relational Links

Status: ready-for-dev

## Story

As a user,
I want to link an entry in one ledger to an entry in another ledger,
So that I can capture cross-domain relationships (e.g., linking a "Coffee" entry to a "Sleep Score" entry).

## Acceptance Criteria

1. **Relation Field Display:** Ledger table shows relation fields as clickable "Tag Chips" displaying the linked entry's display value. [Source: epics.md#Story 3.3]
2. **Combobox Selection:** Clicking a relation field opens a combobox (Select) with searchable entries from the target ledger. [Source: epics.md#Story 3.3]
3. **Link Persistence:** Selecting an entry saves the link reference to PouchDB with proper document structure. [Source: epics.md#Story 3.3]
4. **Bidirectional Display:** The target entry shows a back-link indicating which entries reference it. [Source: epics.md#Story 3.3]
5. **Navigation:** Clicking a relation Tag Chip navigates to the target entry's ledger view with the entry highlighted. [Source: epics.md#Story 3.3]
6. **Multiple Relations:** A field can store multiple relation links (array of entry IDs). [Source: Architecture - Relation fields]
7. **Input Latency:** Combobox opens and responds in <50ms (NFR1). [Source: NFR1]

## Tasks / Subtasks

- [ ] Task 1: Relation Field Display in LedgerTable (AC: 1, 6)
  - [ ] Extend `LedgerTable` to render relation fields as Tag Chips.
  - [ ] Create `RelationTagChip` component in `src/features/ledger/`.
  - [ ] Handle multiple relations (display as chip array).
  - [ ] Style chips with Tailwind (distinct from text/number fields).
- [ ] Task 2: Combobox for Relation Selection (AC: 2, 3)
  - [ ] Create `RelationCombobox` component using shadcn/ui `Select`.
  - [ ] Populate combobox with target ledger entries via `list_entries`.
  - [ ] Implement search/filter for large entry lists.
  - [ ] Wire `update_entry` to save relation field value.
- [ ] Task 3: Bidirectional Back-Links (AC: 4)
  - [ ] Query entries that have relation fields pointing to current entry.
  - [ ] Display back-links in a "Referenced By" section or column.
  - [ ] Ensure back-links update on relation add/remove.
- [ ] Task 4: Navigation on Click (AC: 5)
  - [ ] Wire Tag Chip click to navigate to target ledger route.
  - [ ] Highlight target entry on navigation (visual feedback).
  - [ ] Use React Router v7 for navigation.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for `RelationTagChip` rendering.
  - [ ] Unit tests for `RelationCombobox` selection logic.
  - [ ] Integration test: Create relation → verify persistence → verify back-link.
  - [ ] E2E test: Navigate via relation link.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 3**
- You MUST be on branch `epic/epic-3` for all commits
- All Epic 3 stories share this branch

**Relation Field Data Structure:**
```typescript
// In entry document:
{
  _id: `entry:${uuid}`,
  type: 'entry',
  schema_version: 1,
  ledgerId: string,
  fields: {
    fieldName: string | number | Date | string[] // string[] for multiple relations
  }
}
```

**Schema Field Definition:**
```typescript
{
  name: string,
  type: 'relation',
  relationTarget: string // ledger ID
}
```

**Architecture Compliance:**
- All queries through `useLedgerStore`
- Errors → `useErrorStore` → `<ErrorToast />`
- No direct PouchDB in components

**Code Patterns from Story 3.1 & 3.2:**
- Follow `SchemaBuilder.tsx` and `LedgerTable.tsx` patterns
- Use shadcn/ui `Select`, `Badge` components
- Co-locate tests

### File Structure

```
src/features/ledger/
├── RelationTagChip.tsx       # NEW: Tag chip component
├── RelationTagChip.test.tsx  # NEW: Tests
├── RelationCombobox.tsx      # NEW: Combobox for selection
├── RelationCombobox.test.tsx # NEW: Tests
├── LedgerTable.tsx           # EXISTING: Extend for relation rendering
└── useLedgerStore.ts         # EXISTING: Extend with relation queries
```

### Testing Requirements

**Unit Tests:**
- `RelationTagChip` renders single/multiple relations correctly
- `RelationCombobox` filters entries on search
- `RelationCombobox` commits selection correctly
- Back-link query returns correct entries

**Integration Tests:**
- Create relation → persists to PouchDB
- Back-link appears on target entry
- Click navigates to correct ledger/entry

### Previous Story Intelligence

**From Story 3.1:**
- Schema types: `LedgerSchema`, `SchemaField`, `FieldType`
- DAL functions: `list_entries`, `update_entry`

**From Story 3.2:**
- `LedgerTable` component structure
- Inline editing patterns
- Keyboard navigation patterns

### References

- [Source: planning-artifacts/epics.md#Story 3.3]
- [Source: planning-artifacts/architecture.md#PouchDB Document Envelope]
- [Source: docs/project-context.md#Critical Implementation Rules]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Implementation Plan

<!-- To be filled by dev agent -->

### Debug Log References

<!-- To be filled by dev agent -->

### Completion Notes List

<!-- To be filled by dev agent -->

### File List

<!-- To be filled by dev agent -->

### Change Log

<!-- To be filled by dev agent -->
