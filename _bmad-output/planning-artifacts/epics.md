---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories']
inputDocuments:
  - 'planning-artifacts/prd.md'
  - 'planning-artifacts/architecture.md'
  - 'planning-artifacts/ux-design-specification.md'
---

# ledgy - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ledgy, decomposing the requirements from the PRD, UX Design Specification, and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can define ledger schemas with custom field types (Text, Number, Date, Relation).
FR2: Users can perform CRUD operations on any ledger entry.
FR3: Users can establish bidirectional relational links between disparate ledger entries.
FR4: Users can export/import project data as standardized JSON.
FR5: Users can create automation logic via a drag-and-drop node editor.
FR6: Users can connect data points using specialized Correlation Nodes.
FR7: Users can define triggers (On-Create, On-Edit) for autonomous node execution.
FR8: Users can configure custom dashboard layouts with visualization widgets (Charts, Trends).
FR9: Users can upload/capture images for high-accuracy field extraction via Google AI Studio (AI Capture Plugin).
FR10: Users can review and edit AI-extracted data before ledger commitment (AI Capture Plugin).
FR11: System must treat images as ephemeral unless the user explicitly saves them as attachments (AI Capture Plugin).
FR12: System replicates data to user-configured CouchDB/Firebase endpoints.
FR13: Users can resolve sync conflicts via a side-by-side Diff UI.
FR14: Users can protect sensitive data via client-side AES-256 encryption and TOTP authentication.
FR15: Users can manage multiple isolated project profiles within a single installation.
FR16: Users can package project structures (Schema + Nodes) as shareable template files.

### NonFunctional Requirements

NFR1: Input Latency — Data entry fields must respond in < 50ms.
NFR2: Visual Fluidity — Node editor must maintain 60fps with 100+ active nodes during pan/zoom.
NFR3: Binary Footprint — Installation package < 10MB; idle RAM usage < 100MB.
NFR4: Data Integrity — 100% recovery rate from dangling references via Ghost Reference (soft-delete) pattern.
NFR5: Privacy — Zero mandatory telemetry; encryption must use AES-256 or equivalent.
NFR6: Offline Durability — All mutations must be written to the local PouchDB journal before confirmation to ensure zero loss on app crash.
NFR7: Accessibility — Dashboard and ledger views must target WCAG 2.1 Level AA compliance.
NFR8: Sync Performance — Cross-device data propagation in < 2 seconds on stable connections.
NFR9: Schema Versioning — Every PouchDB document must include a `schema_version` field to support backward-compatible JIT migrations.
NFR10: Ghost References — Dangling references (linked entries deleted on another device) must be handled via soft-delete to maintain relational integrity.
NFR11: Data Portability — System must support standardized JSON export/import for all projects.
NFR12: Right to be Forgotten — A "Delete Profile" action must permanently purge both local (PouchDB) and remote (CouchDB) replicas.
NFR13: Zero-Knowledge Encryption — Remote data must be encrypted client-side with user-controlled keys (HKDF-derived from TOTP secret).
NFR14: Auto-Update — Tauri's pull-based updater used for non-intrusive binary and schema updates.
NFR15: Platform Targets — Native binary support for Windows, macOS, and Linux.
NFR16: Offline First — 100% operational without internet; sync activates only on network detection + user-configured endpoint.

### Additional Requirements

#### From Architecture

