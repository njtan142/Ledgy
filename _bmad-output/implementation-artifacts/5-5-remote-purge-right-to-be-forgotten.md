# Story 5.5: Remote Purge (Right to be Forgotten)

Status: ready-for-dev

## Story

As a user,
I want profile deletion to obliterate my cloud data as well,
So that no orphaned encrypted blobs are left sitting on my remote server.

## Acceptance Criteria

1. **Remote Detection:** Profile deletion process detects if remote sync endpoint is configured. [Source: epics.md#Story 5.5]
2. **Remote Deletion:** Process connects to remote endpoint and commands deletion of remote database. [Source: epics.md#Story 5.5]
3. **Offline Handling:** If remote unreachable, UI pauses and asks user: force-delete locally (leave remote intact) or wait until online. [Source: epics.md#Story 5.5]
4. **Complete Purge:** On success, both local PouchDB instance and remote instance are purged completely (NFR12). [Source: epics.md#Story 5.5]
5. **Confirmation Dialog:** Deletion requires explicit confirmation with clear warning about data loss. [Source: UX Design Spec]
6. **Error Handling:** Failed remote deletion shows clear error and offers retry or force-delete options. [Source: Architecture]

## Tasks / Subtasks

- [ ] Task 1: Remote Deletion Logic (AC: 1, 2, 4)
  - [ ] Extend `delete_profile` function in `src/lib/db.ts` to handle remote deletion.
  - [ ] Detect configured remote endpoint from profile settings.
  - [ ] Connect to remote CouchDB/Firebase and delete database.
  - [ ] Verify remote deletion successful.
- [ ] Task 2: Offline Handling (AC: 3, 6)
  - [ ] Detect network connectivity before remote deletion attempt.
  - [ ] Show dialog: "Remote unreachable - force delete locally or wait?"
  - [ ] Handle remote deletion errors gracefully.
  - [ ] Offer retry or force-delete options.
- [ ] Task 3: Confirmation Dialog (AC: 5)
  - [ ] Create `DeleteProfileDialog` component.
  - [ ] Display clear warning: "This will permanently delete ALL data (local + remote)".
  - [ ] Require explicit confirmation (type profile name to confirm).
- [ ] Task 4: Local Purge (AC: 4)
  - [ ] Destroy local PouchDB database completely.
  - [ ] Clear any cached data in IndexedDB.
  - [ ] Remove profile from `useProfileStore`.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for remote deletion logic.
  - [ ] Unit tests for offline handling.
  - [ ] Integration test: Delete profile with remote → both purged.
  - [ ] Test offline scenario: force-delete vs wait.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 5**
- You MUST be on branch `epic/epic-5` for all commits

**Remote Deletion Function:**
```typescript
async function deleteProfileWithRemote(
  profileId: string,
  remoteConfig: RemoteConfig
): Promise<void> {
  // Try remote deletion first
  try {
    await deleteRemoteDatabase(remoteConfig);
  } catch (error) {
    if (error.code === 'NETWORK_UNREACHABLE') {
      // Ask user: force delete or wait?
      const choice = await showOfflineDialog();
      if (choice === 'force-delete') {
        // Skip remote, delete local only
      } else if (choice === 'wait') {
        throw error; // Abort
      }
    }
  }

  // Delete local PouchDB
  await localDb.destroy();
}
```

**CouchDB Deletion:**
```typescript
async function deleteRemoteDatabase(config: CouchDBConfig) {
  const response = await fetch(`${config.url}/${config.database}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Basic ${btoa(`${config.username}:${config.password}`)}`
    }
  });

  if (!response.ok) {
    throw new Error('Remote deletion failed');
  }
}
```

**Architecture Compliance:**
- Profile deletion through `useProfileStore`
- Errors → `useErrorStore` → `<ErrorToast />`
- Network detection via standard APIs

**Code Patterns:**
- Use shadcn/ui `Dialog`, `Button`, `Input` components
- Clear warning messages with destructive styling
- Co-locate tests

### File Structure

```
src/features/profiles/
├── DeleteProfileDialog.tsx       # NEW: Confirmation dialog
├── DeleteProfileDialog.test.tsx  # NEW: Tests
├── useProfileStore.ts            # MODIFIED: Extend delete_profile
└── profileService.ts             # MODIFIED: Remote deletion logic
```

```
src/lib/
└── db.ts                         # MODIFIED: Add remote deletion DAL
```

### Testing Requirements

**Unit Tests:**
- Remote deletion calls correct API endpoint
- Offline dialog shows when network unreachable
- Force-delete skips remote and deletes local
- Confirmation dialog requires explicit typing

**Integration Tests:**
- Delete profile with remote → both purged
- Delete profile offline → force-delete option works
- Failed remote deletion → error shown → retry works

### Previous Story Intelligence

**From Story 2.3:**
- Profile creation/deletion patterns
- `delete_profile` function (local only)

**From Story 5.1:**
- Remote sync configuration
- CouchDB connection patterns

### References

- [Source: planning-artifacts/epics.md#Story 5.5]
- [Source: planning-artifacts/architecture.md#Right to be Forgotten]
- [Source: planning-artifacts/ux-design-specification.md#Destructive Actions]
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
