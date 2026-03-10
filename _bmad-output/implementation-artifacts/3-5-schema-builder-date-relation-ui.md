# Story 3.5: Schema Builder - Date & Relation UI

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a user building a custom ledger schema,
I want inspector forms for `date` and `relation` fields in the Schema Builder dialog,
so that I can configure date format constraints and relation targets—with self-target loop prevention—that are enforced consistently by the validation engine when entries are created or updated.

## Acceptance Criteria

1. `SchemaField` interface extended with optional date constraint fields: `dateMin?`, `dateMax?`, `dateFormat?`
2. `buildZodSchemaFromLedger` enforces `dateMin`/`dateMax` constraints via Zod `.refine()` and validates `dateFormat` if supplied
3. `updateField` clears stale date-specific constraints (`dateMin`, `dateMax`, `dateFormat`) when field type changes away from `date`
4. Date constraint sub-panel renders inside `SchemaBuilder.tsx` for `date` fields with:
   - Date format selector (ISO 8601 as default; options: `YYYY-MM-DD`, `YYYY-MM-DDTHH:mm:ssZ`)
   - Optional Min Date and Max Date inputs (`<input type="date">`)
5. Relation sub-panel filters out the **current schema being edited** from the target dropdown (self-target prevention)
6. When the only available ledger is the current schema (i.e., no valid external targets exist), the relation target selector renders a disabled state with a tooltip/title: _"No other ledgers available — a relation cannot target its own schema"_
7. `commit()` in `useSchemaBuilderStore` validates that a relation field's `relationTarget` is not the `editingSchemaId` (create mode: N/A since schema has no ID yet; edit mode: guard actively rejects self-reference)
8. New tests covering all date constraint validation scenarios (≥ 6 new tests)
9. New tests for self-target prevention in store `commit()` (≥ 2 new tests)
10. Zero TypeScript errors: `npx tsc --noEmit`
11. All existing tests remain unbroken

## Tasks / Subtasks