- **Starter Template (Epic 1 Story 1 target):** Initialize project using `npm create tauri-app@latest ledgy -- --template react-ts` then install `tailwindcss @tailwindcss/vite`. This is the first implementation story.
- **Tech Stack:** React 19 + TypeScript (strict) for Universal Web App, Vite, Tailwind CSS, Zustand (state management), React Flow / `@xyflow/react` (node editor), React Router v7 (routing), PouchDB/IndexedDB (local DB), WebCrypto (encryption), Vitest (unit tests), Playwright (E2E tests). (Optional: Tauri 2.0 shell for native desktop wrapper).
- **Design System:** Shadcn/ui + Radix UI primitives, themed with Tailwind CSS (components copied into repo). Inter/Geist typography. JetBrains Mono for schema/IDs.
- **State Management:** Zustand stores per domain (`useProfileStore`, `useLedgerStore`, `useNodeStore`, `useSyncStore`, `useAuthStore`, `useErrorStore`). All stores include `isLoading` and `error` fields. No local `useState` for async loading.
- **Backend API Layer (Frontend Libs):** All data logic happens in `src/lib/`. Capabilities include: `create_profile`, `delete_profile`, `list_profiles`, `create_entry`, `update_entry`, `delete_entry`, `trigger_sync`, `get_sync_status`, `resolve_conflict`, `verify_totp`, `encrypt_payload`, `decrypt_payload`, `load_plugin`, `invoke_plugin_command`.
- **Feature-First Directory Structure:** `src/features/auth/`, `src/features/profiles/`, `src/features/ledger/`, `src/features/nodeEditor/`, `src/features/dashboard/`, `src/features/sync/`, `src/features/templates/`, `src/plugins/`, `src/components/`, `src/stores/`, `src/lib/`, `src/hooks/`, `src/types/`.
- **PouchDB Document Envelope:** Every document must have `_id` (`{type}:{uuid}`), `type`, `schema_version`, `createdAt` (ISO 8601), `updatedAt` (ISO 8601), and optionally `deletedAt` + `isDeleted` for Ghost References.
- **Error Handling Pattern:** Pure functions throw errors → caught in React async handlers → dispatched to `useErrorStore` → displayed via global `<ErrorToast />`. No ad-hoc local error state in components.
- **Auth Gate:** All routes except `/setup` and `/unlock` wrapped in `<AuthGuard />` checking `useAuthStore().isUnlocked`.
- **CI/CD:** GitHub Actions for multi-platform web deployments and binary builds (Windows/macOS/Linux) via GitHub Releases.
- **Plugin Isolation:** Plugins in `src/plugins/` cannot access PouchDB directly — all data I/O goes through core ledger abstractions in `src/lib/`.
- **Cross-Component Dependency Order:** Encryption must init before any PouchDB write → TOTP gates Zustand profile store → React Flow requires Zustand for node persistence → Sync layer depends on stable encryption → Plugin runtime depends on stable core ledger engine.

#### From UX Design Specification

- **Design Direction — Four Complementary Views:** (1) Data Lab (ledger table, daily entry), (2) Node Forge (node canvas, builder), (3) Diff Guard (conflict resolution sheet), (4) Command (cmd+K global palette).
- **Three-Panel Shell Layout:** Left sidebar (240px, collapsible to 48px icon rail) · Main canvas (flex) · Right inspector (280px, collapsible). Three responsive breakpoints: ≥1280px full, 1100–1279px inspector collapsed, 900–1099px both collapsible, <900px warning banner.
- **Colour Tokens:** zinc-950 base, zinc-900 surface, zinc-800 elevated, zinc-700 border, zinc-50 primary text, zinc-400 secondary text, emerald-500 brand accent + success, amber-500 warning (conflicts), red-500 destructive.
- **Component System:** Shadcn/ui base components + custom Ledger Table (Tanstack Table), Node Canvas (React Flow), Diff View Panel, AI Draft Card, Sync Status Badge (5 states), Relation Tag Chip, Schema Field Builder.
- **Keyboard-First Interaction:** `N` for new entry, `Tab`/`Enter`/`Escape` in forms, `cmd+K` global palette, `Space` to pan canvas, `R` to run canvas, `Delete` for soft-delete, `cmd+Shift+A` for AI Capture.
- **Sync Status Badge — 5 States:** `synced` (emerald, static) · `syncing` (pulsing) · `pending` (amber) · `conflict` (amber + count badge) · `offline` (zinc).
- **Draft-First Rule:** AI Capture and sync conflict actions always surface as reviewable proposals ("Draft" state) before any PouchDB write. Sheets triggered by these operations require explicit confirm/dismiss — no accidental outside-click close.
- **Empty States:** Ledger empty → instructional CTA; Node canvas empty → interactive tutorial overlay (first-node drag guide).
- **Onboarding:** First launch must show a template picker flow (not a blank canvas).
- **Accessibility:** WCAG 2.1 Level AA; axe-core automated CI checks; full keyboard navigation; ARIA roles (`role="grid"`, `role="dialog"`, `aria-live` for sync); focus ring: 2px emerald, offset-2; `prefers-reduced-motion` respected; light theme as opt-in toggle.
- **Motion:** Transitions < 150ms for data; richer animations in Node Editor canvas only. Entry commit: subtle slide-down animation. Sync badge: pulse animation during sync state.
- **Feedback Patterns:** Toasts (bottom-right, 2s auto-dismiss) for positive confirmations only. Errors appear inline. Destructive actions always require dialog confirmation.

### FR Coverage Map

