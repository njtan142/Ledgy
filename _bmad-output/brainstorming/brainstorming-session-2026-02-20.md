---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ['docs/project-context.md']
session_topic: 'Ledgy Architecture, Infrastructure, and Feature Requirements'
session_goals: 'Decide on architecture, infrastructure, data layer, plugin system, scripting, sync strategy, and cross-platform framework'
selected_approach: 'ai-recommended-progressive-flow'
techniques_used: ['first-principles-thinking', 'what-if-scenarios', 'morphological-analysis', 'six-thinking-hats', 'decision-tree-mapping', 'constraint-mapping']
ideas_generated: [FP1-FP17, SyncModels-ABCD, Combos-AF, SixHats]
context_file: 'docs/project-context.md'
---

# Brainstorming Session Results

**Facilitator:** James
**Date:** 2026-02-20

---

## Final Architecture Decision

```
┌────────────────── Tauri 2.0 ──────────────────────┐
│                                                     │
│  ┌─── Web Frontend (System WebView) ────────────┐  │
│  │  React + TypeScript (strict)                  │  │
│  │  react-flow (visual node/script editor)       │  │
│  │  shadcn/ui (component library)                │  │
│  │  PouchDB (local NoSQL, one DB per project)    │  │
│  │  Script Engine (TS custom nodes via esbuild)  │  │
│  └───────────────────────────────────────────────┘  │
│              ↕ Tauri IPC Bridge                      │
│  ┌─── Rust Backend ─────────────────────────────┐  │
│  │  CouchDB sync adapter (primary)               │  │
│  │  Firebase Storage adapter (fallback sync)      │  │
│  │  File I/O, TOTP crypto, native OS hooks        │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
         ↕                          ↕
  GCE e2-micro                Firebase Storage
  (CouchDB replication)       (media + fallback sync)
```

---

## Decision Summary

| Layer | Decision | Rationale |
|---|---|---|
| **Shell** | Tauri 2.0 | Tiny app size, Rust backend, native WebView, mobile+desktop+web |
| **Frontend** | React + TypeScript (strict) | Largest ecosystem, react-flow dependency, type safety |
| **Node Editor** | react-flow | Most mature visual node editor, 18K+ GitHub stars |
| **UI Library** | shadcn/ui | Copy-paste components, full design control, zero runtime dep |
| **Local DB** | PouchDB (per project) | NoSQL, document versioned, offline-first, built-in replication |
| **Schema** | Flexible + versioned | User-defined fields, old entries stay as-is, version metadata |
| **Relations** | Simple bidirectional refs | Entry A ↔ Entry B via IDs |
| **Primary Sync** | GCE e2-micro + CouchDB | Free forever, native PouchDB replication, user-controlled |
| **Fallback Sync** | Firebase Storage | Dump/load, zero server, media storage |
| **Sync Model** | Hybrid Git+Auto (Model D) | Safe changes auto-batch, structural = manual review + diff |
| **Scripting** | Unified Script engine (TS) | Plugins + Nodes = same engine, different scope permissions |
| **Script Editor** | Visual node editor | Read-only text view, custom TS nodes, typed I/O, try-catch |
| **Script Safety** | Auto-disable on error | Mandatory try-catch, circuit breaker pattern |
| **Plugin Model** | Hidden ledgers + user-approved | Private data for plugins, user reviews proposed project ledgers |
| **AI/External** | Plugin via HTTP API | Not core infrastructure — just scripts that call APIs |
| **Auth** | TOTP (Google Authenticator) | Single-user, lightweight |

---

## Core Design Principles

1. **Platform, not an app** — Notion-like building blocks, users compose their own tracking systems
2. **Flexible schema** — user-defined fields per ledger, schema versioning
3. **Unified Script engine** — plugins and nodes are the same thing with different scope permissions
4. **Cost-aware** — must stay within free tiers (GCE, Firebase)
5. **Offline-first** — PouchDB is always the source of truth
6. **Open source** — personal-first, community-friendly, self-hostable

---

## First Principles (Phase 1)

