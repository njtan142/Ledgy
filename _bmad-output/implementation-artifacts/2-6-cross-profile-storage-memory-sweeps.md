# Story 2.6: Cross-Profile Storage Memory Sweeps

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a **Ledgy user switching between profiles**,
I want **the system to forcefully drop all previous profile data from memory and UI**,
so that **there are no data leaks between my distinct life domains and no memory bloat.**

## Acceptance Criteria

1. When the `activeProfileId` changes in `useProfileStore`, the system automatically detects the change.
2. The system triggers a global memory sweep that resets all profile-specific Zustand stores (`useLedgerStore`, `useNodeStore`, `useDashboardStore`, `useSyncStore`) to their initial empty states.
3. The PouchDB instance for the previous profile is properly closed and removed from the active connection registry (already mostly implemented in `setActiveProfile`, but must verify no pending listeners remain).
4. The React UI forcefully unmounts and remounts the main application workspace to ensure any localized component state (e.g., cached React Flow nodes or open dialogs) is completely flushed.
5. If the user logs out (locks the vault), the same memory sweep occurs, ensuring no decrypted data remains in the stores.
6. **CRITICAL**: Developer MUST use the existing `main` git branch for this epic.

## Tasks / Subtasks

- [x] Task 1: Create a unified event or listener for profile switching (AC: #1, #2)
  - [x] 1.1: Implement a `clearProfileData()` action in each profile-dependent store (`useLedgerStore`, `useNodeStore`, `useDashboardStore`, `useSyncStore`).
  - [x] 1.2: Set up a global side-effect (e.g., a React `useEffect` in the layout or a Zustand store subscriber) that listens to `useProfileStore.getState().activeProfileId` changes and calls `clearProfileData` on all dependent stores.
- [x] Task 2: Implement Vault Lock data purging (AC: #5)
  - [x] 2.1: Update `useAuthStore`'s lock action to also trigger the global memory sweep and call `useProfileStore.getState().setActiveProfile(null)` and `useProfileStore.setState({ profiles: [] })`.
- [x] Task 3: Ensure React tree remounting on profile switch (AC: #4)
  - [x] 3.1: In the main `App` or `Workspace` routing component, apply `key={activeProfileId}` to the root workspace element so React throws away the old DOM tree and component states when the profile changes.
- [x] Task 4: Verify PouchDB connection closure (AC: #3)
  - [x] 4.1: Ensure `closeProfileDb` in `src/lib/db.ts` correctly cancels any active `sync` replications before closing the local DB.
- [x] Task 5: Testing Memory Sweeps
  - [x] 5.1: Write unit/integration tests verifying that when `activeProfileId` changes, `useLedgerStore` and `useNodeStore` become empty.
  - [x] 5.2: Test that locking the vault purges profile and ledger data from stores.

## Dev Notes

- **Store clearing pattern:** Each Zustand store has an initial state. Add an action like `reset: () => set(initialState)`.
- **Database closure:** `src/lib/db.ts` currently has `closeProfileDb` which calls `await profileDatabases[profileId].close()`. Ensure that `cancelSync()` is called before `close()`.
- **Keyed Remount:** React's `<div key={activeProfileId}>...</div>` is the safest way to prevent deeply nested React component state leaks.

### Project Structure Notes

- Alignment with unified project structure: `src/features/...`
- Ensure changes happen within the existing Zustand stores without converting them to Contexts.

### References

- [Source: architecture.md#Frontend Architecture](../planning-artifacts/architecture.md#Frontend-Architecture) - "Zustand global state design"
- [Source: useProfileStore.ts](../../src/stores/useProfileStore.ts) - `setActiveProfile`

## Dev Agent Record

### Agent Model Used
Antigravity/Gemini-2.5-Pro - 2026-03-07

### Debug Log References
- 

### Completion Notes List

- Comprehensive story created
- Architecture review performed for memory leak vulnerabilities
- Validated existing implementation of `closeProfileDb` and state boundaries.

**Implementation Verified (2026-03-08 — Epic 2 Retrospective):**

All tasks confirmed implemented by inspecting source code:

- Task 1 (clearProfileData actions): `useLedgerStore`, `useNodeStore`, `useDashboardStore`, `useSyncStore` all have `clearProfileData()` actions. Global `useEffect` in `src/App.tsx` (lines 34-41) subscribes to `activeProfileId` changes and calls them.
- Task 2 (Vault Lock sweep): `useAuthStore.lock()` calls `useProfileStore.getState().setActiveProfile(null)` and clears profiles array. Verified via `src/stores/memorySweeps.test.ts` integration test.
- Task 3 (React tree remount): `<ErrorBoundary key={activeProfileId || 'empty'}>` in `src/App.tsx` (line 123) wraps the entire AppShell, ensuring full React subtree remount on profile switch.
- Task 4 (PouchDB closure): `closeProfileDb` verified in `src/lib/db.ts`.
- Task 5 (Tests): `src/stores/memorySweeps.test.ts` covers both profile-switch sweep and vault-lock sweep.

Story was fully implemented but never formally closed — story file status updated from `ready-for-dev` → `done` retroactively.

### File List
- `_bmad-output/implementation-artifacts/2-6-cross-profile-storage-memory-sweeps.md` (CREATED)
- `_bmad-output/implementation-artifacts/sprint-status.yaml` (MODIFIED)
- `src/App.tsx` — MODIFIED: added memory sweep `useEffect` and `key={activeProfileId}` on ErrorBoundary
- `src/stores/useLedgerStore.ts` — MODIFIED: added `clearProfileData()` action
- `src/stores/useNodeStore.ts` — MODIFIED: added `clearProfileData()` action
- `src/stores/useDashboardStore.ts` — MODIFIED: added `clearProfileData()` action
- `src/stores/useSyncStore.ts` — MODIFIED: added `clearProfileData()` action
- `src/stores/memorySweeps.test.ts` — NEW: integration tests for memory sweep and vault lock