| FR | Epic | Coverage |
|---|---|---|
| FR1 | E3 | Schema definition — Relational Ledger Engine |
| FR2 | E3 | CRUD operations — Relational Ledger Engine |
| FR3 | E3 | Bidirectional relations — Relational Ledger Engine |
| FR4 | E7 | JSON export/import — Template Export & Portability |
| FR5 | E4 | Node editor — Visual Scripting & Dashboard |
| FR6 | E4 | Correlation nodes — Visual Scripting & Dashboard |
| FR7 | E4 | On-Create/On-Edit triggers — Visual Scripting & Dashboard |
| FR8 | E4 | Dashboard widgets — Visual Scripting & Dashboard |
| FR9 | E6 | AI image capture — Plugin System & AI Capture |
| FR10 | E6 | AI draft review before commit — Plugin System & AI Capture |
| FR11 | E6 | Ephemeral image handling — Plugin System & AI Capture |
| FR12 | E5 | CouchDB/Firebase sync — Sync & Conflict Resolution |
| FR13 | E5 | Conflict Diff UI — Sync & Conflict Resolution |
| FR14 | E1 | TOTP auth + AES-256 encryption — App Foundation & Security |
| FR15 | E2 | Multi-profile isolation — Profiles & Project Management |
| FR16 | E7 | Template export — Template Export & Portability |

## Epic List

### Epic 1: App Foundation & Security
Users can scaffold the project, launch the universal web app, configure TOTP authentication, and securely unlock the app. Encryption is initialized before any data write. The three-panel shell, global error handling, and CI/CD pipeline are all operational.
**FRs covered:** FR14
**NFRs covered:** NFR3, NFR5, NFR13, NFR14, NFR15

### Epic 2: Profiles & Project Management
Users can create, switch between, and delete isolated project profiles within a single Ledgy installation. Each profile maintains its own separate PouchDB database. The profile selector UI and first-launch template picker onboarding flow are in place.
**FRs covered:** FR15
**NFRs covered:** NFR12

### Epic 3: Relational Ledger Engine
Users can define custom schemas with typed fields (Text, Number, Date, Relation), perform full CRUD on ledger entries, and create bidirectional relational links between entries across ledgers. The ledger table view (Data Lab) with inline editing, keyboard navigation, and the Schema Builder UI are fully operational.
**FRs covered:** FR1, FR2, FR3
**NFRs covered:** NFR1, NFR4, NFR6, NFR7, NFR9, NFR10, NFR16

### Epic 4: Visual Scripting & Dashboard
Users can open the Node Editor canvas (Node Forge), drag and wire Correlation Nodes, Arithmetic Nodes, and Trigger Nodes between ledger data sources, and view computed insights on a configurable Dashboard. The node editor runs at 60fps with 100+ active nodes.
**FRs covered:** FR5, FR6, FR7, FR8
**NFRs covered:** NFR2

### Epic 5: Sync, Conflict Resolution & Data Sovereignty
Users can configure a private CouchDB or Firebase endpoint for replication, monitor sync status via the Sync Status Badge, and resolve data conflicts using the side-by-side Diff Guard UI. Permanently deleting a profile purges all local and remote replicas.
**FRs covered:** FR12, FR13
**NFRs covered:** NFR8, NFR12, NFR13, NFR16

### Epic 6: Plugin System & AI Capture
Users can load and manage plugins via the Plugin Runtime. The default AI Capture plugin is installed, enabling users to photograph or upload an image, review the AI-extracted draft entry card, and commit or dismiss it. Images remain ephemeral unless explicitly saved.
**FRs covered:** FR9, FR10, FR11
**NFRs covered:** NFR11

### Epic 7: Template Export & Portability
Users can export any project's schema and node graph as a self-contained portable JSON file, and import such a file to recreate a project structure. Users share templates externally via their own preferred channels (Discord, GitHub, etc.) — no proprietary marketplace.
**FRs covered:** FR4, FR16
**NFRs covered:** NFR11

---

## Epic 1: App Foundation & Security

Users can scaffold the project, launch the web app, configure TOTP authentication, and securely unlock the app. Encryption is initialized before any data write. The three-panel shell, global error handling, and CI/CD pipeline are all operational.

### Story 1.1: Project Scaffold & Dev Environment

As a developer,
I want to initialize the Tauri + React + TypeScript + Vite + Tailwind CSS project from the official starter,
So that the entire team starts from a verified, buildable baseline with consistent tooling.

**Acceptance Criteria:**

**Given** a clean working directory
**When** the developer runs `npm create tauri-app@latest ledgy -- --template react-ts` then installs `tailwindcss @tailwindcss/vite`
**Then** the app compiles and launches cleanly as a standard web application responding on `localhost`
**And** it can also be optionally launched as a native Tauri window on Windows, macOS, and Linux
**And** Vitest and Playwright are configured and a sample test passes
**And** the installation package size is verified to be under 10MB

