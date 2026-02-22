# Story 6.2: AI Capture Plugin: Image Ingestion & Ephemerality

Status: ready-for-dev

## Story

As a user,
I want to paste or upload an image without worrying about bloat,
So that I can capture data quickly without filling up my hard drive.

## Acceptance Criteria

1. **Image Capture Trigger:** User can paste image (`Cmd+V`) or trigger "AI Capture" (`Cmd+Shift+A`) from anywhere in the app. [Source: epics.md#Story 6.2]
2. **Image Preview:** Ingested image displays in AI Capture modal for preview. [Source: epics.md#Story 6.2]
3. **Ephemeral Storage:** Image held in memory only - NOT saved to filesystem or PouchDB as attachment. [Source: epics.md#Story 6.2]
4. **Instant Discard:** Dismissing capture modal instantly discards image from memory. [Source: epics.md#Story 6.2]
5. **Active Ledger Context:** AI Capture automatically targets the currently active ledger schema. [Source: Architecture]
6. **Keyboard Shortcut:** Global keyboard listener captures `Cmd+Shift+A` when AI Capture plugin enabled. [Source: epics.md#Story 6.2]

## Tasks / Subtasks

- [ ] Task 1: AI Capture Modal Component (AC: 1, 2)
  - [ ] Create `AICaptureModal` component in `src/plugins/ai-capture/`.
  - [ ] Implement image preview area with drag-and-drop.
  - [ ] Add paste handler for `Cmd+V` clipboard images.
  - [ ] Display image thumbnail with file size.
- [ ] Task 2: Ephemeral Image Storage (AC: 3, 4)
  - [ ] Store image as `File` or `Blob` in component state only.
  - [ ] NO persistence to PouchDB or filesystem.
  - [ ] Clear image state on modal close/cancel.
  - [ ] Implement memory cleanup on unmount.
- [ ] Task 3: Global Keyboard Shortcut (AC: 5, 6)
  - [ ] Create `useAICaptureShortcut` hook.
  - [ ] Listen for `Cmd+Shift+A` globally.
  - [ ] Check plugin enabled state before triggering.
  - [ ] Open modal with active ledger context.
- [ ] Task 4: Active Ledger Integration (AC: 5)
  - [ ] Query `useLedgerStore` for active ledger schema.
  - [ ] Display target ledger name in modal header.
  - [ ] Validate ledger has fields before capture.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for image paste handling.
  - [ ] Unit tests for memory cleanup.
  - [ ] Integration test: Trigger modal → paste image → dismiss → memory cleared.
  - [ ] Test keyboard shortcut works globally.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 6**
- You MUST be on branch `epic/epic-6` for all commits
- All Epic 6 stories share this branch

**Plugin Isolation:**
- AI Capture is a plugin in `src/plugins/ai-capture/`
- Plugin CANNOT access PouchDB directly
- All data operations through core ledger API (`create_entry`, etc.)

**Image Storage:**
```typescript
interface AICaptureState {
  isOpen: boolean;
  image: File | null; // In-memory only
  ledgerId: string | null;
  status: 'idle' | 'extracting' | 'review' | 'complete';
}
```

**Clipboard Paste Handler:**
```typescript
function handlePaste(event: ClipboardEvent) {
  const items = event.clipboardData?.items;
  for (const item of items) {
    if (item.type.indexOf('image') !== -1) {
      const blob = item.getAsFile();
      setImage(blob);
      setOpen(true);
    }
  }
}
```

**Architecture Compliance:**
- Plugin isolated from core data layer
- Keyboard shortcut through React hook
- Errors → `useErrorStore` → `<ErrorToast />`

**Code Patterns:**
- Use shadcn/ui `Dialog`, `Button`, `Card` components
- Tailwind for styling
- Co-locate tests

### File Structure

```
src/plugins/ai-capture/
├── AICaptureModal.tsx            # NEW: Main modal component
├── AICaptureModal.test.tsx       # NEW: Tests
├── useAICaptureShortcut.ts       # NEW: Keyboard hook
├── useAICaptureShortcut.test.ts  # NEW: Tests
├── AICapturePlugin.tsx           # NEW: Plugin root component
└── manifest.json                 # NEW: Plugin manifest
```

### Testing Requirements

**Unit Tests:**
- Image paste from clipboard works correctly
- Modal renders image preview
- Memory cleanup on modal close
- Keyboard shortcut triggers modal

**Integration Tests:**
- Paste image → modal opens → dismiss → image cleared from memory
- Keyboard shortcut works when plugin enabled
- Modal shows correct active ledger

### Previous Story Intelligence

**From Story 6.1:**
- Plugin runtime structure
- Plugin manifest format
- Plugin isolation patterns

### References

- [Source: planning-artifacts/epics.md#Story 6.2]
- [Source: planning-artifacts/architecture.md#Plugin System]
- [Source: planning-artifacts/architecture.md#AI Capture Plugin]
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
