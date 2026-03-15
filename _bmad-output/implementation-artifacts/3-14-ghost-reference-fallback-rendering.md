# Story 3.14: Ghost Reference Fallback Rendering

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user linking records across ledgers,
I want deleted reference targets to render as "ghost" (disabled, struck-through) instead of crashing the UI,
so that I can see which entries once linked to records that no longer exist, and understand the relationship history without losing data integrity.

## Acceptance Criteria

1. **Ghost detection on render** — When rendering a relation field cell, if the target entry ID exists in the target ledger's `deletedEntryIds` memoized set, mark it as ghost before rendering. The target ledger is determined by the schema field's `relationTarget` property.

2. **RelationTagChip receives isGhost flag** — The `RelationTagChip` component already accepts an `isGhost` prop; pass `true` when target is deleted.

3. **Visual styling for ghosts** — Ghost references render with specified styling:

   | Property | Value |
   |---|---|
   | Background | zinc-800 |
   | Border | zinc-700 |
   | Text color | zinc-500 |
   | Text decoration | line-through |
   | Cursor | not-allowed |
   | External link icon | Hidden |

4. **No crash on deleted target** — Relation rendering gracefully handles missing targets without throwing errors or leaving blank cells.

5. **Navigation prevented on ghost** — Clicking a ghost reference does nothing (disabled button); no navigation attempt, no error logs.

6. **Bulk selection includes ghosts** — Ghost references remain selectable via checkbox in bulk-edit mode; they do not bypass the selection UI.

7. **Ghost rendering in InlineEntryRow** — When editing an existing entry with a relation field that currently points to a deleted entry:
   - The deleted entry ID renders as a ghost chip (line-through, zinc-500, disabled)
   - User can remove the ghost reference
   - User can add new (non-deleted) references alongside the ghost
   - The ghost reference is preserved in the form data until explicitly removed

8. **Ghost rendering in BackLinksPanel** — Ghost references within BackLinksPanel entries are handled correctly: if a backlink source entry contains relation fields pointing to deleted targets, those relations render as ghosts (line-through, disabled) within the BackLinksPanel display.

9. **Schema-aware ghost detection** — Ghosts are only checked for relation field types; non-relation fields ignore the deleted state.

10. **No console warnings** — Ghost detection and rendering do NOT emit console.warn() or console.error() during normal operation. Any errors are surfaced through the global error store (useErrorStore), not console.

11. **Ghost entries in RelationCombobox** — Deleted entries in relation field dropdowns render with:
   - Strikethrough text
   - Zinc-500 text color
   - Can still be selected (not filtered out)

12. **Hard deletion resilience** — If a target entry is hard-deleted from the database (not just soft-deleted), the relation still renders gracefully:
   - Renders as ghost with strikethrough (same appearance as soft-delete)
   - No error logs or crashes
   - No console warnings

13. **Accessibility** — Ghost references are accessible:
   - Ghost buttons have `disabled={true}` and `aria-disabled='true'`
   - RelationTagChip ghost chip has `title='This entry has been deleted'`
   - Screen readers should read: `<entry-id> deleted reference`
   - Keyboard users can tab to ghost entries but cannot activate them (Enter does nothing)

## Tasks / Subtasks

- [ ] Task 1 — Audit current ghost detection and RelationTagChip integration
  - [ ] 1.1 Verify `deletedEntryIds` memoized set is correctly populated in LedgerTable (line 58-72)
  - [ ] 1.2 Confirm RelationTagChip component accepts and respects `isGhost` prop
  - [ ] 1.3 Check that all relation rendering code paths pass `isGhost` flag

- [ ] Task 2 — Ensure ghost flag is passed at all rendering touchpoints
  - [ ] 2.1 Update LedgerTable cell rendering logic to pass `isGhost={deletedEntryIds.has(val)}` to RelationTagChip
  - [ ] 2.1.5 **CRITICAL:** Extend RelationCombobox component to accept `deletedEntryIds?: Set<string>` prop and render deleted entries with ghost styling
  - [ ] 2.2 Update InlineEntryRow's RelationCombobox rendering to highlight/disable ghost targets
  - [ ] 2.3 Update BackLinksPanel to mark or filter soft-deleted backlink source entries (choice depends on UX preference)
  - [ ] 2.4 Test edge case: relation field with empty/null value vs. deleted target