### Story 1.2: TOTP Registration & Encryption Key Derivation

As a first-time user,
I want to scan a QR code with Google Authenticator to register my TOTP secret,
So that my encryption key is derived and Ledgy is protected without a password.

**Acceptance Criteria:**

**Given** the user opens Ledgy for the first time with no existing profile
**When** they scan the generated TOTP QR code and enter the first 6-digit code to confirm setup
**Then** the TOTP secret is stored securely and an AES-256-GCM encryption key is derived via HKDF from the secret using WebCrypto
**And** the derived key is held in memory only — never written to disk in plaintext
**And** the `verify_totp` crypto utility validates the TOTP code correctly against RFC 6238
**And** zero telemetry or external pings are made during this flow

### Story 1.3: App Unlock Flow & Auth Guard

As a returning user,
I want to enter my TOTP code on the unlock screen,
So that my data is decrypted and I can access my profiles.

**Acceptance Criteria:**

**Given** Ledgy is launched with an existing TOTP registration
**When** the user enters a valid 6-digit TOTP code on the `/unlock` route
**Then** `useAuthStore().isUnlocked` is set to `true` and the user is redirected to the profile selector
**And** all routes except `/setup` and `/unlock` are wrapped in `<AuthGuard />` and redirect unauthenticated users to `/unlock`
**And** an invalid TOTP code displays an inline error message below the input field — no toast, no modal
**And** the unlock screen does not expose any profile data before successful TOTP verification

### Story 1.4: Three-Panel Shell, Routing & Global Error Handling

As a user,
I want a consistent three-panel application shell with routing,
So that I can navigate between areas of the app without disorientation.

**Acceptance Criteria:**

**Given** the user is authenticated
**When** the app renders
**Then** the three-panel shell displays: left sidebar (240px, collapsible to 48px icon rail), main canvas (flex), right inspector (280px, collapsible)
**And** React Router v7 is configured with routes for `/unlock`, `/setup`, `/profiles`, and `/app/:profileId/*`
**And** a global `<ErrorToast />` component is rendered and wired to `useErrorStore` — all async errors surface here without local `useState` error handling in components
**And** the layout responds correctly at all window-width breakpoints: ≥1280px full three-panel, 1100–1279px inspector auto-collapsed, 900–1099px both panels collapsible, <900px warning banner shown
**And** a light/dark theme toggle is wired to a CSS class on the root element, defaulting to dark mode

### Story 1.5: GitHub Actions CI/CD Pipeline

As a developer,
I want a GitHub Actions workflow that builds and releases native binaries on every tagged release,
So that distribution is automated and reproducible across all platforms.

**Acceptance Criteria:**

**Given** a git tag is pushed to `main`
**When** the GitHub Actions `build.yml` workflow runs
**Then** native Tauri binaries are produced for Windows (.msi), macOS (.dmg), and Linux (.AppImage)
**And** binaries are attached as assets to the corresponding GitHub Release
**And** each binary's installation size is verified as under 10MB within the pipeline, failing the build if exceeded

---

## Epic 2: Profiles & Project Management

Users can create, switch between, and delete isolated project profiles within a single Ledgy installation. Each profile maintains its own separate PouchDB database. The profile selector UI and first-launch template picker onboarding flow are in place.

### Story 2.1: PouchDB Initialization & Profile Data Model

As a developer,
I want each profile to have its own isolated PouchDB instance,
So that profile data is never accessible across profile boundaries.

**Acceptance Criteria:**

**Given** a new profile is created
**When** `create_profile` is invoked via `src/lib/db.ts`
**Then** a dedicated PouchDB (IndexedDB) database is initialized for that profile using the `{type}:{uuid}` ID scheme with `schema_version`, `createdAt`, `updatedAt` on all documents
**And** profiles are listed via `list_profiles` and persisted correctly across app browser sessions
**And** no profile's PouchDB instance can be accessed from another profile's context

### Story 2.2: Profile Selector UI

As a user,
I want to see all my profiles on a selector screen after unlocking,
So that I can choose which workspace to enter.

**Acceptance Criteria:**

**Given** the user successfully unlocks the app
**When** the profile selector screen renders at `/profiles`
**Then** all existing profiles are listed with their name and creation date
**And** clicking a profile sets it as active in `useProfileStore` and navigates to `/app/:profileId/`
**And** a "New Profile" button is prominently visible to create additional profiles

### Story 2.3: Create & Delete Profile

As a user,
I want to create a named profile and delete one I no longer need,
So that my tracking spaces stay organized and I can fully remove data I want gone.