| # | Principle |
|---|---|
| FP1 | Core = user-defined relational data engine (ledgers as tables with relations) |
| FP2 | Platform, not app — toolkit with composable building blocks |
| FP3 | Cost ceiling — must stay within Firebase/GCE free tier |
| FP4 | Plugins = client-side input→action functions |
| FP5 | Flexible schema (NoSQL-like, user-defined fields per ledger) |
| FP6 | Plugin isolation — hidden ledgers, user-approved project ledgers, event-driven |
| FP7 | Sync = Hybrid Git+Auto (safe auto-batch, structural = manual review) |
| FP8 | Unified Script engine — plugins + nodes = scripts with different scopes |
| FP9 | Must run on mobile + desktop + web |
| FP10 | Visual-first script editor, read-only text view, custom nodes with typed I/O |
| FP11 | Firebase = data lifetime insurance (device loss protection) |
| FP12 | Script safety = try-catch + auto-disable (circuit breaker, no sandbox) |
| FP13 | Dual-backend with fallback — sync layer is a pluggable adapter |
| FP14 | Tauri 2.0 from day 1 — no rush to ship |
| FP15 | AI = just a plugin calling HTTP APIs, not core infrastructure |
| FP16 | One PouchDB per project — perfect isolation, per-project sync |
| FP17 | Schema versioning — old entries stay as-is, version metadata tracks changes |

---

## Morphological Analysis (Phase 2)

**Selected: Combo B (TypeScript-Strict)**

| Layer | Choice |
|---|---|
| Frontend | React |
| Node Editor | react-flow |
| UI Library | shadcn/ui |
| Scripting | TypeScript (strict, no plain JS) |

---

## Six Thinking Hats (Phase 3)

**Key risks identified and mitigated:**

| Risk | Mitigation |
|---|---|
| Rust learning curve | Minimal Rust — 90% logic in TS frontend |
| TS compile for custom nodes | esbuild transpiles in <10ms |
| CouchDB maintenance | Scripted auto-updates, Cloudant as backup option |
| PouchDB revision bloat | Auto-compact on sync, keep last N revisions |
| Tauri mobile maturity | Start desktop-first, add mobile later |
| Overall complexity | Incremental build — MVP is local-only, add layers progressively |

---

## Build Roadmap (Phase 4)

### Stage 1: Core Foundation
- [ ] Tauri 2.0 project setup (React + TS + Rust)
- [ ] shadcn/ui design system
- [ ] PouchDB integration (per-project instances)
- [ ] Basic ledger CRUD (create project, define schema, add/edit/delete entries)
- [ ] Flexible field system with schema versioning
- **Result:** A working local-only ledger app

### Stage 2: Data Model
- [ ] Bidirectional ledger relations (simple references)
- [ ] Multiple ledgers per project
- [ ] Project templates
- [ ] Scenes, Pages, Views hierarchy
- **Result:** Full data model with relations and views

### Stage 3: Sync
- [ ] GCE e2-micro + CouchDB deployment (Docker)
- [ ] PouchDB ↔ CouchDB replication (primary sync)
- [ ] Firebase Storage dump/load (fallback sync)
- [ ] Hybrid sync model: auto-batch safe changes, manual for structural
- [ ] Conflict diff UI for user review
- **Result:** Cross-device sync with user control

### Stage 4: Visual Scripting
- [ ] react-flow integration for visual node editor
- [ ] Built-in nodes (read, write, filter, transform, HTTP, conditional)
- [ ] Script scope system (plugin scope vs node/cross-project scope)
- [ ] Event trigger system (on click, on data entry, on page load, on schedule)
- [ ] Read-only text view for scripts
- **Result:** Working visual scripting engine

### Stage 5: Custom Nodes & Plugins
- [ ] Custom TS node authoring with strict typed I/O
- [ ] esbuild transpilation pipeline
- [ ] Mandatory try-catch + auto-disable on error
- [ ] Hidden ledgers (plugin-private data)
- [ ] User-approved project ledger creation from plugins
- [ ] Scheduled script queue (run on project open)
- **Result:** Full plugin ecosystem

### Stage 6: Auth & Security
- [ ] TOTP implementation (Google Authenticator compatible)
- [ ] Profile isolation
- **Result:** Secure access control

### Stage 7: Mobile
- [ ] Tauri mobile builds (iOS + Android)
- [ ] WebView testing and polishing across platforms
- [ ] Touch-optimized UI adaptations
- **Result:** Cross-platform app
