# Story 7.3: JSON File Import UI

Status: ready-for-dev

## Story

As a new or returning user,
I want to load a `.ledgy.json` file when creating a new profile,
So that I can instantly adopt a complex tracking setup built by someone else.

## Acceptance Criteria

1. **Import Option:** First-Launch Template Picker includes "Import from File" option alongside built-in templates. [Source: epics.md#Story 7.3]
2. **File Input:** Selecting "Import from File" triggers browser file input dialog. [Source: epics.md#Story 7.3]
3. **Validation:** Selected `.ledgy.json` file parsed, schema version validated, structure verified. [Source: epics.md#Story 7.3]
4. **Profile Scaffolding:** Valid template creates new profile with PouchDB instance and Node Engine canvas pre-populated. [Source: epics.md#Story 7.3]
5. **Error Handling:** Invalid or corrupted JSON displays helpful inline error and aborts creation cleanly. [Source: epics.md#Story 7.3]
6. **Preview:** Before import, show template preview with schema list and node count. [Source: UX Design Spec]

## Tasks / Subtasks

- [ ] Task 1: Import from File UI (AC: 1, 2)
  - [ ] Extend Template Picker (Story 2.4) with "Import from File" card/button.
  - [ ] Add hidden file input for `.ledgy.json` files.
  - [ ] Handle file selection event.
- [ ] Task 2: File Validation (AC: 3, 5)
  - [ ] Create `validateTemplate` function in `src/features/templates/templateService.ts`.
  - [ ] Parse JSON and catch syntax errors.
  - [ ] Validate required fields: `version`, `schemas`, `nodeGraph`.
  - [ ] Validate schema version compatibility.
  - [ ] Display inline error for invalid files.
- [ ] Task 3: Template Preview (AC: 6)
  - [ ] Create `TemplatePreview` component.
  - [ ] Display: template name, schema count with names, node count.
  - [ ] Show "Confirm Import" and "Cancel" buttons.
- [ ] Task 4: Profile Scaffolding (AC: 4)
  - [ ] Create `importTemplate` function to scaffold profile.
  - [ ] Create all schemas via `create_schema`.
  - [ ] Restore node graph state in `useNodeStore`.
  - [ ] Initialize empty PouchDB for profile (no entries from template).
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for template validation.
  - [ ] Unit tests for profile scaffolding.
  - [ ] Integration test: Select file → preview → import → profile created.
  - [ ] Test error scenarios: invalid JSON, missing fields, corrupted file.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 7**
- You MUST be on branch `epic/epic-7` for all commits

**Template Validation:**
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  template?: LedgyTemplate;
}

function validateTemplate(file: File): Promise<ValidationResult> {
  try {
    const text = await file.text();
    const template = JSON.parse(text);

    const errors: string[] = [];

    if (!template.version) errors.push('Missing version field');
    if (!template.schemas || !Array.isArray(template.schemas)) {
      errors.push('Missing or invalid schemas');
    }
    if (!template.nodeGraph) errors.push('Missing nodeGraph');

    // Validate schema version compatibility
    if (template.version !== TEMPLATE_VERSION) {
      errors.push(`Incompatible version: expected ${TEMPLATE_VERSION}, got ${template.version}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      template: errors.length === 0 ? template : undefined
    };
  } catch (e) {
    return {
      isValid: false,
      errors: [`Failed to parse JSON: ${e.message}`]
    };
  }
}
```

**Profile Scaffolding:**
```typescript
async function importTemplate(
  profileId: string,
  template: LedgyTemplate
): Promise<void> {
  // Create all schemas
  for (const schema of template.schemas) {
    await create_schema({
      ...schema,
      _id: `schema:${uuid()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  // Restore node graph
  await save_node_graph(template.nodeGraph);
}
```

**Architecture Compliance:**
- Import through `useProfileStore` and `useNodeStore`
- Validation before any data writes
- Errors → `useErrorStore` → `<ErrorToast />`

**Code Patterns:**
- Use shadcn/ui `Card`, `Button`, `Alert` components
- Follow Template Picker patterns from Story 2.4
- Co-locate tests

### File Structure

```
src/features/templates/
├── TemplatePicker.tsx            # MODIFIED: Add import option
├── TemplatePreview.tsx           # NEW: Preview component
├── TemplatePreview.test.tsx      # NEW: Tests
├── templateService.ts            # MODIFIED: Add validateTemplate, importTemplate
└── templateService.test.ts       # NEW: Tests
```

```
src/features/profiles/
└── ProfileSelector.tsx           # MODIFIED: Wire template import
```

### Testing Requirements

**Unit Tests:**
- `validateTemplate` parses valid files correctly
- Validation catches missing fields
- Validation catches version mismatches
- Invalid JSON shows helpful error

**Integration Tests:**
- Select file → preview shows → confirm → profile created
- Schemas created in PouchDB
- Node graph restored on canvas
- Invalid file → error shown → import aborted

### Previous Story Intelligence

**From Story 2.4:**
- Template Picker component
- First-launch experience patterns

**From Story 7.1:**
- Template JSON structure
- `export_template` function (inverse operation)

### References

- [Source: planning-artifacts/epics.md#Story 7.3]
- [Source: planning-artifacts/architecture.md#Template Import]
- [Source: planning-artifacts/ux-design-specification.md#First-Launch Template Picker]
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