**Acceptance Criteria:**

**Given** the user is on the profile selector
**When** they create a new profile with a name
**Then** a new PouchDB database is created and the profile appears in the list immediately
**And** deleting a profile requires confirmation via a dialog that clearly states: "This will permanently delete all local data for this profile"
**And** on confirm, `delete_profile` purges the local PouchDB database completely (NFR12 — right-to-be-forgotten)
**And** if the profile has a configured remote sync endpoint, the user is warned that remote data must be purged separately

### Story 2.4: First-Launch Empty State Experience

As a new user,
I want to see a clean welcome state when I create my first profile,
So that I understand how to begin without being overwhelmed by choice.

**Acceptance Criteria:**

**Given** a profile is freshly created with no ledgers
**When** the user enters the profile for the first time
**Then** they land on the main dashboard showing a helpful empty state
**And** the UI displays an instructional CTA: "Welcome to Ledgy! Create your first ledger to get started."
**And** the "Template Picker" logic is deferred until built-in templates are defined.

---

## Epic 3: Relational Ledger Engine

Users can define custom schemas with typed fields (Text, Number, Date, Relation), perform full CRUD on ledger entries, and create bidirectional relational links between entries across ledgers. The ledger table view (Data Lab) with inline editing, keyboard navigation, and the Schema Builder UI are fully operational.

### Story 3.1: Core PouchDB Ledger Abstraction (CRUD)

As a developer,
I want the foundational CRUD operations for ledgers and their entries to be robustly implemented against PouchDB,
So that the UI layers can rely on atomic, schema-validated writes without side effects.

**Acceptance Criteria:**

**Given** an authenticated session
**When** `create_ledger`, `create_entry`, `update_entry`, or `delete_entry` is invoked
**Then** the underlying JSON is strictly verified against its schema definition
**And** updates increment the PouchDB revision counter cleanly
**And** failing validations push clear error states to `useErrorStore`

### Story 3.2: Schema Builder: Base UI & Type Selection

As a user,
I want to visually configure typed fields (Text, Number, Date, Relation) for a schema,
So that my ledger structure perfectly matches the real-world data I am tracking.

**Acceptance Criteria:**

**Given** the user is viewing the Schema Builder modal
**When** they click "Add Field" and edit properties
**Then** they can specify the field's name, type, and required/optional status
**And** relations can target other existing ledgers in the same project

### Story 3.3: Schema Builder: Validation & Store Integration

As a user,
I want my schema to save reliably and update my workspace safely,
So that changing a field name doesn't corrupt my tracking history.

**Acceptance Criteria:**

**Given** the user has configured the fields for a ledger
**When** they click "Save Schema"
**Then** the system updates the schema document in PouchDB
**And** increments the `schema_version` to support JIT migrations (NFR9)
**And** `useLedgerStore` refreshes to reflect the newly persisted schema definitions

### Story 3.4: Data Lab: Tanstack Table Shell & Rendering

As a user,
I want to view my ledger in a dense data table,
So that I can see the macroscopic trends of my logged entries.

**Acceptance Criteria:**

**Given** the user is viewing a configured ledger
**When** the Data Lab view loads
**Then** Tanstack Table renders all entries correlating to the active schema definition
**And** the table columns accurately reflect the schema's field definitions

### Story 3.5: Data Lab: Keyboard-First Inline Editing

As a user,
I want to add/edit entries inline (via keyboard),
So that tracking data feels as fast as thought.

**Acceptance Criteria:**

**Given** the user is viewing the Data Lab table
**When** they press `N` or click "Add Entry"
**Then** an inline entry row appears at the top of the table (no modal dialog)
**And** the user can `Tab` between fields and press `Enter` to commit the entry to PouchDB
**And** input latency natively remains <50ms (NFR1)
**And** the table is fully keyboard navigable (`↑/↓` arrow keys) and meets WCAG 2.1 AA contrasts

### Story 3.6: Relational Links: Combobox Selection UI

As a user,
I want to link an entry in one ledger to an entry in another ledger,
So that I can capture cross-domain relationships cleanly.

**Acceptance Criteria:**

**Given** a ledger schema contains a Relation field pointing to a target ledger
**When** the user clicks the field on a row in the table
**Then** a combobox (Select) appears, allowing them to search and select an entry from the target ledger
**And** the relation displays as a visually distinct "Tag Chip" in both the source entry and as a back-link in the target entry
**And** navigating the link loads the target entry's ledger view

### Story 3.7: Relational Links: Bidirectional Sync & Ghost Reference Logic

