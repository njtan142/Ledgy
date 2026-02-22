# Story 4.5: Dashboard Widgets

Status: ready-for-dev

## Story

As a user,
I want to pipe my node computations into visual widgets,
So that I have a glanceable dashboard of my most important metrics.

## Acceptance Criteria

1. **Dashboard Output Node:** User can connect a computation node to a "Dashboard Output Node" to publish results. [Source: epics.md#Story 4.5]
2. **Widget Types:** Dashboard displays widgets: Chart (line/bar), Trend Indicator (up/down arrow), Text Value (large number). [Source: epics.md#Story 4.5]
3. **Live Updates:** Widgets dynamically update instantly when underlying ledger data changes. [Source: epics.md#Story 4.5]
4. **Flexible Layout:** User can arrange widgets on a CSS grid layout. [Source: epics.md#Story 4.5]
5. **Layout Persistence:** Widget positions and configurations persist across sessions. [Source: epics.md#Story 4.5]
6. **60fps Performance:** Dashboard renders smoothly without lag (NFR2). [Source: NFR2]

## Tasks / Subtasks

- [ ] Task 1: Dashboard Output Node (AC: 1)
  - [ ] Create `DashboardOutputNode` component in `src/features/nodeEditor/nodes/`.
  - [ ] Add input port for data connection.
  - [ ] Configure widget type (Chart/Trend/Text) and title.
  - [ ] Wire output to dashboard widget registry.
- [ ] Task 2: Dashboard View Component (AC: 2, 3, 4)
  - [ ] Create `Dashboard` view component in `src/features/dashboard/`.
  - [ ] Implement CSS grid layout with draggable widgets.
  - [ ] Create widget components: `ChartWidget`, `TrendWidget`, `TextWidget`.
  - [ ] Wire widgets to node computation results via `useNodeStore`.
- [ ] Task 3: Layout Persistence (AC: 5)
  - [ ] Save widget positions/configs to PouchDB via `save_dashboard_layout`.
  - [ ] Load layout on dashboard mount.
  - [ ] Handle layout conflicts gracefully.
- [ ] Task 4: Performance Optimization (AC: 6)
  - [ ] Use `React.memo()` on widgets to prevent unnecessary re-renders.
  - [ ] Debounce rapid data changes.
  - [ ] Profile dashboard with 10+ widgets.
- [ ] Task 5: Testing & Integration
  - [ ] Unit tests for widget rendering.
  - [ ] Unit tests for layout persistence.
  - [ ] Integration test: Connect node → widget displays → updates on data change.
  - [ ] Performance test: Verify smooth rendering.

## Dev Notes

### Technical Requirements

**CRITICAL: Use existing git branch for Epic 4**
- You MUST be on branch `epic/epic-4` for all commits

**Dashboard Output Node Data:**
```typescript
interface DashboardOutputNodeData {
  widgetType: 'chart' | 'trend' | 'text';
  title: string;
  widgetId: string;
  inputPort: any; // Connected data
}
```

**Widget Configuration:**
```typescript
interface WidgetConfig {
  id: string;
  type: 'chart' | 'trend' | 'text';
  title: string;
  position: { x: number; y: number; w: number; h: number };
  nodeId: string; // Source node
  dataKey?: string; // Specific data field
}
```

**Chart Widget Options:**
- Use lightweight charting library (e.g., `recharts` or `chart.js`)
- Support line and bar chart types
- Auto-scale axes

**Architecture Compliance:**
- Widget data from `useNodeStore`
- Layout persistence via PouchDB
- Errors → `useErrorStore` → `<ErrorToast />`

**Code Patterns:**
- Follow feature-first structure
- Use shadcn/ui for base components
- Co-locate tests

### File Structure

```
src/features/dashboard/
├── Dashboard.tsx                 # MODIFIED: Full dashboard implementation
├── Dashboard.test.tsx            # MODIFIED: Updated tests
├── widgets/
│   ├── ChartWidget.tsx           # NEW: Chart visualization
│   ├── TrendWidget.tsx           # NEW: Trend indicator
│   ├── TextWidget.tsx            # NEW: Large text value
│   └── index.ts                  # NEW: Widget exports
└── useDashboardStore.ts          # NEW: Dashboard state
```

```
src/features/nodeEditor/nodes/
└── DashboardOutputNode.tsx       # NEW: Output node
```

### Testing Requirements

**Unit Tests:**
- `ChartWidget` renders chart with correct data
- `TrendWidget` shows correct direction (up/down)
- `TextWidget` formats value correctly
- Layout saves and loads correctly

**Integration Tests:**
- Connect computation node → dashboard widget displays result
- Widget updates when source data changes
- Layout persists across page reload

**Performance Tests:**
- Dashboard maintains 60fps with 10+ widgets

### Previous Story Intelligence

**From Story 4.1:**
- React Flow canvas foundation
- Node persistence

**From Story 4.2:**
- Ledger source nodes
- Wire system

**From Story 4.3:**
- Compute nodes with real-time results

**From Story 4.4:**
- Trigger nodes for automation

### References

- [Source: planning-artifacts/epics.md#Story 4.5]
- [Source: planning-artifacts/architecture.md#Node Editor]
- [Source: planning-artifacts/architecture.md#Dashboard]
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
