# Story 1.3: App Unlock Flow & Auth Guard

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a returning user,
I want to enter my TOTP code on the unlock screen,
so that my data is decrypted and I can access my profiles.

## Acceptance Criteria

1. **Given** Ledgy is launched with an existing TOTP registration
   **When** the user enters a valid 6-digit TOTP code on the `/unlock` route
   **Then** `useAuthStore().isUnlocked` is set to `true` and the user is redirected to the profile selector (`/profiles`)
2. **And** all routes except `/setup` and `/unlock` are wrapped in `<AuthGuard />` and redirect unauthenticated users to `/unlock`
3. **And** an invalid TOTP code displays an inline error message below the input field — no toast, no modal
4. **And** the unlock screen does not expose any profile data before successful TOTP verification
5. **And** the UI follows the Emerald/Zinc dark theme specified in the UX Design Specification

## Tasks / Subtasks

- [ ] Task 1 (AC: 1, 3, 5): Implement Unlock UI
  - [ ] Subtask 1.1: Create `src/features/auth/UnlockPage.tsx` with a focusable 6-digit OTP input.
  - [ ] Subtask 1.2: Implement form handling to call `useAuthStore().unlock(code)` on submission or when 6 digits are entered.
  - [ ] Subtask 1.3: Add inline error state when `unlock` returns `false`.
- [ ] Task 2 (AC: 2): Refine Routing & Protection
  - [ ] Subtask 2.1: Update `src/features/auth/AuthGuard.tsx` with corrected redirection logic (Backlog -> /setup, Registered & Locked -> /unlock).
  - [ ] Subtask 2.2: Register `UnlockPage` in `src/App.tsx` and ensure `/profiles` route is planned for Epic 2.
- [ ] Task 3 (AC: 4): Security Validation
  - [ ] Subtask 3.1: Verify that accessing `/` or other protected routes while locked forces a redirect to `/unlock`.

## Dev Notes

- **Input OTP**: Recommend using `input-otp` or a similar highly accessible component to match the "Builder's Pride" aesthetic.
- **Navigation**: Use `react-router-dom`'s `useNavigate` for post-unlock redirection.
- **State Management**: The `useAuthStore` already contains the `unlock` method which handles HKDF key derivation.
- **Styling**: Ensure full coverage of the `zinc-950` background and `emerald-500` accents.

### Project Structure Notes

- **Alignment**:
  - `src/features/auth/` remains the home for all authentication logic.
- **Detected conflicts or variances**:
  - Ensure `AuthGuard` doesn't create a redirect loop between `/setup` and `/unlock`.
  - The `Dashboard` in `App.tsx` is currently a placeholder; ensures it's protected.

### References

- [Source: planning-artifacts/architecture.md#Authentication & Security](file:///c:/Users/njtan/Documents/GitHub/ledgy/_bmad-output/planning-artifacts/architecture.md#L119-128)
- [Source: planning-artifacts/ux-design-specification.md#Journey 1 — Alex: Daily Entry Loop](file:///c:/Users/njtan/Documents/GitHub/ledgy/_bmad-output/planning-artifacts/ux-design-specification.md#L379-403)
- [Source: planning-artifacts/epics.md#Story 1.3: App Unlock Flow & Auth Guard](file:///c:/Users/njtan/Documents/GitHub/ledgy/_bmad-output/planning-artifacts/epics.md#L181-195)
- [Source: docs/project-context.md#Critical Implementation Rules](file:///c:/Users/njtan/Documents/GitHub/ledgy/_bmad-output/project-context.md#L29-51)

## Dev Agent Record

### Agent Model Used

Antigravity (Gemini 2.0 Flash)

### Debug Log References

### Completion Notes List

### File List
