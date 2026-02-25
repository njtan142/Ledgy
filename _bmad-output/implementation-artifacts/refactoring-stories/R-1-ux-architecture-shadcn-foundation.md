# Refactoring Story: UX Architecture & Shadcn Foundation

Status: ready-for-dev

## Story

As a developer,
I need to align the current implementation with the UX Design Specification and Architecture,
So that the application has the premium, accessible, and consistent "workbench" feel promised in the design documents.

## Acceptance Criteria

1. **Design System Integration:** Shadcn/UI and Radix UI primitives are installed and configured with the `zinc-950` base and `emerald-500` primary accent as specified in `ux-design-specification.md`.
2. **Component Migration:** The core layout shell (`AppShell.tsx`), `SchemaBuilder.tsx`, and `Dashboard.tsx` are refactored to use Shadcn components (Dialog, Select, Input, Button, Badge) replacing raw HTML elements.
3. **Command Palette (cmd+K):** A global command palette is implemented using the Shadcn `Command` component, accessible from anywhere via `cmd+K` (or `ctrl+K`), supporting basic navigation (Profiles, Projects).
4. **Data Density & Polish:** The `LedgerTable` is updated to utilize the Shadcn Table primitive, ensuring dense, readable data presentation that meets WCAG 2.1 AA contrast requirements.
5. **No Regressions:** All existing automated tests continue to pass after component migration.

## Tasks / Subtasks

- [ ] Task 1: Install & Configure Shadcn/UI
  - [ ] Initialize `components.json`.
  - [ ] Configure `tailwind.config.ts` with specified colour tokens.
  - [ ] Add base UI components: Button, Input, Select, Dialog, Badge, Command, Table.
- [ ] Task 2: Refactor Layout & Forms
  - [ ] Update `AppShell.tsx` to use polished Shadcn components for sidebar and toolbar.
  - [ ] Rewrite `SchemaBuilder.tsx` to use Shadcn Form, Input, and Select components.
- [ ] Task 3: Implement Global Command Palette
  - [ ] Create `CommandPalette.tsx` accessible via global keyboard shortcut.
  - [ ] Wire basic navigation actions to the palette.
- [ ] Task 4: Refactor Ledger Table
  - [ ] Update `LedgerTable.tsx` and `InlineEntryRow.tsx` to use Shadcn Table structure.
