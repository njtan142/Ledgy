# Story 2.2: Profile Selector Canvas

Status: ready-for-dev

<!-- Note: Validation is recommended. Run validate-create-story for quality check before dev-story. -->

## Story

As a **user with multiple profiles**,
I want **a visual canvas showing all my profiles as cards**,
so that **I can easily see and select which profile to work with**.

## Acceptance Criteria

1. Profile selector canvas displays all profiles as cards
2. Each card shows profile name, color/avatar, and last opened date
3. Clicking a card switches to that profile
4. Empty state shown when no profiles exist (links to create profile)
5. Active profile is visually highlighted
6. Loading state during profile fetch
7. Error state with retry option if fetch fails
8. TypeScript strict mode compiles without errors
9. Unit tests cover component rendering and interactions
10. Integration with useProfileStore for state management

## Tasks / Subtasks

- [ ] Task 1: Create ProfileCard component (AC: #1, #2)
  - [ ] Create `src/features/profile/ProfileCard.tsx`
  - [ ] Display profile name from metadata
  - [ ] Show color/avatar visual indicator
  - [ ] Display last opened date (relative time)
  - [ ] Add hover and active states
- [ ] Task 2: Create ProfileSelectorCanvas component (AC: #1, #3, #4, #5)
  - [ ] Create `src/features/profile/ProfileSelectorCanvas.tsx`
  - [ ] Grid layout for profile cards
  - [ ] Fetch profiles on mount
  - [ ] Handle empty state (no profiles)
  - [ ] Highlight active profile card
  - [ ] Navigate on card click
- [ ] Task 3: Implement loading and error states (AC: #6, #7)
  - [ ] Add loading skeleton during fetch
  - [ ] Display error message on failure
  - [ ] Add retry button for failed fetches
  - [ ] Integrate with useErrorStore
- [ ] Task 4: Write unit tests (AC: #8, #9)
  - [ ] Test ProfileCard rendering
  - [ ] Test empty state display
  - [ ] Test loading state
  - [ ] Test error state with retry
  - [ ] Test card click navigation
  - [ ] Test active profile highlighting
- [ ] Task 5: Verify TypeScript and integration (AC: #8, #10)
  - [ ] TypeScript strict mode: no errors
  - [ ] Integration with useProfileStore
  - [ ] Responsive design (mobile/desktop)

## Dev Notes

### Critical Technical Requirements

**Component Structure**:
```typescript
// ProfileCard.tsx
interface ProfileCardProps {
    profile: ProfileMetadata;
    isActive: boolean;
    onClick: () => void;
}

// ProfileSelectorCanvas.tsx
interface ProfileSelectorCanvasProps {
    onProfileSelect?: (profileId: string) => void;
}
```

**Grid Layout**:
```css
/* Use CSS Grid for responsive layout */
.profile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
}
```

**Empty State**:
```typescript
// Show when profiles.length === 0
<EmptyState
    title="No profiles yet"
    description="Create your first profile to get started"
    actionLabel="Create Profile"
    onAction={() => navigate('/profiles/create')}
/>
```

### Project Structure Notes

**Profile Feature Organization**:
```
src/
├── features/
│   └── profile/
│       ├── ProfileCard.tsx           # NEW: Individual profile card
│       ├── ProfileSelectorCanvas.tsx # NEW: Grid canvas
│       └── index.ts                  # Barrel exports
├── stores/
│   └── useProfileStore.ts            # Existing: Profile state
└── components/
    └── ui/
        ├── EmptyState.tsx            # Reusable empty state
        └── LoadingSkeleton.tsx       # Reusable loading state
```

### Architecture Compliance

**All code MUST follow these patterns from architecture.md**:

- **Component Structure**: Functional components with TypeScript interfaces
- **State Management**: Use useProfileStore (Zustand) for profile data
- **Error Handling**: All errors dispatched to useErrorStore
- **Type Safety**: TypeScript strict mode
- **Styling**: Tailwind CSS v4 utility classes
- **Testing**: Vitest + React Testing Library

**Integration with Previous Stories**:
- Story 1-3: useProfileStore for profile state
- Story 1-4: Three-panel shell layout integration
- Story 1-9: App settings (theme/density) affect display
- Story 2-1: Profile DB segregation (profiles from dedicated DBs)

### Library/Framework Requirements

**Core Dependencies** (already installed):
- React 19 (Story 1-1)
- Zustand (Story 1-3)
- Tailwind CSS v4 (Story 1-1)
- React Router v7 (Story 1-2)
- date-fns (for relative time formatting - verify installation)

**DO NOT install**:
- Additional UI libraries (use existing Tailwind utilities)
- Date libraries if date-fns exists (use existing)

### Testing Standards

**Unit Tests (Vitest + React Testing Library)**:
- Co-located: `src/features/profile/ProfileCard.test.tsx`
- Co-located: `src/features/profile/ProfileSelectorCanvas.test.tsx`
- Mock useProfileStore using vi.mock()
- Test user interactions (clicks, navigation)
- Test loading and error states
- Test responsive behavior

**Critical Test Scenarios**:
1. ✅ ProfileCard renders with correct name and color
2. ✅ ProfileCard shows active state when isActive=true
3. ✅ ProfileSelectorCanvas shows empty state when no profiles
4. ✅ ProfileSelectorCanvas shows loading skeleton during fetch
5. ✅ ProfileSelectorCanvas shows error with retry button
6. ✅ Clicking card triggers navigation
7. ✅ Active profile is visually highlighted

### Git Branch Strategy

**Branch Decision**: Using `allatonce` branch for all epic implementation work.

```bash
git checkout allatonce
```

### Previous Story Intelligence

**From Story 2-1 (Profile DB Segregation Logic)**:
- ProfileDbManager created for multi-DB management
- Database naming: `ledgy-profile-{profileId}`
- Profile metadata encrypted with AES-256-GCM
- useProfileStore already has profile CRUD operations
- Profile switching emits `ledgy:profile:switch` event

**Files Created/Modified**:
- `src/lib/profileDbManager.ts` - Profile DB management
- `src/lib/profileDbManager.test.ts` - 25/25 tests passing
- `src/stores/useProfileStore.ts` - Already has profile state

**Code Review Learnings**:
- Use kebab-case for database naming (`ledgy-profile-`)
- Document singleton patterns clearly
- Propagate errors instead of swallowing
- Silence console.log in tests
- Extract magic strings to constants

### References

- [Source: architecture.md#Component Architecture](planning-artifacts/architecture.md)
- [Source: architecture.md#State Management](planning-artifacts/architecture.md)
- [Source: project-context.md#Technology Stack & Versions](project-context.md)
- [Source: epics.md#Epic 2: Profiles & Project Management](planning-artifacts/epics.md)
- [Source: Story 2-1 Implementation](implementation-artifacts/2-1-profile-db-segregation-logic.md)

## Dev Agent Record

### Agent Model Used

BMad Method create-story workflow

### Debug Log References

### Completion Notes List

### File List

---

## Technical Requirements

### Mandatory Implementation Standards

1. **Use existing git branch**: You MUST work on the `allatonce` branch.

2. **Component structure**: MUST use functional components with TypeScript interfaces.

3. **State management**: MUST use useProfileStore (Zustand) for profile data.

4. **Error handling**: MUST dispatch all errors to useErrorStore.

5. **Styling**: MUST use Tailwind CSS v4 utility classes.

6. **TypeScript strict mode**: ALL code must compile without errors.

7. **Test coverage**: ALL components MUST have unit tests.

8. **Responsive design**: MUST work on mobile and desktop.

### Next Steps

After completing this story:
1. Commit all changes to `allatonce` branch
2. Update sprint-status.yaml and COMMIT
3. Run code-review workflow for validation
4. Proceed to Story 2.3: Profile Creation Flow
