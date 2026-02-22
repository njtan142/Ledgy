# Story 4.3: Correlation & Compute Nodes

Status: ready-for-dev

## Story

As a builder,
I want to use logic nodes to calculate insights across my data,
So that I can discover hidden relationships (like caffeine's effect on sleep).

## Acceptance Criteria

1. **Correlation Node:** Node computes Pearson correlation coefficient between two numeric data streams. [Source: epics.md#Story 4.3]
2. **Arithmetic Node:** Node performs basic arithmetic (sum, average, min, max) on input arrays. [Source: epics.md#Story 4.3]
3. **Real-Time Computation:** Node result displays visually on the node itself and updates in real-time when input data changes. [Source: epics.md#Story 4.3]
4. **Web Worker Execution:** Computation happens in web workers to prevent main-thread locking. [Source: epics.md#Story 4.3]
5. **Multiple Inputs:** Nodes accept multiple input wires for multi-variable analysis. [Source: Architecture]
6. **Error Handling:** Invalid inputs (non-numeric data) display error state on node with clear message. [Source: Architecture]

## Tasks / Subtasks

- [ ] Task 1: Correlation Node Component (AC: 1, 4, 5)
  - [ ] Create `CorrelationNode` component in `src/features/nodeEditor/nodes/`.
  - [ ] Design UI: Two input ports, one output port, result display area.
  - [ ] Implement Pearson correlation calculation in web worker.
  - [ ] Handle edge cases: insufficient data, constant values, NaN.
- [ ] Task 2: Arithmetic Node Component (AC: 2, 4, 5, 6)
  - [ ] Create `ArithmeticNode` component.
  - [ ] Support operations: sum, average, min, max (configurable).
  - [ ] Implement calculations in web worker.
  - [ ] Display error state for invalid inputs.
- [ ] Task 3: Web Worker Infrastructure (AC: 4)
  - [ ] Create computation worker pool in `src/workers/`.
  - [ ] Implement message passing for compute requests.
  - [ ] Handle worker errors gracefully.
- [ ] Task 4: Real-Time Updates (AC: 3)
  - [ ] Wire node recomputation on input data changes.
  - [ ] Optimize update frequency (debounce rapid changes).
  - [ ] Display result with appropriate formatting.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for correlation calculation accuracy.
  - [ ] Unit tests for arithmetic operations.
  - [ ] Integration test: Wire nodes → verify real-time updates.
  - [ ] Performance test: Verify no main-thread blocking.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 4**
- You MUST be on branch `epic/epic-4` for all commits

**Pearson Correlation Formula:**
```typescript
function pearsonCorrelation(x: number[], y: number[]): number {
  // Returns value between -1 and 1
  // NaN if insufficient data
}
```

**Web Worker Message Structure:**
```typescript
interface ComputeRequest {
  type: 'correlation' | 'arithmetic';
  data: any;
  operation?: 'sum' | 'average' | 'min' | 'max';
}

interface ComputeResponse {
  result: number;
  error?: string;
}
```

**Node Data Structure:**
```typescript
interface CorrelationNodeData {
  result: number | null;
  error?: string;
  isComputing: boolean;
}
```

**Architecture Compliance:**
- Web workers for all heavy computation
- Errors → `useErrorStore` → `<ErrorToast />`
- React Flow node patterns from Story 4.1, 4.2

### File Structure

```
src/features/nodeEditor/
├── nodes/
│   ├── CorrelationNode.tsx       # NEW: Correlation node
│   ├── CorrelationNode.test.tsx  # NEW: Tests
│   ├── ArithmeticNode.tsx        # NEW: Arithmetic node
│   └── ArithmeticNode.test.tsx   # NEW: Tests
├── NodeEditor.tsx                # MODIFIED: Register new node types
└── useNodeStore.ts               # MODIFIED: Extend with compute state
```

```
src/workers/
├── computation.worker.ts         # NEW: Web worker for calculations
└── computation.worker.d.ts       # NEW: Type definitions
```

### Testing Requirements

**Unit Tests:**
- Pearson correlation returns correct values for known inputs
- Arithmetic operations (sum, average, min, max) accurate
- Edge cases: empty arrays, single values, NaN handling
- Error states display correctly

**Integration Tests:**
- Wire two ledger sources to correlation node → result updates
- Arithmetic node computes correctly on live data
- Web worker doesn't block main thread

### Previous Story Intelligence

**From Story 4.1:**
- React Flow canvas foundation
- Node persistence patterns

**From Story 4.2:**
- Ledger source nodes
- Port/wire system
- Type validation

### References

- [Source: planning-artifacts/epics.md#Story 4.3]
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
