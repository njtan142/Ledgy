# Story 5.3: Conflict Detection & Diff Guard Layout

Status: ready-for-dev

## Story

As a user,
I want to be explicitly warned when device syncs conflict,
So that I can prevent unintentional data loss.

## Acceptance Criteria

1. **Conflict Detection:** PouchDB revision conflicts detected when two devices edit same entry while offline. [Source: epics.md#Story 5.3]
2. **Badge Warning:** Sync Status Badge turns amber and displays conflict count when conflicts exist. [Source: epics.md#Story 5.3]
3. **Conflict List Sheet:** Clicking badge opens sheet showing all conflicted entries. [Source: epics.md#Story 5.3]
4. **Diff Guard View:** Clicking an entry opens side-by-side modal showing Local vs Remote versions. [Source: epics.md#Story 5.3]
5. **Field Highlighting:** Different fields between versions are highlighted visually. [Source: UX Design Spec]
6. **Metadata Display:** Each version shows timestamp and device name for context. [Source: UX Design Spec]

## Tasks / Subtasks

- [ ] Task 1: Conflict Detection System (AC: 1)
  - [ ] Extend `useSyncStore` to listen for PouchDB `conflict` events.
  - [ ] Store conflicted documents in sync store state.
  - [ ] Track conflict metadata (timestamps, device info).
- [ ] Task 2: Badge Conflict Display (AC: 2)
  - [ ] Extend `SyncStatusBadge` to show conflict state.
  - [ ] Display count badge overlay when conflicts > 0.
  - [ ] Change color to amber on conflict.
- [ ] Task 3: Conflict List Sheet (AC: 3)
  - [ ] Create `ConflictListSheet` component.
  - [ ] List all conflicted entries with summary (field count, timestamps).
  - [ ] Click entry opens Diff Guard modal.
- [ ] Task 4: Diff Guard Modal (AC: 4, 5, 6)
  - [ ] Create `DiffGuardModal` component in `src/features/sync/`.
  - [ ] Implement side-by-side layout: Local (left) vs Remote (right).
  - [ ] Highlight differing fields with background color.
  - [ ] Display metadata: timestamp, device name for each version.
  - [ ] Add action buttons: Accept Local, Accept Remote, Skip.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for conflict detection logic.
  - [ ] Unit tests for Diff Guard rendering.
  - [ ] Integration test: Simulate conflict → badge updates → modal opens.
  - [ ] E2E test: Full conflict resolution flow.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 5**
- You MUST be on branch `epic/epic-5` for all commits

**Conflict Document Structure:**
```typescript
interface ConflictEntry {
  entryId: string;
  localVersion: {
    data: any;
    timestamp: string;
    deviceId: string;
  };
  remoteVersion: {
    data: any;
    timestamp: string;
    deviceId: string;
  };
  conflictingFields: string[]; // Field names that differ
}
```

**PouchDB Conflict Handling:**
```typescript
// PouchDB emits 'conflict' event during replication
db.sync(remote, { live: true })
  .on('conflict', (conflict) => {
    // Store conflict for user resolution
    addConflict(conflict);
  });
```

**Diff Calculation:**
```typescript
function calculateDiff(local: any, remote: any): string[] {
  const fields = Object.keys({ ...local, ...remote });
  return fields.filter(f => local[f] !== remote[f]);
}
```

**Architecture Compliance:**
- Conflict state in `useSyncStore`
- Modal follows three-panel shell patterns
- Errors → `useErrorStore` → `<ErrorToast />`

**Code Patterns:**
- Use shadcn/ui `Dialog`, `Sheet`, `Button` components
- Tailwind for diff highlighting (e.g., `bg-amber-100`)
- Co-locate tests

### File Structure

```
src/features/sync/
├── ConflictListSheet.tsx         # NEW: Conflict list
├── ConflictListSheet.test.tsx    # NEW: Tests
├── DiffGuardModal.tsx            # NEW: Side-by-side diff modal
├── DiffGuardModal.test.tsx       # NEW: Tests
├── SyncStatusBadge.tsx           # MODIFIED: Add conflict state
└── useSyncStore.ts               # MODIFIED: Conflict tracking
```

### Testing Requirements

**Unit Tests:**
- Conflict detection captures correct metadata
- Diff calculation identifies differing fields
- `DiffGuardModal` renders both versions correctly
- Field highlighting works for all field types

**Integration Tests:**
- Simulate conflict → badge shows count
- Click badge → conflict list opens
- Click entry → diff modal opens with correct data

**E2E Tests:**
- Full conflict flow: detect → view → resolve

### Previous Story Intelligence

**From Story 5.1:**
- PouchDB replication setup
- Sync configuration

**From Story 5.2:**
- `SyncStatusBadge` component
- Sync state management

### References

- [Source: planning-artifacts/epics.md#Story 5.3]
- [Source: planning-artifacts/ux-design-specification.md#Diff Guard]
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
