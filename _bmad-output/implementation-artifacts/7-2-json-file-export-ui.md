# Story 7.2: JSON File Export UI

Status: ready-for-dev

## Story

As a user,
I want to download my project's structure as a file,
So that I can share it on Discord, GitHub, or keep my own backups.

## Acceptance Criteria

1. **Export Trigger:** "Export Template" accessible from Command Palette (`Cmd+K`) or profile menu. [Source: epics.md#Story 7.2]
2. **File Download:** Browser native file save dialog triggers (or Tauri equivalent if using desktop wrapper). [Source: epics.md#Story 7.2]
3. **File Format:** Data saved as `.ledgy.json` with visually readable, formatted JSON (NFR11). [Source: epics.md#Story 7.2]
4. **Success Confirmation:** User sees success toast confirming file was saved locally. [Source: epics.md#Story 7.2]
5. **Template Content:** Export includes all schema definitions and node graph state (no ledger entries/personal data). [Source: Story 7.1]
6. **File Naming:** Filename includes project name and date: `{project-name}-{date}.ledgy.json`. [Source: UX Design Spec]

## Tasks / Subtasks

- [ ] Task 1: Export Trigger UI (AC: 1)
  - [ ] Add "Export Template" to Command Palette (`Cmd+K` menu).
  - [ ] Add "Export Template" to profile menu dropdown.
  - [ ] Wire trigger to `export_template` function.
- [ ] Task 2: File Download Logic (AC: 2, 3, 5, 6)
  - [ ] Create `downloadTemplate` function in `src/features/templates/templateService.ts`.
  - [ ] Query schemas via `list_schemas`.
  - [ ] Query node graph from `useNodeStore`.
  - [ ] Construct template JSON object (exclude entries).
  - [ ] Format JSON with 2-space indentation.
  - [ ] Trigger browser download with correct filename.
- [ ] Task 3: Tauri Integration (AC: 2)
  - [ ] Detect if running in Tauri wrapper vs browser.
  - [ ] Use Tauri file dialog API if in desktop app.
  - [ ] Fallback to browser download if in web.
- [ ] Task 4: Success Toast (AC: 4)
  - [ ] Show success toast after download completes.
  - [ ] Include filename in toast message.
  - [ ] Auto-dismiss after 2 seconds.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for template JSON construction.
  - [ ] Unit tests for filename generation.
  - [ ] Integration test: Click export → file downloads → correct content.
  - [ ] Test in both browser and Tauri contexts.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 7**
- You MUST be on branch `epic/epic-7` for all commits
- All Epic 7 stories share this branch

**Template JSON Structure:**
```typescript
interface LedgyTemplate {
  version: string;
  exportedAt: string; // ISO 8601
  projectName: string;
  schemas: LedgerSchema[];
  nodeGraph: {
    nodes: Node[];
    edges: Edge[];
  };
  // NO ledger entries (personal data excluded)
}
```

**Download Function:**
```typescript
function downloadTemplate(template: LedgyTemplate, projectName: string) {
  const filename = `${projectName}-${new Date().toISOString().split('T')[0]}.ledgy.json`;
  const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
```

**Tauri File Dialog:**
```typescript
import { save } from '@tauri-apps/api/dialog';

async function saveWithTauri(template: LedgyTemplate) {
  const filePath = await save({
    filters: [{ name: 'Ledgy Template', extensions: ['ledgy.json'] }]
  });

  if (filePath) {
    await writeTextFile(filePath, JSON.stringify(template, null, 2));
  }
}
```

**Architecture Compliance:**
- Export through `useTemplateStore` or template service
- No personal data (entries) in export
- Errors → `useErrorStore` → `<ErrorToast />`

**Code Patterns:**
- Use shadcn/ui `Button`, `DropdownMenu` components
- Toast notifications for confirmations
- Co-locate tests

### File Structure

```
src/features/templates/
├── TemplateGallery.tsx           # MODIFIED: Add export trigger
├── templateService.ts            # MODIFIED: Add export_template function
├── templateService.test.ts       # NEW: Tests
└── useTemplateStore.ts           # NEW: Template state (if needed)
```

```
src/components/
└── CommandPalette.tsx            # MODIFIED: Add export command
```

### Testing Requirements

**Unit Tests:**
- Template JSON excludes entry data
- Template includes all schemas and node graph
- Filename generated correctly with date
- JSON formatted with 2-space indentation

**Integration Tests:**
- Click export → browser download triggers
- Downloaded file contains correct content
- Success toast displays
- Tauri file dialog works in desktop context

### Previous Story Intelligence

**From Story 7.1:**
- `export_template` function
- Template JSON schema

### References

- [Source: planning-artifacts/epics.md#Story 7.2]
- [Source: planning-artifacts/architecture.md#Template Export]
- [Source: planning-artifacts/ux-design-specification.md#Command Palette]
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