As a user,
I want links to forcefully handle deleted entries gracefully,
So that my system doesn't crash tracking missing connections.

**Acceptance Criteria:**

**Given** Entry A has a relational link to Entry B
**When** the user deletes Entry B
**Then** Entry B is soft-deleted (`isDeleted: true`, `deletedAt: [timestamp]`) in PouchDB rather than hard-purged
**And** Entry A's relational Tag Chip updates to show a "Ghost Reference" state (e.g., greyed out text) instead of causing a UI crash
**And** restoring Entry B restores the link automatically across all devices

---

## Epic 4: Visual Scripting & Dashboard

Users can open the Node Editor canvas (Node Forge), drag and wire Correlation Nodes, Arithmetic Nodes, and Trigger Nodes between ledger data sources, and view computed insights on a configurable Dashboard. The node editor runs at 60fps with 100+ active nodes.

### Story 4.1: Node Forge: Canvas Shell & React Flow Setup

As a builder,
I want an infinite canvas to visually script my ledger logic,
So that I can drag and pan across my node automations at 60fps.

**Acceptance Criteria:**

**Given** the user navigates to the "Node Forge" view
**When** the React Flow canvas renders
**Then** the user can pan (`Space` + drag) and zoom infinitely at a smooth 60fps (NFR2)
**And** an empty canvas displays an interactive overlay guiding the first drag action
**And** node positions are decoupled strictly from Zustand to prevent re-render loops (see Epic 8)

### Story 4.2: Node Forge: Custom Node Types

As a builder,
I want specific visual node blocks for my ledgers and logic,
So that I can cleanly outline Inputs, Computations, and Outputs.

**Acceptance Criteria:**

**Given** the Node Editor is active
**When** the user drags a node from the palette onto the canvas
**Then** a custom React component represents "Ledger Source", "Correlation", "Arithmetic", or "Dashboard Output"
**And** the node safely initializes its metadata in `useNodeStore` properly

### Story 4.3: Node Forge: Edge Rules & Type Validation

As a builder,
I want the wiring to prevent logical mistakes,
So that I don't accidentally pipe text into a math node.

**Acceptance Criteria:**

**Given** the user attempts to wire output A to input B
**When** the user drags a wire
**Then** valid connections snap visually
**And** incompatible data types cannot be wired together (the connection is rejected visually and the edge drops cleanly)

### Story 4.4: Node Forge: Ledger Data Hydration Logic

As a builder,
I want my Source nodes to dynamically output real ledger values,
So that downstream computation nodes receive accurate arrays of numbers or text.

**Acceptance Criteria:**

**Given** a Ledger Source node is active on the canvas
**When** the user points it to a specific ledger schema (e.g., "Coffee Entries")
**Then** the outgoing wire receives the latest persisted values queried from PouchDB
**And** hovering over a connected wire displays a tooltip with a live data preview

### Story 4.5: Node Forge: Computation Engine Hook & Worker

As a builder,
I want complex math computations to run smoothly,
So that my canvas remains responsive.

**Acceptance Criteria:**

**Given** two Ledger Source nodes are wired into a "Correlation Node" or "Arithmetic Node"
**When** computation is requested by data hydration
**Then** the node computes the result (e.g., Pearson correlation coefficient or simple sum)
**And** computation happens gracefully preventing main-thread locking
**And** the localized output visually updates on the node body in real time

### Story 4.6: Node Forge: Autonomous Triggers (On-Create / On-Edit)

As a builder,
I want nodes that react to events,
So that my automations run in the background without manual clicks.

**Acceptance Criteria:**

**Given** the user adds a "Trigger Node" to the canvas
**When** they configure it to listen for "On-Create: Coffee Ledger"
**Then** adding a new coffee entry in the Data Lab automatically fires the trigger in the background
**And** the trigger executes any downstream wired logic
**And** infinite loops (e.g., a trigger that creates an entry that fires the same trigger) are caught and halted by a maximum execution depth limiter in the node engine, showing an error in the `<ErrorToast />`

### Story 4.7: Dashboard: Grid Layout Shell

As a user,
I want a customizable dashboard grid,
So that I can arrange my metrics perfectly.

**Acceptance Criteria:**

**Given** the user is on the Dashboard
**When** they drag and resize widget containers
**Then** the widgets layout responds fluidly using a CSS grid
**And** the layout configuration persists safely across sessions

### Story 4.8: Dashboard: Data Visualization Widgets

As a user,
I want to pipe output nodes into beautiful charts and indicators,
So that I have an at-a-glance health read of my tracked life.

**Acceptance Criteria:**