- [ ] Task 3 — Validate ghost UI styling and interaction
  - [ ] 3.1 Test visual appearance in dark mode: line-through, zinc-500 text, zinc-800/700 borders (verify against AC 3 table)
  - [ ] 3.2 Confirm ghost buttons are disabled and cursor shows `not-allowed`
  - [ ] 3.3 Verify no navigation occurs on ghost click
  - [ ] 3.4 Confirm bulk selection checkboxes work on ghosts; entries containing ghosts remain selectable for bulk operations
  - [ ] 3.5 Verify ARIA labels and screen-reader compatibility for accessibility

- [ ] Task 4 — Test edge cases and error resilience
  - [ ] 4.1 Create entry with relation → soft-delete target → verify cell shows ghost on re-render
  - [ ] 4.2 Test ghost rendering with multi-relation fields (multiple ghosts in one cell)
  - [ ] 4.3 Verify no crashes or console errors when rendering large datasets with many ghosts; profile memoization performance
  - [ ] 4.4 Test ghost rendering after schema migration (schema_version bump):
    - [ ] Run JIT migration on sample entries (via story 3-6 logic)
    - [ ] Verify deletedEntryIds Set is correctly invalidated
    - [ ] Verify ghosts still render correctly if target ledger schema changed
    - [ ] If relation field removed from schema, verify ghosts do not appear
  - [ ] 4.5 Test hard-deletion resilience: hard-delete target entry → verify ghost still renders gracefully

- [ ] Task 5 — TypeScript and testing
  - [ ] 5.1 Ensure `npx tsc --noEmit` passes with zero new errors
  - [ ] 5.2 Add unit tests for ghost detection logic (deletedEntryIds memoization)
  - [ ] 5.3 Add unit tests for RelationTagChip with `isGhost` prop variations
  - [ ] 5.4 Add integration tests: create entry → link target → soft-delete target → verify ghost render
  - [ ] 5.5 Add accessibility tests: verify ARIA attributes and keyboard navigation work correctly

## Dev Notes

### Architecture Guardrails

**From Architecture Document (Story-Relevant Extract):**
- **Data Integrity:** Ghost References (soft-delete) prevents crashes when remote entries are deleted before local sync
- **Relation Rendering Pattern:** Use `relationTarget` schema field to determine target ledger; filter deletedEntryIds from that ledger only
- **Error Handling:** All rendering errors must propagate through the global error store pattern — no local try/catch in components

**deletedEntryIds Memoization Details:**
- Recomputes whenever:
  - A new entry is soft-deleted (isDeleted flag changed in allEntries)
  - The schema changes (new relation fields added)
  - Focus moves to a different ledger (schemaId changes)
- Scoped to relation target schemas only (LedgerTable line 61-63)
- Performance: O(n) per relation-target ledger, but only runs when dependencies change
- Memoization dependency array includes `allEntries` and `schema` (critical for cache invalidation)

### Code Patterns Established

**Related Stories & Code Patterns:**

- **Story 3.13 (Bidirectional Link Writing):** Soft-delete semantics (isDeleted flag is single source of truth), backlink metadata structure, batched writes for performance
- **Story 3.9 (Inline Entry Row):** Keyboard-first FieldInput + RelationCombobox integration, ref-based navigation
- **Story 3.8 (Header Sorting):** Memoization critical for large datasets, column state management
- **Story 3-6 (Schema Migration JIT Engine):** Schema version bumps trigger JIT migrations; deletedEntryIds memoization must invalidate correctly

See full story files for deeper implementation context.

### Project Structure Notes

