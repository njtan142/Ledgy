import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProfileMetadata } from '../types/profile';
import { getProfileDb } from '../lib/db';
import { useErrorStore } from './useErrorStore';

interface ProfileState {
    profiles: ProfileMetadata[];
    activeProfileId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProfiles: () => Promise<void>;
    setActiveProfile: (id: string) => void;
    createProfile: (name: string, description?: string) => Promise<void>;
    deleteProfile: (id: string) => Promise<void>;
}

export const useProfileStore = create<ProfileState>()(
    persist(
        (set, get) => ({
            profiles: [],
            activeProfileId: null,
            isLoading: false,
            error: null,

            fetchProfiles: async () => {
                set({ isLoading: true, error: null });
                try {
                    // Profile metadata is stored in a special 'master' DB or localStorage.
                    // For now, let's assume a 'master' profile DB named 'ledgy_master'
                    const masterDb = getProfileDb('master');
                    const profileDocs = await masterDb.getAllDocuments<any>('profile');
                    const profiles = profileDocs
                        .filter(doc => !doc.isDeleted)
                        .map(doc => ({
                            id: doc._id,
                            name: doc.name,
                            description: doc.description,
                            createdAt: doc.createdAt,
                            updatedAt: doc.updatedAt,
                        }));
                    set({ profiles, isLoading: false });
                } catch (err: any) {
                    const errorMsg = err.message || 'Failed to fetch profiles';
                    set({ error: errorMsg, isLoading: false });
                    useErrorStore.getState().dispatchError(errorMsg);
                }
            },

            setActiveProfile: (id: string) => {
                set({ activeProfileId: id });
            },

            createProfile: async (name: string, description?: string) => {
                set({ isLoading: true, error: null });
                try {
                    const masterDb = getProfileDb('master');
                    const response = await masterDb.createDocument('profile', {
                        name,
                        description,
                    });

                    if (response.ok) {
                        // After creating metadata, we initialize the profile's dedicated PouchDB
                        const profileDb = getProfileDb(response.id);
                        await profileDb.createDocument('profile_init', { initialized: true });

                        await get().fetchProfiles();
                    }
                } catch (err: any) {
                    const errorMsg = err.message || 'Failed to create profile';
                    set({ error: errorMsg, isLoading: false });
                    useErrorStore.getState().dispatchError(errorMsg);
                }
            },

            deleteProfile: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const masterDb = getProfileDb('master');
                    // In a real app, we might want to deeply delete the profile's PouchDB too
                    const profileDb = getProfileDb(id);
                    await profileDb.destroy();

                    // Update metadata
                    const profileDoc = await masterDb.getDocument<any>(id);
                    await masterDb.updateDocument(id, {
                        ...profileDoc,
                        isDeleted: true,
                        deletedAt: new Date().toISOString()
                    });

                    await get().fetchProfiles();
                    if (get().activeProfileId === id) {
                        set({ activeProfileId: null });
                    }
                } catch (err: any) {
                    const errorMsg = err.message || 'Failed to delete profile';
                    set({ error: errorMsg, isLoading: false });
                    useErrorStore.getState().dispatchError(errorMsg);
                }
            },
        }),
        {
            name: 'ledgy-profile-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                activeProfileId: state.activeProfileId,
            }),
        }
    )
);
