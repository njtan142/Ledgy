# Story 4.2: Ledger Source Nodes & Basic Wiring

Status: ready-for-dev

## Story

As a builder,
I want to drop ledger nodes onto the canvas and wire them together,
So that I can define data inputs for automations.

## Acceptance Criteria

1. **Ledger Source Node:** Dragging "Ledger Source" from palette creates a node representing a specific ledger schema. [Source: epics.md#Story 4.2]
2. **Node Configuration:** Node configuration panel allows selecting which ledger schema to source data from. [Source: epics.md#Story 4.2]
3. **Functional Wiring:** User can drag a functional wire from Source Node's output port to another node's input port. [Source: epics.md#Story 4.2]
4. **Data Preview:** Hovering over a connected wire displays a tooltip with live data preview of what is flowing through it. [Source: epics.md#Story 4.2]
5. **Type Validation:** Incompatible data types cannot be wired together (connection rejected visually). [Source: epics.md#Story 4.2]
6. **Canvas Persistence:** Node positions and connections persist to `useNodeStore` and save to PouchDB. [Source: epics.md#Story 4.1]
7. **60fps Performance:** Canvas maintains 60fps with multiple nodes and wires (NFR2). [Source: NFR2]

## Tasks / Subtasks

- [ ] Task 1: Ledger Source Node Component (AC: 1, 2)
  - [ ] Create `LedgerSourceNode` component in `src/features/nodeEditor/nodes/`.
  - [ ] Design node UI: Header (ledger name), Output ports (one per schema field).
  - [ ] Add node configuration panel for selecting ledger.
  - [ ] Populate ledger selector from `list_schemas`.
- [ ] Task 2: Port & Wire System (AC: 3, 4, 5)
  - [ ] Define port types: `text`, `number`, `date`, `relation`.
  - [ ] Implement type validation for wire connections.
  - [ ] Add visual feedback for incompatible connections (red highlight, reject).
  - [ ] Implement hover tooltip with data preview (sample of flowing data).
- [ ] Task 3: Node Store Integration (AC: 6)
  - [ ] Extend `useNodeStore` with ledger source node state.
  - [ ] Wire node/edge changes to PouchDB via `save_node_graph`.
  - [ ] Implement optimistic UI updates.
- [ ] Task 4: Performance Optimization (AC: 7)
  - [ ] Use React Flow's built-in memoization.
  - [ ] Profile canvas with 10+ nodes and wires.
  - [ ] Optimize re-renders with `React.memo()` on nodes.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for `LedgerSourceNode` rendering.
  - [ ] Unit tests for port type validation.
  - [ ] Integration test: Create node → configure ledger → wire to another node.
  - [ ] Performance test: Verify 60fps with stress test.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 4**
- You MUST be on branch `epic/epic-4` for all commits
- All Epic 4 stories share this branch

**React Flow Node Data Structure:**
```typescript
interface NodeData {
  ledgerId: string;
  label: string;
  ports: Array<{
    id: string;
    type: 'text' | 'number' | 'date' | 'relation';
    fieldName: string;
  }>;
}
```

**Edge Data Structure:**
```typescript
interface EdgeData {
  sourcePort: string;
  targetPort: string;
  dataType: string;
  sampleData?: any; // For preview tooltip
}
```

**Architecture Compliance:**
- All data through `useNodeStore`
- React Flow (`@xyflow/react`) for canvas
- Errors → `useErrorStore` → `<ErrorToast />`

**Code Patterns:**
- Follow feature-first structure
- Co-locate tests
- Use shadcn/ui for configuration panels

### File Structure

```
src/features/nodeEditor/
├── nodes/
│   ├── LedgerSourceNode.tsx      # NEW: Ledger source node
│   ├── LedgerSourceNode.test.tsx # NEW: Tests
│   └── index.ts                  # MODIFIED: Export new node
├── NodeEditor.tsx                # MODIFIED: Register new node type
├── useNodeStore.ts               # MODIFIED: Extend with ledger source state
└── nodeService.ts                # MODIFIED: Add ledger-specific functions
```

### Testing Requirements

**Unit Tests:**
- `LedgerSourceNode` renders with correct ports
- Port type validation rejects incompatible connections
- Data preview tooltip shows correct sample data

**Integration Tests:**
- Create ledger source node → configure → wire to another node
- Node persistence across page reload

**Performance Tests:**
- Canvas maintains 60fps with 10+ nodes and 20+ wires

### Previous Story Intelligence

**From Story 4.1:**
- React Flow canvas foundation
- `useNodeStore` patterns
- Node persistence to PouchDB

**From Story 3.1:**
- Schema types and queries

### References

- [Source: planning-artifacts/epics.md#Story 4.2]
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