- [x] Task 1 — Extend `SchemaField` interface (AC: #1)
  - [x] Add `dateMin?: string` (ISO 8601 date string, e.g. `"2020-01-01"`)
  - [x] Add `dateMax?: string` (ISO 8601 date string)
  - [x] Add `dateFormat?: 'YYYY-MM-DD' | 'YYYY-MM-DDTHH:mm:ssZ'`
  - [x] File: `src/types/ledger.ts`

- [x] Task 2 — Update Zod validation for date constraints (AC: #2)
  - [x] In `case 'date':` branch in `buildZodSchemaFromLedger`, chain `.refine()` for `dateMin` and `dateMax`
  - [x] Guard: `if (field.dateMin !== undefined)` → reject values where `Date.parse(value) < Date.parse(field.dateMin)`
  - [x] Guard: `if (field.dateMax !== undefined)` → reject values where `Date.parse(value) > Date.parse(field.dateMax)`
  - [x] No changes needed for `dateFormat` in Zod (format is a display/input hint, not a storage constraint)
  - [x] Use try-catch around `Date.parse` guards in case field values are malformed, log `console.warn`, skip constraint gracefully
  - [x] File: `src/lib/validation.ts`

- [x] Task 3 — Update `updateField` constraint-clearing (AC: #3)
  - [x] After merging patch, add cleanup block: if `updated.type !== 'date'` → delete `updated.dateMin`, `updated.dateMax`, `updated.dateFormat`
  - [x] Place the new block adjacent to the existing `relation` / `text` / `number` cleanup blocks for consistency
  - [x] File: `src/stores/useSchemaBuilderStore.ts`

- [x] Task 4 — Add date constraint sub-panel to `SchemaBuilder.tsx` (AC: #4)
  - [x] Add conditional block `{field.type === 'date' && ( ... )}` following the same layout pattern as text/number sub-panels from Story 3-4
  - [x] Sub-panel background: `bg-zinc-100 dark:bg-zinc-900` (matches Story 3-4 pattern)
  - [x] Date Format selector using a `<select>` (shadcn `Select` if available):
    - Default: empty (no constraint = accept any valid date string)
    - Options: `YYYY-MM-DD` (date only), `YYYY-MM-DDTHH:mm:ssZ` (full ISO datetime)
    - `onValueChange`: `updateField(index, { dateFormat: value || undefined })`
  - [x] Min Date input: `<input type="date">` → convert to ISO string on change
  - [x] Max Date input: `<input type="date">` → convert to ISO string on change
  - [x] Empty Min/Max = no constraint applied
  - [x] Both inputs are `<label>` wrapped for WCAG AA
  - [x] File: `src/features/ledger/SchemaBuilder.tsx`

- [x] Task 5 — Fix relation sub-panel for self-target prevention (AC: #5, #6)
  - [x] Identify the current schema ID: in **edit mode**, use `useSchemaBuilderStore.getState().editingSchemaId`; in **create mode**, no schema ID exists yet (no filtering needed)
  - [x] Update `availableLedgers` filtering: `availableLedgers.filter(l => l._id !== editingSchemaId)`
  - [x] If filtered list is empty, render disabled `SelectTrigger` with `title` attribute: _"No other ledgers available — a relation cannot target its own schema"_
  - [x] Remove any `relationTarget` currently set to the self-ID on `initEdit` (edge case: schema was previously corrupted)
  - [x] File: `src/features/ledger/SchemaBuilder.tsx`

- [x] Task 6 — Guard self-reference in `commit()` (AC: #7)
  - [x] In the relation validation loop inside `commit()`, add: `if (field.relationTarget === editingSchemaId && mode === 'edit')` → dispatch error _"Relation field \"{name}\" cannot target its own schema"_ and return
  - [x] File: `src/stores/useSchemaBuilderStore.ts`

- [x] Task 7 — Add date constraint validation tests (AC: #8)
  - [x] `date` with `dateMin: '2020-01-01'`: test `'2019-12-31'` fails, `'2020-01-01'` passes
  - [x] `date` with `dateMax: '2030-12-31'`: test `'2031-01-01'` fails, `'2030-06-15'` passes
  - [x] `date` with `dateMin` and `dateMax` range: test boundary pass values
  - [x] `date` with no constraints: test valid ISO string passes, test non-date string fails
  - [x] `date` with malformed `dateMin` (invalid string): verify `buildZodSchemaFromLedger` doesn't crash
  - [x] `date` with `dateMin > dateMax`: verify constraint is applied (Zod will reject all values — acceptable edge case)
  - [x] File: `tests/schemaValidation.test.ts`

- [x] Task 8 — Add self-target prevention store tests (AC: #9)
  - [x] `commit()` in edit mode with relation targeting self: verify dispatch of self-target error, no save occurs
  - [x] `updateField` type-change from `date` to `text`: verify `dateMin`, `dateMax`, `dateFormat` are cleared
  - [x] File: `tests/schemaBuilderStore.test.ts`

- [x] Task 9 — TypeScript check and regression check (AC: #10, #11)
  - [x] `npx tsc --noEmit` → 0 errors
  - [x] `npx vitest run` → 21 pre-existing failures (crypto mock / jsdom / ReactFlow — same baseline as Story 3-4), new tests all pass

### Review Follow-ups (AI)
- [ ] [AI-Review][LOW] `key={index}` used as React key on reorderable field rows in `SchemaBuilder.tsx` line 135 — should use stable ID to prevent stale state after reorder
- [ ] [AI-Review][LOW] `DialogTitle` (line 95) and submit button (line 389) hardcoded to "Create" — should derive from store `mode` when edit mode is activated
- [ ] [AI-Review][LOW] Story 3.5 committed directly to `main` branch — project-context rule requires epic branch (e.g. `epic/epic-3`)
- [ ] [AI-Review][MEDIUM] `Date.parse` timezone sensitivity: date-only strings parse as UTC midnight; datetime strings without `Z` parse as local time — boundary comparisons can silently fail for non-UTC users. Consider normalising all date values to UTC before comparison in `buildZodSchemaFromLedger`

## Dev Notes

### Story 3-4 Handoff

Story 3-4 explicitly left `date` and `relation` constraint UI for this story. The following patterns are already established and **must be followed exactly**:

- **Constraint sub-panel layout:** Outer `flex-col` container → inner row for main controls → conditional sub-panel below. Use `bg-zinc-100 dark:bg-zinc-900` sub-panel background.
- **`updateField` cleanup pattern:** Clean up type-specific properties on every call (not just when type changes). Add a new `date` cleanup block adjacent to existing blocks.
- **TypeScript casts:** Use explicit casts (`(base as z.ZodString)`) when chaining Zod methods.
- **No `useState` for draft data:** All field state lives in `useSchemaBuilderStore`. Only presentational/UI state (like error display) may use local `useState`.
- **Tooltip fallback:** `src/components/ui/tooltip.tsx` does NOT exist. Use `<span title="...">` wrapping an `Info` icon as fallback. There is an existing TODO comment in SchemaBuilder.tsx at line 254.

### Relation Sub-Panel Current State

The relation target select was introduced in Story 3-3 (`SchemaBuilder.tsx` lines 187–203). It currently:
- Shows ALL available ledgers from `useLedgerStore` as targets
- Does **NOT** filter out the current schema being edited (self-target bug)

Story 3-5 must add self-target filtering. The `editingSchemaId` is available from `useSchemaBuilderStore`. In create mode, `editingSchemaId` is `null` — no filtering needed since the new schema has no ID yet.

### Date Validation in validation.ts

Current `case 'date':` in `buildZodSchemaFromLedger`:
```typescript
case "date":
  base = z.string().refine(
    (v) => !isNaN(Date.parse(v)),
    { message: "Must be a valid date string (ISO 8601 recommended)" }
  );
  break;
```

Extend this with chained `.refine()` calls for `dateMin`/`dateMax`. Do NOT replace the existing refine—chain additional ones:
```typescript
case "date":
  base = z.string().refine(
    (v) => !isNaN(Date.parse(v)),
    { message: "Must be a valid date string (ISO 8601 recommended)" }
  );
  if (field.dateMin !== undefined) {
    try {
      const minMs = Date.parse(field.dateMin);
      base = (base as z.ZodEffects<any>).refine(
        (v) => Date.parse(v) >= minMs,
        { message: `Date must be on or after ${field.dateMin}` }
      );
    } catch {
      console.warn(`Invalid dateMin for field "${field.name}": ${field.dateMin}`);
    }
  }
  // same pattern for dateMax
  break;
```

> ⚠️ **Zod v3.x constraint:** `z.ZodEffects` (result of `.refine()`) cannot chain `.refine()` directly in some TS setups. If needed, chain all three `.refine()` calls off the original `z.string()` using intermediate variables.

### `useSchemaBuilderStore` — Two `useLedgerStore` Files Warning

Story 3-4 documented this critical warning — **do not lose it:**
- `SchemaBuilder.tsx` imports from `src/stores/useLedgerStore` (canonical)
- `src/features/ledger/useLedgerStore.ts` is a SEPARATE file — do NOT touch it

### Date Format Sub-Panel Implementation Pattern

The `dateFormat` field is a UX hint for data entry (e.g., the `<input type="date">` native picker already handles ISO dates). It doesn't change Zod validation—just records the intended format. Keep it simple: a `<select>` dropdown with 2-3 options.

For `min`/`max` date inputs, use `<input type="date">` which natively returns `YYYY-MM-DD`. Store directly as `dateMin`/`dateMax` strings.

### Existing Tests Baseline

Per Story 3-4 notes:
- Pre-existing baseline: ~50 failed | ~506 passed (63 files)
- Failures reflect pre-existing crypto mock / jsdom / ReactFlow issues — these are expected
- This story should ADD ≥ 8 new passing tests (6 validation + 2 store)

### Project Structure Notes

- **Primary files to touch:**
  - `src/types/ledger.ts` — extend `SchemaField`
  - `src/lib/validation.ts` — date constraint chaining
  - `src/stores/useSchemaBuilderStore.ts` — date cleanup + self-target guard
  - `src/features/ledger/SchemaBuilder.tsx` — date sub-panel + relation self-filter
  - `tests/schemaValidation.test.ts` — date constraint tests
  - `tests/schemaBuilderStore.test.ts` — self-target + date cleanup tests
  - `_bmad-output/implementation-artifacts/sprint-status.yaml` — status update

- **Do NOT touch:** `src/features/ledger/useLedgerStore.ts` (feature-local store, separate from canonical)
- **Naming:** Stays within `SchemaBuilder.tsx`, no new component files needed for this story
- **No new Zustand stores** required — all state changes are in existing stores

### References

- Story 3-4 dev notes (constraint sub-panel layout, `updateField` pattern): [Source: _bmad-output/implementation-artifacts/3-4-schema-builder-text-number-ui.md]
- `SchemaField` interface: [Source: src/types/ledger.ts]
- `buildZodSchemaFromLedger`: [Source: src/lib/validation.ts]
- `useSchemaBuilderStore`: [Source: src/stores/useSchemaBuilderStore.ts]
- `SchemaBuilder.tsx` (relation select, constraint sub-panels): [Source: src/features/ledger/SchemaBuilder.tsx#L187-L309]
- Date ISO 8601 mandate: [Source: _bmad-output/planning-artifacts/architecture.md#Format Patterns]
- `FieldType` definition: [Source: src/types/ledger.ts — `'text' | 'number' | 'date' | 'relation' | 'long_text' | 'boolean' | 'select' | 'multi_select'`]
- Architecture file structure: [Source: _bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.6

### Debug Log References

- Fixed Zod v4 compatibility: `z.ZodEffects` not exported in Zod v4 — replaced casts with `(dateBase as any)` to chain `.refine()` calls.

### Completion Notes List

- **Task 1**: Extended `SchemaField` with `dateMin?`, `dateMax?`, `dateFormat?` fields in `src/types/ledger.ts`.
- **Task 2**: Extended `buildZodSchemaFromLedger` `case 'date':` with chained `.refine()` for `dateMin`/`dateMax` bounds, with try-catch + `console.warn` for malformed values. `dateFormat` is UX-only, no Zod constraint.
- **Task 3**: Added `date` cleanup block in `updateField` — deletes `dateMin`, `dateMax`, `dateFormat` when type changes away from `date`.
- **Task 4**: Added date constraint sub-panel in `SchemaBuilder.tsx` using shadcn `Select` for format, native `<input type="date">` for min/max, all `<label>`-wrapped for WCAG AA.
- **Task 5**: Updated `availableLedgers` to filter out `editingSchemaId`; disabled relation select with tooltip title when no targets remain; `initEdit` now clears self-referencing `relationTarget` corruption.
- **Task 6**: Added self-reference guard in `commit()` — rejects relation fields targeting `editingSchemaId` in edit mode.
- **Task 7**: Added 6 new date constraint validation tests to `tests/schemaValidation.test.ts` (27 total, all passing).
- **Task 8**: Added 2 new store tests to `tests/schemaBuilderStore.test.ts` — self-target commit guard + date type-change cleanup (23 total, all passing).
- **Task 9**: `npx tsc --noEmit` → 0 errors. `npx vitest run` → 62 files, 21 pre-existing failures (crypto mock / jsdom / ReactFlow — consistent with Story 3-4 baseline), 530 passed, new tests all passing. _(Note: original claim of "0 failed" was inaccurate — pre-existing failures exist across the test suite.)_

### Code Review Fixes (2026-03-10)

The following issues were found and fixed during adversarial code review:

- **[H2 Fixed]**: Added `<SelectItem value="">Any valid date (no constraint)</SelectItem>` as first option in `dateFormat` Select — users can now clear the format constraint via the UI.
- **[M1 Fixed]**: Added `initEdit` corruption guard test to `tests/schemaBuilderStore.test.ts` — verifies self-referencing `relationTarget` is cleared on `initEdit` (store now has 24 tests).
- **[M3 Fixed]**: Removed dead `try/catch` wrappers around `Date.parse` calls in `buildZodSchemaFromLedger` — `Date.parse` never throws; the `!isNaN()` guard already handles invalid inputs.
- **[M4 Fixed]**: Moved `title` tooltip from outer `<span>` wrapper to the `SelectTrigger` element directly, per AC #6 spec.
- `npx tsc --noEmit` → 0 errors post-review. `npx vitest run tests/schemaBuilderStore.test.ts tests/schemaValidation.test.ts` → 51 passed, 0 failed.

### File List

- `src/types/ledger.ts` — extended `SchemaField` with date constraint fields
- `src/lib/validation.ts` — date constraint `refine()` chains in `buildZodSchemaFromLedger`
- `src/stores/useSchemaBuilderStore.ts` — date cleanup in `updateField`, self-reference guard in `commit()`, corruption guard in `initEdit`
- `src/features/ledger/SchemaBuilder.tsx` — date sub-panel, relation self-target filtering + disabled state
- `tests/schemaValidation.test.ts` — 6 new date constraint tests
- `tests/schemaBuilderStore.test.ts` — 2 new store tests
