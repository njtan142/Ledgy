import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProfileStore } from './useProfileStore';
import { useErrorStore } from '../../stores/useErrorStore';

describe('useProfileStore', () => {
    beforeEach(() => {
        // Reset store state before each test
        useProfileStore.getState().clearActiveProfile();
        useErrorStore.getState().clearError();
        localStorage.clear();
    });

    it('initializes with correct default state', () => {
        const state = useProfileStore.getState();
        expect(state.profiles).toEqual([]);
        expect(state.activeProfileId).toBeNull();
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('sets active profile correctly', () => {
        useProfileStore.getState().setActiveProfile('profile:123');
        const state = useProfileStore.getState();
        expect(state.activeProfileId).toBe('profile:123');
    });

    it('clears active profile correctly', () => {
        useProfileStore.getState().setActiveProfile('profile:123');
        useProfileStore.getState().clearActiveProfile();
        const state = useProfileStore.getState();
        expect(state.activeProfileId).toBeNull();
    });

    it('creates profile and updates state', async () => {
        await useProfileStore.getState().createProfile('Test Profile', 'icon-1');
        const state = useProfileStore.getState();
        expect(state.profiles).toHaveLength(1);
        expect(state.profiles[0].name).toBe('Test Profile');
        expect(state.profiles[0].icon).toBe('icon-1');
    });

    it('deletes profile and updates state', async () => {
        await useProfileStore.getState().createProfile('To Delete');
        const profileId = useProfileStore.getState().profiles[0].id;
        await useProfileStore.getState().deleteProfile(profileId);
        const state = useProfileStore.getState();
        expect(state.profiles).toHaveLength(0);
    });

    it('clears active profile when deleted', async () => {
        await useProfileStore.getState().createProfile('Active');
        const profileId = useProfileStore.getState().profiles[0].id;
        useProfileStore.getState().setActiveProfile(profileId);
        await useProfileStore.getState().deleteProfile(profileId);
        const state = useProfileStore.getState();
        expect(state.activeProfileId).toBeNull();
    });

    it('sets error state on failure', async () => {
        // Mock localStorage to throw error
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = vi.fn(() => {
            throw new Error('Storage error');
        });

        await useProfileStore.getState().createProfile('Fail');
        const state = useProfileStore.getState();
        expect(state.error).toBeTruthy();

        // Restore
        localStorage.setItem = originalSetItem;
    });

    it('toggles isLoading during async operations', async () => {
        let isLoadingDuringOp = false;
        
        const promise = useProfileStore.getState().createProfile('Test');
        isLoadingDuringOp = useProfileStore.getState().isLoading;
        
        await promise;
        const isLoadingAfter = useProfileStore.getState().isLoading;
        
        expect(isLoadingDuringOp).toBe(true);
        expect(isLoadingAfter).toBe(false);
    });
});
