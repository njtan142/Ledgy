---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-02-21T08:58:27+08:00'
inputDocuments:
  - 'planning-artifacts\prd.md'
  - 'planning-artifacts\product-brief-ledgy-2026-02-20.md'
  - 'planning-artifacts\research\domain-local-first-software-data-sovereignty-research-2026-02-20.md'
  - 'planning-artifacts\research\market-personal-tracking-tools-research-2026-02-20.md'
  - 'planning-artifacts\research\technical-ledgy-technical-core-research-2026-02-20.md'
  - 'docs\project-context.md'
workflowType: 'architecture'
project_name: 'ledgy'
user_name: 'James'
date: '2026-02-21T08:26:22'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Core Functional Requirements:**
- **Relational Ledger Engine:** Dynamic schema definition with bidirectional relational links and JSON portability.
- **Visual Scripting & Dashboard:** Node-based automation featuring Correlation Nodes and event-driven triggers.
- **Sovereign Sync:** PouchDB/CouchDB/Firebase replication with TOTP security and multi-profile isolation.

**Plugin-Delivered Features:**
- **AI-Assisted Entry:** Delivered as a first-party plugin (not core) — image analysis via Google AI Studio. Installed separately; not part of the base application.

**Non-Functional Requirements:**
- **Performance:** Extreme responsiveness (<50ms latency) and visual fluidity (60fps node graph).
- **Reliability:** Ghost Reference handling for dangling links and schema versioning for backward compatibility.
- **Security:** AES-256 client-side encryption and zero-knowledge architecture.

**Scale & Complexity:**
- **Primary domain:** Desktop App (Tauri 2.0 / Rust / React)
- **Complexity level:** Medium-High
- **Estimated architectural components:** ~5 Core (Storage, Sync, Scripting, UI Framework, Security) + Plugin System.

### Technical Constraints & Dependencies
- **Tauri 2.0:** Native shell and Rust bridge for OS-level performance.
- **Local-First Stack:** PouchDB (Local) ↔ CouchDB/Firebase (Remote).
- **Plugin system:** First-party and community plugins extend functionality without modifying core (e.g., AI Capture plugin).

### Cross-Cutting Concerns Identified
- **Data Integrity:** Ensuring relational links survive sync conflicts and entry deletions.
- **Performance Density:** Maintaining a tiny (<10MB) binary and low RAM while delivering rich visual tools.

## Starter Template Evaluation

### Primary Technology Domain
Desktop Application (Tauri 2.0 / Rust backend / React + TypeScript frontend)

### Starter Options Considered
1. **Official Tauri + React + TypeScript (Vite)** — Minimal, official, highly maintained.
2. **Tauri + React + TypeScript + Vite + Tailwind CSS** — Adds Tailwind utility-first styling for rich interactive surfaces (node editor, dashboard widgets, relational ledger views).

### Selected Starter: Tauri 2.0 + React + TypeScript + Vite + Tailwind CSS

**Rationale for Selection:**
Ledgy requires rich interactive surfaces (node editor, relational ledger views, dashboard widgets). Starting with Tailwind CSS provides production-quality UI primitives and avoids re-implementing common layout patterns.

**Initialization Command:**
```bash
npm create tauri-app@latest ledgy -- --template react-ts
# then: npm install tailwindcss @tailwindcss/vite
```

**Architectural Decisions Provided by Starter:**
- **Language & Runtime:** TypeScript (strict mode), Rust (Tauri backend)
- **Build Tooling:** Vite (fast HMR, optimized production build)
- **Styling:** Tailwind CSS utility-first
- **Testing Framework:** Vitest (Vite-native) for unit, Playwright for E2E
- **Code Organization:** `src/` (React components), `src-tauri/` (Rust commands)
- **Dev Experience:** Hot Module Replacement, Tauri DevTools, Rust auto-compile

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Local database: PouchDB
- Remote sync: CouchDB (self-hosted) + Firebase Firestore
- Conflict strategy: Last-Write-Wins + Manual Override UI
- Encryption: AES-256 (key derived from TOTP secret via HKDF)
- State management: Zustand
- Node Editor: React Flow (`@xyflow/react`)

**Important Decisions (Shape Architecture):**
- Auth: TOTP only (Google Authenticator); no email/password
- Tauri Commands replace REST — all OS/FS operations via Rust
- Data integrity: Ghost References (soft-delete for dangling links)
- Schema versioning: `schema_version` field on every document