**Given** the user connects a computation node to a "Dashboard Output Node"
**When** the Dashboard view is rendered
**Then** a widget (Chart, Trend Indicator, or Text Value) is displayed showing the live output
**And** widgets dynamically update instantly when the underlying ledger data changes

---

## Epic 8: Technical Debt & System Stability

This epic tracks necessary technical refactoring to resolve architecture friction before those areas cause critical bugs, performance degradation, or delayed feature deliveries.

### Story 8.1: System Stability: Zustand & React Flow Bridge Hook

As a developer,
I want to resolve the re-render loop crashing the Node Forge by architecting a stabilized bridge,
So that we can store our node state safely in our global Zustand instance without breaking 60fps dragging and causing infinite updates.

**Acceptance Criteria:**

**Given** React Flow nodes are dragged continuously by the user
**When** they are in mid-movement
**Then** local `@xyflow/react` state handles the position natively, bypassing the global store completely during drag operations
**And** when `onNodeDragStop` fires, it explicitly dispatches the final exact coordinates to `useNodeStore` selectively
**And** all Zustand React Flow store fetches inside components are strictly wrapped in `useShallow` to prevent React from re-rendering the whole component tree unconditionally on sub-property mutations


---

## Epic 5: Sync, Conflict Resolution & Data Sovereignty

Users can configure a private CouchDB or Firebase endpoint for replication, monitor sync status via the Sync Status Badge, and resolve data conflicts using the side-by-side Diff Guard UI. Permanently deleting a profile purges all local and remote replicas.

### Story 5.1: CouchDB Remote Configuration & Sync Client

As a user,
I want to configure a remote CouchDB or Firebase endpoint,
So that my local PouchDB data securely replicates across my devices.

**Acceptance Criteria:**

**Given** the user opens the Sync Settings panel
**When** they enter a connection endpoint URL and credentials
**Then** a background PouchDB replication process initializes for the active profile
**And** replication only triggers upon network detection and valid configuration (NFR16)
**And** PouchDB documents are encrypted client-side using the derived AES-256 key before being sent to the remote (NFR13)
**And** cross-device data propagation completes in < 2 seconds on stable connections (NFR8)

### Story 5.2: Sync Status Indicator Badge

As a user,
I want to see a persistent sync status badge,
So that I always know if my data is safely backed up or pending.

**Acceptance Criteria:**

**Given** the three-panel shell is active
**When** the replication state changes
**Then** the global sync badge updates its state: `synced` (emerald, static), `syncing` (pulsing), `pending` (amber), `offline` (zinc), or `conflict` (amber + count badge)
**And** hovering over the badge shows a tooltip with the last successful sync timestamp
**And** ARIA live regions announce critical sync state changes to screen readers

### Story 5.3: Conflict Detection & Diff Guard Layout

As a user,
I want to be explicitly warned when device syncs conflict,
So that I can prevent unintentional data loss.

**Acceptance Criteria:**

**Given** PouchDB detects a document revision conflict (two devices edited the same entry while offline)
**When** the conflict occurs
**Then** the global Sync Status Badge turns amber and displays a conflict count
**And** clicking the badge opens a conflict list sheet showing all affected entries
**And** clicking an entry opens the "Diff Guard" view — a side-by-side modal displaying the Local (Desktop) vs. Remote (Mobile) versions of the entry

### Story 5.4: Conflict Resolution (Accept/Reject)

As a user,
I want to review conflicting fields side-by-side and choose which version to keep,
So that my data insurance feels firmly in my control.

**Acceptance Criteria:**

**Given** the user is viewing the Diff Guard modal for a conflicted entry
**When** they review the highlighted differences
**Then** they can click either "Accept Desktop" or "Accept Mobile"
**And** making a choice commits the winning revision to PouchDB and permanently resolves the conflict flag
**And** the user can choose to "Skip" to leave the conflict pending for later
**And** once all conflicts are resolved, the Sync Status Badge returns to `synced` (emerald)

### Story 5.5: Remote Purge (Right to be Forgotten)

As a user,
I want profile deletion to obliterate my cloud data as well,
So that no orphaned encrypted blobs are left sitting on my remote server.

**Acceptance Criteria:**

**Given** the user initiates a profile deletion from the Profile Selector
**When** the profile has an active remote sync endpoint configured
**Then** the deletion process connects to the remote endpoint and explicitly commands the deletion of the remote database (NFR12)
**And** if the remote is unreachable, the UI pauses and asks the user whether to force-delete locally (leaving remote intact) or wait until online
**And** if successful, both the local PouchDB instance and remote instance are purged completely

