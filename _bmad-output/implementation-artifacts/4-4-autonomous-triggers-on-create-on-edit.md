# Story 4.4: Autonomous Triggers (On-Create / On-Edit)

Status: ready-for-dev

## Story

As a builder,
I want nodes that react to events,
So that my automations run in the background without manual clicks.

## Acceptance Criteria

1. **Trigger Node Configuration:** User can add a "Trigger Node" and configure it to listen for "On-Create" or "On-Edit" events on a specific ledger. [Source: epics.md#Story 4.4]
2. **Event Detection:** Adding a new ledger entry automatically fires "On-Create" triggers for that ledger. [Source: epics.md#Story 4.4]
3. **Downstream Execution:** Trigger fires and executes any downstream wired logic automatically. [Source: epics.md#Story 4.4]
4. **Infinite Loop Prevention:** Infinite loops (trigger creates entry that fires same trigger) are caught and halted by maximum execution depth limiter. [Source: epics.md#Story 4.4]
5. **Error Display:** Loop detection shows error in `<ErrorToast />` with clear message. [Source: epics.md#Story 4.4]
6. **Background Execution:** Triggers execute without blocking UI or requiring user interaction. [Source: epics.md#Story 4.4]

## Tasks / Subtasks

- [ ] Task 1: Trigger Node Component (AC: 1)
  - [ ] Create `TriggerNode` component in `src/features/nodeEditor/nodes/`.
  - [ ] Design UI: Configuration panel for event type (On-Create/On-Edit) and ledger selection.
  - [ ] Add output port for downstream wiring.
  - [ ] Display trigger status (armed/fired/error).
- [ ] Task 2: Event Detection System (AC: 2, 3, 6)
  - [ ] Create event listener in `useLedgerStore` for entry create/edit events.
  - [ ] Match events to configured triggers by ledger ID.
  - [ ] Execute trigger node's downstream graph.
  - [ ] Run execution in background (non-blocking).
- [ ] Task 3: Infinite Loop Prevention (AC: 4, 5)
  - [ ] Implement execution depth counter (max depth: 10).
  - [ ] Track execution chain: trigger → action → trigger → ...
  - [ ] Halt execution when max depth exceeded.
  - [ ] Display error via `<ErrorToast />`: "Infinite loop detected".
- [ ] Task 4: Trigger Execution Engine (AC: 3, 6)
  - [ ] Create `executeTrigger` function to process downstream nodes.
  - [ ] Support chaining: Trigger → Compute Node → Action.
  - [ ] Handle errors gracefully at each step.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for trigger configuration.
  - [ ] Unit tests for event detection matching.
  - [ ] Integration test: Create entry → trigger fires → downstream executes.
  - [ ] Test infinite loop detection and prevention.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 4**
- You MUST be on branch `epic/epic-4` for all commits

**Trigger Node Data Structure:**
```typescript
interface TriggerNodeData {
  ledgerId: string;
  eventType: 'on-create' | 'on-edit';
  status: 'armed' | 'fired' | 'error';
  lastFired?: string;
  error?: string;
}
```

**Execution Context:**
```typescript
interface TriggerExecutionContext {
  triggerId: string;
  entryId: string;
  ledgerId: string;
  eventType: string;
  depth: number; // For loop prevention
}
```

**Loop Prevention:**
```typescript
const MAX_EXECUTION_DEPTH = 10;

function executeTrigger(context: TriggerExecutionContext) {
  if (context.depth >= MAX_EXECUTION_DEPTH) {
    throw new Error('Infinite loop detected');
  }
  // ... execute downstream
}
```

**Architecture Compliance:**
- Events through `useLedgerStore`
- Errors → `useErrorStore` → `<ErrorToast />`
- Non-blocking execution (async/await, web workers if needed)

**Code Patterns:**
- Follow React Flow node patterns from Story 4.1, 4.2, 4.3
- Use same error handling patterns
- Co-locate tests

### File Structure

```
src/features/nodeEditor/
├── nodes/
│   ├── TriggerNode.tsx           # NEW: Trigger node component
│   ├── TriggerNode.test.tsx      # NEW: Tests
│   └── index.ts                  # MODIFIED: Export
├── NodeEditor.tsx                # MODIFIED: Register trigger node
├── useNodeStore.ts               # MODIFIED: Trigger state
└── triggerEngine.ts              # NEW: Trigger execution logic
```

```
src/stores/
└── useLedgerStore.ts             # MODIFIED: Add event emission
```

### Testing Requirements

**Unit Tests:**
- Trigger node configuration saves correctly
- Event detection matches correct triggers
- Loop prevention halts at max depth
- Error messages display correctly

**Integration Tests:**
- Create entry → On-Create trigger fires → downstream executes
- Edit entry → On-Edit trigger fires
- Infinite loop: Trigger creates entry → detected → halted → error shown

### Previous Story Intelligence

**From Story 4.1:**
- React Flow canvas foundation
- Node persistence

**From Story 4.2:**
- Ledger source nodes
- Wire system

**From Story 4.3:**
- Compute nodes
- Web worker patterns

### References

- [Source: planning-artifacts/epics.md#Story 4.4]
- [Source: planning-artifacts/architecture.md#Node Editor]
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