**Deferred Decisions (Post-MVP):**
- On-device AI (Gemini Nano) — first-party AI plugin upgrade after MVP
- Public marketplace/plugin discovery
- Multi-user / shared projects

### Data Architecture

| Decision | Choice | Rationale |
|---|---|---|
| **Local DB** | PouchDB | Runs natively in Tauri's WebView; built-in CouchDB replication protocol |
| **Remote Sync** | CouchDB / Firebase Firestore | User self-hosted on GCE free tier; Firebase as fallback |
| **Conflict Resolution** | Last-Write-Wins (LWW) | Device with latest timestamp wins automatically; user can always override via Diff UI |
| **Data Portability** | Standardized JSON export/import | Full data sovereignty; no platform lock-in |
| **Relational Integrity** | Ghost References (soft-delete) | Prevents broken links when remote entries are deleted before local sync |
| **Schema Evolution** | `schema_version` field per document | Enables JIT migrations without breaking existing entries |

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| **Auth method** | TOTP (RFC 6238) via Google Authenticator | No email/password; lightweight single-user security |
| **Encryption** | AES-256-GCM client-side | All data encrypted before leaving the device |
| **Key derivation** | HKDF derived from TOTP secret | Key is tied to the TOTP seed; no separate password required |
| **Telemetry** | Zero mandatory | No background pings, no analytics |
| **Remote encryption** | Zero-knowledge | Remote CouchDB receives only ciphertext |

### Tauri Commands (API Layer)

All backend logic is exposed via **Tauri Commands** (`#[tauri::command]` in Rust). This replaces REST/GraphQL entirely for local operations. The frontend React layer communicates exclusively through `invoke()`.

| Command Category | Examples |
|---|---|
| **Profile management** | `create_profile`, `delete_profile`, `list_profiles` |
| **Ledger CRUD** | `create_entry`, `update_entry`, `delete_entry` |
| **Sync** | `trigger_sync`, `get_sync_status`, `resolve_conflict` |
| **Security** | `verify_totp`, `encrypt_payload`, `decrypt_payload` |
| **Plugin runtime** | `load_plugin`, `invoke_plugin_command` |

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| **Framework** | React 19 + TypeScript (strict) | Confirmed by PRD and starter |
| **Build** | Vite | Fast HMR, Tauri-native integration |
| **Styling** | Tailwind CSS | Utility-first, ideal for complex layouts |
| **State management** | Zustand | Lightweight global stores; React Flow-compatible; single unified state paradigm |
| **Node Editor** | React Flow (`@xyflow/react`) | Industry-standard node graph UI for React; MIT license |
| **Routing** | React Router v7 | SPA routing within Tauri shell |

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| **Distribution** | Tauri built-in updater (GitHub Releases) | Pull-based, non-intrusive; open-source standard |
| **CI/CD** | GitHub Actions | Multi-platform binary builds (Win/Mac/Linux) |
| **Remote hosting** | User self-managed GCE free tier | Zero-cost for the user; maximum data control |
| **Binary target** | `< 10MB` installation package | PRD hard requirement |

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffold (Tauri + React + TS + Vite + Tailwind)
2. PouchDB integration + schema definition layer
3. TOTP auth + HKDF key derivation
4. Relational Ledger CRUD (Ghost References, schema_version)
5. Zustand global state design (Profile → Project → Ledger tree)
6. React Flow node editor (Correlation Nodes, triggers)
7. PouchDB ↔ CouchDB sync + LWW conflict resolution + Diff UI
8. Plugin runtime (load_plugin, invoke_plugin_command)
9. Tauri updater + GitHub Actions CI/CD pipeline

**Cross-Component Dependencies:**
- Encryption must be initialized before *any* PouchDB write
- TOTP verification gates access to the Zustand profile store
- React Flow state requires Zustand stores for node persistence
- Sync layer depends on encryption being stable
- Plugin runtime depends on the core ledger engine being stable

### Plugin Architecture

AI Capture and other non-core capabilities are delivered via Ledgy's **Plugin System**. Plugins are isolated from the core engine.

