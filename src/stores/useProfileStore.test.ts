import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProfileStore } from './useProfileStore';
import { getProfileDb, _clearProfileDatabases } from '../lib/db';
import { useErrorStore } from './useErrorStore';

describe('useProfileStore', () => {
    beforeEach(async () => {
        vi.clearAllMocks();
        _clearProfileDatabases();
        useProfileStore.setState({
            profiles: [],
            activeProfileId: null,
            isLoading: false,
            error: null,
        });

        // Reset the master DB
        const masterDb = getProfileDb('master');
        await masterDb.destroy();
        _clearProfileDatabases(); // Clear registry again after destroy
    });

    it('should create a profile and update state', async () => {
        const store = useProfileStore.getState();

        await store.createProfile('Test Profile', 'A test profile');

        const state = useProfileStore.getState();
        expect(state.profiles).toHaveLength(1);
        expect(state.profiles[0].name).toBe('Test Profile');
        expect(state.profiles[0].description).toBe('A test profile');
    });

    it('should set active profile', () => {
        useProfileStore.getState().setActiveProfile('test-id');
        expect(useProfileStore.getState().activeProfileId).toBe('test-id');
    });

    it('should handle errors during profile creation', async () => {
        // Mock a DB failure
        const masterDb = getProfileDb('master');
        vi.spyOn(masterDb, 'createDocument').mockRejectedValue(new Error('DB Error'));

        const dispatchErrorSpy = vi.spyOn(useErrorStore.getState(), 'dispatchError');

        await useProfileStore.getState().createProfile('Fail Profile');

        const state = useProfileStore.getState();
        expect(state.error).toBe('DB Error');
        expect(dispatchErrorSpy).toHaveBeenCalledWith('DB Error');
    });

    it('should delete a profile and clear activity if it was active', async () => {
        const store = useProfileStore.getState();
        await store.createProfile('To Delete');
        const profiles = useProfileStore.getState().profiles;
        const profileId = profiles[0].id;

        await store.setActiveProfile(profileId);
        expect(useProfileStore.getState().activeProfileId).toBe(profileId);

        await store.deleteProfile(profileId);

        const state = useProfileStore.getState();
        expect(state.profiles).toHaveLength(0);
        expect(state.activeProfileId).toBeNull();
    });
});