---

## Epic 6: Plugin System & AI Capture

Users can load and manage plugins via the Plugin Runtime. The default AI Capture plugin is installed, enabling users to photograph or paste an image, review the AI-extracted draft entry card, and commit or dismiss it. Images remain ephemeral unless explicitly saved.

### Story 6.1: Plugin Runtime & Permissions

As a developer,
I want a plugin runtime that strictly sandboxes extensions,
So that plugins cannot bypass the encryption or auth layers to interact with PouchDB directly.

**Acceptance Criteria:**

**Given** the Ledgy core is running
**When** the app initializes
**Then** the `src/plugins/` directory is scanned for valid plugin manifests (compiled statically for now until dynamic import spec is built)
**And** plugins can only interact with data via exposed global React abstractions (`create_entry`, `update_entry`, etc.)
**And** the UI provides a "Plugin Manager" panel to enable/disable installed plugins per-profile

### Story 6.2: AI Capture Plugin: Image Ingestion & Ephemerality

As a user,
I want to paste or upload an image without worrying about bloat,
So that I can capture data quickly without filling up my hard drive.

**Acceptance Criteria:**

**Given** the AI Capture plugin is enabled
**When** the user pastes an image (`Cmd+V`) or triggers "AI Capture" (`Cmd+Shift+A`)
**Then** the image is previewed in the UI and temporarily held in memory
**And** the image is NOT saved to the local filesystem or PouchDB as an attachment (FR11)
**And** dismissing the capture modal instantly discards the image from memory

### Story 6.3: AI Capture Plugin: Google AI Studio Integration

As a user,
I want Google AI to automatically extract data from my image and map it to my schema,
So that I don't have to manually type out receipts or health metrics.

**Acceptance Criteria:**

**Given** an image is ingested in the AI Capture modal
**When** the user hits "Extract"
**Then** the plugin packages the image and the active ledger's schema into a prompt
**And** connects securely to the Google AI Studio API (using a user-provided API key stored in the active profile)
**And** returns a structured JSON payload mapped precisely to the active schema's fields
**And** surfaces API errors gracefully within the modal if the extraction fails

### Story 6.4: AI Capture Plugin: Draft Review (Show Before Save)

As a user,
I want to review and correct the AI's extraction before it touches my ledger,
So that I retain absolute trust in my data integrity.

**Acceptance Criteria:**

**Given** the Google AI API returns an extracted JSON payload
**When** the AI Capture modal transitions to the "Review" state
**Then** a "Draft Entry Card" is displayed showing the extracted fields populated
**And** the user can manually edit any field on the Draft Card
**And** the data is NOT written to PouchDB yet (Draft-First Rule)
**And** clicking "Commit" writes the entry to PouchDB via the core `create_entry` API and closes the modal

---

## Epic 7: Template Export & Portability

Users can export a project's full schema and node graph as a standardized JSON file, and import a JSON file to scaffold a new project structure. (Core export functionality reframed from the old "Templates" epic).

### Story 7.1: Schema & Graph Serialization

As a developer,
I want a unified export interface,
So that both the PouchDB schema documents and the React Flow node graph are bundled into a single portable object.

**Acceptance Criteria:**

**Given** an active project profile
**When** `export_template` is invoked
**Then** the system queries PouchDB for all schema definitions and the unified node graph state
**And** it serializes them into a single `Template` JSON object confirming to a strict TypeScript schema
**And** ledger entries (personal data) are strictly excluded from this payload

### Story 7.2: JSON File Export UI

As a user,
I want to download my project's structure as a file,
So that I can share it on Discord, GitHub, or keep my own backups.

**Acceptance Criteria:**

**Given** the user is viewing their project workspace
**When** they click "Export Template" from the Command Palette or profile menu
**Then** the browser native file save dialog/download triggers (or Tauri equivalent if using the wrapper)
**And** the data is saved as a visually readable `.ledgy.json` format (NFR11)
**And** the user sees a success toast confirming the file was saved locally

### Story 7.3: JSON File Import UI

As a new or returning user,
I want to load a `.ledgy.json` file when creating a new profile,
So that I can instantly adopt a complex tracking setup built by someone else.

**Acceptance Criteria:**

**Given** the user is on the First-Launch Template Picker (from Epic 2)
**When** they select "Import from File" instead of a built-in template
**Then** the browser file input dialog appears
**And** selecting a valid `.ledgy.json` file parses the structure, validates the schema version, and scaffolds the PouchDB instance and Node Engine canvas
**And** an invalid or corrupted JSON file displays a helpful inline error and aborts the creation process cleanly