| Attribute | Detail |
|---|---|
| **Plugin types** | Project-scoped (bound to one project) and Global/Nodal (cross-project) |
| **First-party plugins** | AI Capture (Google AI Studio), shipped separately from the core binary |
| **Plugin API** | Plugins interact with core via the Plugin Runtime Tauri commands (`load_plugin`, `invoke_plugin_command`) |
| **Isolation** | Plugins cannot access PouchDB directly — all data reads/writes go through the core ledger API |
| **AI Capture plugin** | On activation, the plugin exposes a Capture entry point in the UI and calls the Google AI Studio API via its own sandboxed Rust command; extracted fields are passed back as a ledger entry draft for user review and confirmation |

## Implementation Patterns & Consistency Rules

### Naming Patterns

**PouchDB Document Naming:**
- Document IDs: `{type}:{uuid}` — e.g., `entry:a1b2c3`, `profile:x9y8z7`
- Document type field: `_type` (string, always present)
- All fields: `camelCase` — e.g., `schemaVersion`, `createdAt`, `ledgerId`

**Code Naming:**
- React components: `PascalCase` files & exports — e.g., `LedgerEntry.tsx`, `NodeEditor.tsx`
- Hooks: `useCamelCase` — e.g., `useActiveProfile.ts`, `useLedgerEntries.ts`
- Tauri commands (Rust): `snake_case` — e.g., `create_entry`, `trigger_sync`
- Zustand stores: `use{Domain}Store` — e.g., `useProfileStore`, `useLedgerStore`
- Tauri `invoke()` calls: match Rust command name exactly

**File/Directory Naming:**
- Components: `PascalCase` — e.g., `LedgerEntry.tsx`
- Utilities/hooks: `camelCase` — e.g., `useLedgerEntries.ts`, `cryptoUtils.ts`
- Feature folders: `camelCase` — e.g., `src/features/ledger/`, `src/features/nodeEditor/`

### Structure Patterns

- Tests: Co-located with source (`MyComponent.test.tsx` next to `MyComponent.tsx`)
- Features: Feature folder contains component + hook + local store slice
- Shared: Placed in `src/components/` (UI) or `src/hooks/` or `src/lib/`

### Format Patterns

**PouchDB document envelope:**
```typescript
interface LedgyDocument {
  _id: string;           // "{type}:{uuid}"
  _rev?: string;
  _type: string;         // "entry" | "schema" | "node" | "profile"
  schema_version: number;
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
  deletedAt?: string;    // Ghost Reference soft-delete
  isDeleted?: boolean;
}
```

**Date/Time:** Always ISO 8601 strings with timezone offset. Never Unix timestamps in document fields.

**Tauri invoke response:** All Rust commands return `Result<T, String>`. Frontend catches errors via `try/catch` around `invoke()`.

### Communication Patterns

**Zustand store shape:**
```typescript
interface DomainStore {
  // State fields
  isLoading: boolean;
  error: string | null;
  // Actions co-located in store definition
}
```

**Tauri event naming:** `ledgy:{domain}:{action}` — e.g., `ledgy:sync:completed`, `ledgy:entry:created`

### Process Patterns

**Error handling:** Tauri errors → caught in `invoke()` try/catch → dispatched to error Zustand store → displayed via global `<ErrorToast />`. No ad-hoc local error state in components.

**Loading states:** Each Zustand store owns `isLoading` and `error`. No local `useState` for async loading.

**Auth gate:** All routes except `/setup` and `/unlock` wrapped in `<AuthGuard />` checking `useAuthStore().isUnlocked`.

### All AI Agents MUST:
- Use `camelCase` for all TypeScript/PouchDB field names
- Prefix PouchDB IDs with `{type}:`
- Include `schema_version`, `createdAt`, `updatedAt` on every PouchDB document
- Use ISO 8601 strings for all dates
- Use `invoke()` for all backend operations — never direct filesystem access from React
- Handle errors via the global error store pattern — not local `useState`

## Project Structure & Boundaries

### FR to Directory Mapping

| FR Category | Feature Directory |
|---|---|
| Relational Ledger Engine (FR1–4) | `src/features/ledger/` |
| Visual Scripting & Dashboard (FR5–8) | `src/features/nodeEditor/`, `src/features/dashboard/` |
| Sync + Conflict UI (FR12–13) | `src/features/sync/` |
| Auth + Security (FR14) | `src/features/auth/` |
| Profiles + Templates (FR15–16) | `src/features/profiles/`, `src/features/templates/` |
| Plugin system (AI Capture etc.) | `src/plugins/`, `src-tauri/src/plugins/` |

