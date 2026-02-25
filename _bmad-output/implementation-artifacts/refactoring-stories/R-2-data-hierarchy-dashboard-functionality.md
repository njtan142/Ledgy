# Refactoring Story: Data Hierarchy & Dashboard Functionality

Status: ready-for-dev

## Story

As a developer,
I need to fix the data model scoping and implement a truly flexible dashboard,
So that users can build multiple isolated projects within their profiles and arrange their widgets visually as designed.

## Acceptance Criteria

1. **Project Scope Enforcement:** All Node Editor canvases and Dashboard layouts are explicitly scoped to a `projectId`, rather than saving as a single generic `'default'` entity directly under the `profileId`.
2. **Flexible Widget Grid (Draggable):** The Dashboard Grid supports dragging and dropping widgets to rearrange them, updating and persisting their `{ x, y, w, h }` position configuration via an interactive library like `react-grid-layout`.
3. **Data Translation Layer:** The Node Engine produces structured data (e.g., trend analysis, array histories) that the `DashboardOutputNode` passes to the `useDashboardStore`, enabling Chart and Trend widgets to render actual visualization data, not just single numeric results.
4. **Widget Configuration UI:** A "Widget Settings" panel allows users to modify a widget's title, type, and source node mapping directly from the Dashboard view without returning to the Node Editor.
5. **No Regressions:** All existing automated tests continue to pass after data model and layout updates.

## Tasks / Subtasks

- [ ] Task 1: Refactor `useNodeStore` & `useDashboardStore`
  - [ ] Add `projectId` parameters to `loadCanvas`, `saveCanvas`, `fetchWidgets`, and `saveWidgets`.
  - [ ] Update `App.tsx` routing and `Dashboard.tsx` parameters to correctly pass `projectId`.
- [ ] Task 2: Implement Draggable Dashboard Grid
  - [ ] Integrate `react-grid-layout` (or similar) into `DashboardView.tsx`.
  - [ ] Wire layout change events to `useDashboardStore.updateWidget` position state.
- [ ] Task 3: Build Node-to-Widget Translation Layer
  - [ ] Expand `computeCorrelation` and `computeArithmetic` output models to include historical array data or trend vectors.
  - [ ] Update `ChartWidget` and `TrendWidget` to consume and render this new structured data payload.
- [ ] Task 4: Widget Configuration UI
  - [ ] Create a `WidgetConfigSheet.tsx` (using Shadcn Sheet) triggered by a "settings" icon on each dashboard widget.
  - [ ] Allow editing title and type natively from the dashboard.
