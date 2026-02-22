# Story 5.4: Conflict Resolution (Accept/Reject)

Status: ready-for-dev

## Story

As a user,
I want to review conflicting fields side-by-side and choose which version to keep,
So that my data insurance feels firmly in my control.

## Acceptance Criteria

1. **Accept Local:** Clicking "Accept Desktop" commits the local revision to PouchDB and resolves the conflict. [Source: epics.md#Story 5.4]
2. **Accept Remote:** Clicking "Accept Mobile" commits the remote revision and resolves the conflict. [Source: epics.md#Story 5.4]
3. **Skip Option:** User can "Skip" to leave conflict pending for later resolution. [Source: epics.md#Story 5.4]
4. **Badge Update:** Once all conflicts resolved, Sync Status Badge returns to `synced` (emerald). [Source: epics.md#Story 5.4]
5. **Field-Level Resolution:** User can choose different versions for individual fields (optional advanced feature). [Source: UX Design Spec]
6. **Confirmation Toast:** Successful resolution shows confirmation toast. [Source: UX Design Spec]

## Tasks / Subtasks

- [ ] Task 1: Accept Local/Remote Logic (AC: 1, 2)
  - [ ] Create `resolveConflict` function in `src/lib/db.ts` or `src/features/sync/syncService.ts`.
  - [ ] Implement PouchDB `put()` with winning revision.
  - [ ] Handle `_rev` updates correctly.
  - [ ] Remove conflict from `useSyncStore` state.
- [ ] Task 2: Skip Functionality (AC: 3)
  - [ ] Implement "Skip" button that closes modal without resolving.
  - [ ] Keep conflict in pending state.
- [ ] Task 3: Field-Level Resolution (AC: 5) - Optional
  - [ ] Add per-field checkboxes in Diff Guard modal.
  - [ ] Allow merging local and remote field values.
  - [ ] Construct merged document and save.
- [ ] Task 4: Badge & Toast Updates (AC: 4, 6)
  - [ ] Update `SyncStatusBadge` when conflict count reaches zero.
  - [ ] Show confirmation toast on resolution.
  - [ ] Trigger sync to propagate resolution to remote.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for `resolveConflict` function.
  - [ ] Unit tests for field-level merge logic.
  - [ ] Integration test: Resolve conflict → badge updates → sync propagates.
  - [ ] E2E test: Full resolution flow with toast confirmation.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 5**
- You MUST be on branch `epic/epic-5` for all commits

**Conflict Resolution Function:**
```typescript
async function resolveConflict(
  entryId: string,
  winningVersion: 'local' | 'remote' | 'merged',
  mergedData?: any
): Promise<void> {
  const conflict = getConflict(entryId);
  const winner = winningVersion === 'local'
    ? conflict.localVersion.data
    : winningVersion === 'remote'
    ? conflict.remoteVersion.data
    : mergedData;

  await db.put({
    ...winner,
    _id: entryId,
    _rev: conflict.localVersion.data._rev // Use local rev for PouchDB
  });

  removeConflict(entryId);
}
```

**PouchDB Revision Handling:**
```typescript
// Must use correct _rev when updating
const doc = await db.get(entryId);
await db.put({
  ...doc,
  ...newData,
  _rev: doc._rev // Current revision
});
```

**Architecture Compliance:**
- Resolution through `useSyncStore` actions
- Toast via `<ErrorToast />` pattern (or success toast variant)
- Sync propagation after resolution

**Code Patterns:**
- Use shadcn/ui `Button`, `Dialog` components
- Toast notifications for confirmations
- Co-locate tests

### File Structure

```
src/features/sync/
├── DiffGuardModal.tsx            # MODIFIED: Add resolve/skip buttons
├── useSyncStore.ts               # MODIFIED: Add resolution actions
└── syncService.ts                # MODIFIED: Add resolveConflict function
```

```
src/lib/
└── db.ts                         # MODIFIED: Conflict resolution DAL
```

### Testing Requirements

**Unit Tests:**
- `resolveConflict` saves correct revision
- Field-level merge creates correct merged document
- Skip leaves conflict unchanged
- Toast displays on resolution

**Integration Tests:**
- Accept Local → conflict removed → badge updates
- Accept Remote → conflict removed → sync propagates
- Resolve all conflicts → badge shows `synced`

**E2E Tests:**
- Full flow: detect conflict → resolve → verify synced state

### Previous Story Intelligence

**From Story 5.1:**
- PouchDB replication
- DAL functions

**From Story 5.2:**
- `SyncStatusBadge` component

**From Story 5.3:**
- `DiffGuardModal` component
- Conflict detection system

### References

- [Source: planning-artifacts/epics.md#Story 5.4]
- [Source: planning-artifacts/ux-design-specification.md#Conflict Resolution]
- [Source: planning-artifacts/architecture.md#Conflict Resolution]
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