**Relevant Directories:**
- `src/features/ledger/` — All relation-rendering components (LedgerTable, RelationTagChip, InlineEntryRow, BackLinksPanel)
- `src/stores/useLedgerStore.ts` — Zustand store managing entries, schemas, backLinks queries
- `src/types/ledger.ts` — LedgerEntry, SchemaField, BackLinkMetadata types

**Code Files to Touch:**
1. `src/features/ledger/LedgerTable.tsx` (line ~140+) — Cell rendering where RelationTagChip is called; ensure `isGhost` flag is passed
2. `src/features/ledger/RelationTagChip.tsx` — Already has `isGhost` prop; verify styling is complete
3. `src/features/ledger/InlineEntryRow.tsx` (line ~150+) — FieldInput rendering for relation type; pass ghost flag to combobox
4. `src/features/ledger/BackLinksPanel.tsx` (line ~45+) — BackLinkItem rendering; filter or mark soft-deleted entries if necessary
5. `tests/` — Add unit/integration tests per AC

### Testing Standards Summary

**Testing Conventions:**
Per project-context.md: all tests in `/tests`, Vitest for unit, Playwright for E2E. Target coverage: 80% on ghost detection and rendering logic (see Task 5).

## Previous Story Intelligence (Story 3.13: Bidirectional Link Writing)

**What Was Learned:**
- Backlink metadata is recomputable but beneficial to index for query performance
- Soft-delete (isDeleted flag) + restore lifecycle requires careful handling of derived metadata
- Batched writes (`bulkPatchDocuments`) prevent N² performance issues on large entry sets
- PouchDB reserved fields (underscore-prefixed) must never be used for custom data

**Code Patterns Established:**
- Relation extraction: filter schema fields by `type === 'relation'` and extract target IDs from entry.data
- Diff helpers: compare previous vs next sets to determine patches needed
- Backlink patches: structured as add/remove operations, applied atomically in entry lifecycle

**Review Findings:**
- String typos in error messages were caught in code review
- Soft-delete semantics clarified: isDeleted flag is the single source of truth
- Performance: use Set for O(1) lookups when checking if entry is in a deleted set

**Testing Coverage from Story 3.13:**
- Create/update/delete/restore backlink cycles tested
- Schema-aware extraction verified (non-relation fields ignored)
- Cross-ledger compatibility confirmed (backlinks work across different schemas)

## Git Intelligence (Story Commit Patterns)

**Expected commit pattern for this story:**
```
docs(story): create story 3-14 ghost reference fallback rendering and mark ready-for-dev
feat(story-3.14): implement ghost reference fallback rendering
fix(story-3.14): resolve code review findings
```

**Per project conventions:** Story files created first (docs commit), then implementation (feat), then review fixes (fix).

## Latest Tech Information

**Latest Technical Context:**
- No external libraries required for ghost detection (uses native Set, array.includes)
- React 19 component props passed directly (no Provider wrapping needed for isGhost flag)
- Tailwind class conditions continue to work (dark mode ghost styling already tested in RelationTagChip)

## Project Context Reference

**Ledgy Architecture Principles (Relevant Extracts):**
- **Single User, Multi-Profile:** Each profile has its own PouchDB instance; deleted entries are soft-deleted locally
- **Relational Integrity:** Ghost References pattern prevents broken links when entries are deleted before sync
- **Schema Versioning:** `schema_version` field on every document enables JIT migrations (not required for this story but context)

**Key Restrictions:**
- PouchDB field names MUST NOT start with underscore (reserved for PouchDB internals)
- All dates must be ISO 8601 strings with timezone offset
- Tauri commands are Rust `snake_case`; React/TS code is `camelCase` or `PascalCase`

## Dev Agent Record

### Agent Model Used

[To be filled by implementing agent]

### Debug Log References

[To be filled by implementing agent with references to test failures, console logs, or debugging steps]

### Completion Notes List

[To be filled by implementing agent with learnings for next story, gotchas, or architectural decisions made]

### File List

[To be filled by implementing agent with exhaustive list of files created/modified]