### Complete Project Directory Structure

```
ledgy/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── .gitignore
├── .github/
│   └── workflows/
│       └── build.yml              # GitHub Actions: Win/Mac/Linux binaries
│
├── src/                           # React + TypeScript frontend
│   ├── main.tsx                   # Tauri WebView entry point
│   ├── App.tsx                    # Root router + AuthGuard
│   ├── index.css                  # Tailwind base imports
│   │
│   ├── features/
│   │   ├── auth/                  # TOTP unlock flow
│   │   │   ├── AuthGuard.tsx
│   │   │   ├── UnlockPage.tsx
│   │   │   └── useAuthStore.ts
│   │   ├── profiles/              # Profile management (FR15)
│   │   │   ├── ProfileSelector.tsx
│   │   │   ├── useProfileStore.ts
│   │   │   └── profileService.ts
│   │   ├── ledger/                # Relational Ledger Engine (FR1–4)
│   │   │   ├── LedgerTable.tsx
│   │   │   ├── EntryForm.tsx
│   │   │   ├── SchemaBuilder.tsx
│   │   │   ├── useLedgerStore.ts
│   │   │   └── ledgerService.ts
│   │   ├── nodeEditor/            # Visual Scripting (FR5–7)
│   │   │   ├── NodeEditor.tsx
│   │   │   ├── nodes/
│   │   │   │   ├── CorrelationNode.tsx
│   │   │   │   ├── TriggerNode.tsx
│   │   │   │   └── ArithmeticNode.tsx
│   │   │   ├── useNodeStore.ts
│   │   │   └── nodeService.ts
│   │   ├── dashboard/             # Dashboard widgets (FR8)
│   │   │   ├── Dashboard.tsx
│   │   │   ├── widgets/
│   │   │   │   ├── ChartWidget.tsx
│   │   │   │   └── TrendWidget.tsx
│   │   │   └── useDashboardStore.ts
│   │   ├── sync/                  # Sync + Conflict UI (FR12–13)
│   │   │   ├── SyncStatus.tsx
│   │   │   ├── ConflictDiffUI.tsx
│   │   │   ├── useSyncStore.ts
│   │   │   └── syncService.ts
│   │   └── templates/             # Project templates (FR16)
│   │       ├── TemplateGallery.tsx
│   │       └── templateService.ts
│   │
│   ├── plugins/                   # Plugin runtime host
│   │   ├── PluginManager.tsx      # Loads + mounts active plugins
│   │   ├── usePluginStore.ts
│   │   └── pluginService.ts       # invoke('load_plugin', ...)
│   │
│   ├── components/                # Shared UI only
│   │   ├── ErrorToast.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── ui/
│   │
│   ├── stores/
│   │   └── useErrorStore.ts       # Global error state
│   │
│   ├── lib/
│   │   ├── pouchdb.ts             # PouchDB init + helpers
│   │   ├── crypto.ts              # HKDF + AES-256-GCM utils
│   │   ├── totp.ts                # TOTP verification helpers
│   │   └── invoke.ts              # Typed invoke() wrappers
│   │
│   ├── hooks/
│   │   └── useToast.ts
│   │
│   └── types/
│       ├── documents.ts           # LedgyDocument base interface
│       ├── nodeEditor.ts          # React Flow NodeData types
│       └── ledger.ts
│
└── src-tauri/
    ├── Cargo.toml
    ├── tauri.conf.json
    └── src/
        ├── main.rs
        ├── commands/
        │   ├── mod.rs
        │   ├── profiles.rs        # create_profile, delete_profile
        │   ├── ledger.rs          # create_entry, update_entry
        │   ├── sync.rs            # trigger_sync, resolve_conflict
        │   ├── security.rs        # verify_totp, encrypt_payload
        │   └── plugins.rs         # load_plugin, invoke_plugin_command
        ├── plugins/               # Plugin runtime sandboxing
        │   └── mod.rs
        ├── db/                    # PouchDB sync bridge
        │   └── mod.rs
        └── security/              # TOTP + HKDF + AES-GCM
            └── mod.rs
```

### Architectural Boundaries

**Frontend → Backend:** Exclusively via `invoke()` in `src/lib/invoke.ts`. No direct filesystem or OS access from React.

**Feature isolation:** Each `src/features/{name}/` is self-contained. Cross-feature communication goes through Zustand stores only.

