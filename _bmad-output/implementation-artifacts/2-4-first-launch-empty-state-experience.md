# Story 2.4: First-Launch Empty State Experience

Status: in-progress

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a new user,
I want to see a clean welcome state when I create my first profile,
so that I understand how to begin without being overwhelmed by choice.

## Acceptance Criteria

1. **Dashboard Landing:** A freshly created profile with no ledgers lands on the main dashboard showing a helpful empty state. [Source: epics.md#Story 2.4]
2. **Onboarding Message:** The UI displays an instructional CTA: "Welcome to Ledgy! Create your first ledger to get started." [Source: epics.md#Story 2.4]
3. **Template Deferral:** The "Template Picker" logic is deferred until built-in templates are defined in a later epic. [Source: epics.md#Story 2.4]

## Tasks / Subtasks

- [ ] Task 1: Dashboard Base Page (AC: 1)
  - [ ] Implement `DashboardPage` in `src/features/dashboard/`.
  - [ ] Configure route for `/app/:profileId/` to render `DashboardPage`.
- [ ] Task 2: Empty State Component (AC: 2)
  - [ ] Create `EmptyDashboard` component with the welcome message and CTA.
  - [ ] Implement logic to detect when the ledger list is empty (for now, it will always be empty).
- [ ] Task 3: Placeholder CTA
  - [ ] The "Create your first ledger" button should be a placeholder or simple link to the (not yet implemented) Schema Builder.

## Dev Notes

- **Empty States:** Ledger empty → instructional CTA. [Source: UX Design Spec#Empty States]
- **Design System:** Use `shadcn/ui` components.
- **Breakpoints:** Ensure the dashboard shell (from Epic 1) handles the empty state correctly across all breakpoints.

### Project Structure Notes

- Dashboard logic in `src/features/dashboard/`.

### References

- [Source: planning-artifacts/epics.md#Story 2.4]
- [Source: planning-artifacts/ux-design-specification.md#Empty States]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
