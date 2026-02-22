# Story 5.2: Sync Status Indicator Badge

Status: ready-for-dev

## Story

As a user,
I want to see a persistent sync status badge,
So that I always know if my data is safely backed up or pending.

## Acceptance Criteria

1. **Five Sync States:** Badge displays states: `synced` (emerald, static), `syncing` (pulsing animation), `pending` (amber), `offline` (zinc), `conflict` (amber + count badge). [Source: epics.md#Story 5.2]
2. **Global Placement:** Sync badge visible in three-panel shell header/toolbar at all times. [Source: UX Design Spec]
3. **Hover Tooltip:** Hovering shows tooltip with last successful sync timestamp. [Source: epics.md#Story 5.2]
4. **ARIA Live Regions:** Screen readers announce critical sync state changes. [Source: epics.md#Story 5.2]
5. **Real-Time Updates:** Badge updates immediately when replication state changes. [Source: epics.md#Story 5.2]
6. **Click to Expand:** Clicking badge opens sync status sheet with detailed information. [Source: UX Design Spec]

## Tasks / Subtasks

- [ ] Task 1: Sync Status Badge Component (AC: 1, 2, 3, 5)
  - [ ] Create `SyncStatusBadge` component in `src/features/sync/`.
  - [ ] Implement five state styles with Tailwind (emerald, amber, zinc colors).
  - [ ] Add pulsing animation for `syncing` state (CSS keyframes).
  - [ ] Add hover tooltip with last sync timestamp.
  - [ ] Wire to `useSyncStore` for real-time updates.
- [ ] Task 2: ARIA Accessibility (AC: 4)
  - [ ] Add `role="status"` and `aria-live="polite"` to badge.
  - [ ] Announce state changes with descriptive messages.
  - [ ] Test with screen reader (NVDA/JAWS or VoiceOver).
- [ ] Task 3: Sync Sheet Integration (AC: 6)
  - [ ] Create `SyncStatusSheet` component for detailed view.
  - [ ] Display: last sync time, pending changes count, conflict count.
  - [ ] Wire badge click to open sheet.
- [ ] Task 4: Store Integration (AC: 5)
  - [ ] Extend `useSyncStore` with sync state management.
  - [ ] Emit state changes on PouchDB replication events.
  - [ ] Handle network online/offline detection.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for each sync state rendering.
  - [ ] Unit tests for ARIA announcements.
  - [ ] Integration test: Simulate sync events → badge updates.
  - [ ] Accessibility audit with axe-core.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 5**
- You MUST be on branch `epic/epic-5` for all commits
- All Epic 5 stories share this branch

**Sync State Enum:**
```typescript
type SyncState = 'synced' | 'syncing' | 'pending' | 'offline' | 'conflict';

interface SyncStatus {
  state: SyncState;
  lastSyncTime?: string; // ISO 8601
  pendingChanges: number;
  conflictCount: number;
  errorMessage?: string;
}
```

**ARIA Live Region:**
```tsx
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {syncMessage}
</div>
```

**PouchDB Replication Events:**
```typescript
db.sync(remote, {
  live: true,
  retry: true
})
.on('change', () => setState('syncing'))
.on('complete', () => setState('synced'))
.on('error', () => setState('offline'))
.on('conflict', () => incrementConflicts());
```

**Architecture Compliance:**
- Sync state in `useSyncStore`
- Errors → `useErrorStore` → `<ErrorToast />`
- Follow three-panel shell layout from Story 1.4

**Code Patterns:**
- Use shadcn/ui `Badge`, `Tooltip` components
- Tailwind for styling with CSS custom animations
- Co-locate tests

### File Structure

```
src/features/sync/
├── SyncStatusBadge.tsx           # NEW: Main badge component
├── SyncStatusBadge.test.tsx      # NEW: Tests
├── SyncStatusSheet.tsx           # NEW: Detailed sync sheet
├── SyncStatusSheet.test.tsx      # NEW: Tests
└── useSyncStore.ts               # NEW: Sync state management
```

```
src/components/
└── ErrorToast.tsx                # EXISTING: For error display
```

### Testing Requirements

**Unit Tests:**
- Badge renders correct color/icon for each state
- Tooltip shows correct last sync time
- ARIA live region announces state changes
- Click opens sync sheet

**Integration Tests:**
- Simulate PouchDB replication events → badge updates
- Network offline → badge shows offline state
- Conflict detected → badge shows count

**Accessibility Tests:**
- axe-core audit passes
- Screen reader announces state changes correctly
- Keyboard navigation works

### Previous Story Intelligence

**From Story 5.1:**
- PouchDB replication setup
- Sync configuration patterns

### References

- [Source: planning-artifacts/epics.md#Story 5.2]
- [Source: planning-artifacts/ux-design-specification.md#Sync Status Badge]
- [Source: planning-artifacts/architecture.md#Sync Layer]
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