**Plugin isolation:** Plugins in `src/plugins/` and `src-tauri/src/plugins/` cannot access PouchDB directly. All data I/O goes through the core ledger API commands.

**Data Flow:**
```
User Action → React Component → invoke() → Rust Command → PouchDB → (Optional) CouchDB Sync → Zustand store update → React re-render
```

**External Integrations:**
- **CouchDB/Firebase:** Managed via PouchDB replication in `src-tauri/src/db/`
- **Google AI Studio (via plugin):** Called from the AI Capture plugin's own sandboxed Rust command, not from core

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** All technology choices are compatible. Tauri 2.0 + React + Vite is the canonical desktop web stack. PouchDB runs natively in Tauri's WebView. Zustand integrates with React Flow without conflict. HKDF is a standard KDF compatible with any AES-256-GCM implementation.

**Pattern Consistency:** Naming conventions (`camelCase` fields, `PascalCase` components, `snake_case` Rust commands) are consistent and non-overlapping. The `invoke()` boundary cleanly separates frontend from backend.

**Structure Alignment:** The project structure directly maps to the feature-first pattern. Plugin isolation via `src/plugins/` and `src-tauri/src/plugins/` is architecturally coherent with the core ledger API-only access rule.

### Requirements Coverage Validation ✅

| FR | Requirement | Architectural Support |
|---|---|---|
| FR1–2 | Schema + CRUD | `src/features/ledger/` + `ledger.rs` |
| FR3 | Bidirectional links | PouchDB document model + Ghost References |
| FR4 | JSON export/import | `src/features/templates/` + ledger commands |
| FR5–7 | Node editor + triggers | `src/features/nodeEditor/` + React Flow |
| FR8 | Dashboard widgets | `src/features/dashboard/` |
| FR9–11 | AI Capture | AI Capture **plugin** (isolated, not core) |
| FR12–13 | Sync + Conflict Diff | `src/features/sync/` + `sync.rs` |
| FR14 | TOTP + AES encryption | `src/features/auth/` + `security.rs` |
| FR15 | Multi-profile | `src/features/profiles/` + `profiles.rs` |
| FR16 | Templates | `src/features/templates/` |

**Non-Functional Requirements:**

| NFR | Coverage |
|---|---|
| <50ms latency | Tauri local commands; no network on reads |
| 60fps node editor | React Flow + Zustand fine-grained re-renders |
| <10MB binary | No embedded AI runtime; plugins are external |
| AES-256 + zero-knowledge | `security.rs` HKDF + AES-256-GCM |
| Ghost References | `schema_version` + `isDeleted` on all docs |

### Implementation Readiness Validation ✅

- All critical decisions documented with rationale ✅
- Project structure is specific and complete ✅
- Implementation patterns cover naming, structure, format, communication, and error handling ✅
- FR-to-directory mapping is explicit ✅

### Gap Analysis Results

| Priority | Gap | Impact |
|---|---|---|
| **Low** | No UX Design document | Component-level UX decisions deferred to implementation; mitigated by Tailwind + clear boundaries |
| **Low** | Plugin API contract not fully specified | Details to be fleshed out in a dedicated plugin implementation epic |

Both gaps are **non-blocking for MVP implementation**.

### Architecture Completeness Checklist

**✅ Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**
- [x] Critical decisions documented with rationale
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Plugin architecture defined

**✅ Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] FR-to-directory mapping complete

### Architecture Readiness Assessment

**Overall Status: 🟢 READY FOR IMPLEMENTATION**

**Confidence Level: High**

**Key Strengths:**
- Local-first architecture guarantees full data sovereignty and offline-first reliability
- Plugin system cleanly isolates AI and future capabilities from a lean core binary
- Tauri + PouchDB + Zustand + React Flow is a proven, mutually-compatible stack
- Feature-first directory structure allows AI agents to work on features independently without conflicts

**Areas for Future Enhancement:**
- UX Design document (recommend running `/create-ux-design` before heavy frontend work)
- Plugin API contract specification (epic-level detail)
- Gemini Nano migration path (post-MVP)

### Implementation Handoff

**All AI Agents MUST reference this document for:**
- All naming, file, and directory decisions
- Data format and API patterns
- Error handling and loading state patterns
- Feature-to-directory mapping

**First Implementation Priority:**
```bash
npm create tauri-app@latest ledgy -- --template react-ts
# then: npm install tailwindcss @tailwindcss/vite
```
