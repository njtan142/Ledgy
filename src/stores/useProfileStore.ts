import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProfileMetadata } from '../types/profile';
import { getProfileDb, closeProfileDb, create_profile_encrypted, list_profiles } from '../lib/db';
import { useErrorStore } from './useErrorStore';
import { useAuthStore } from '../features/auth/useAuthStore';
import { encryptPayload, decryptPayload } from '../lib/crypto';

interface ProfileState {
    profiles: ProfileMetadata[];
    activeProfileId: string | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchProfiles: () => Promise<void>;
    setActiveProfile: (id: string) => void;
    createProfile: (name: string, description?: string) => Promise<string>;
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
                    const masterDb = getProfileDb('master');
                    const profileDocs = await list_profiles(masterDb);
                    const authState = useAuthStore.getState();
                    const encryptionKey = authState.encryptionKey;

                    // Performance: Process in batches of 5 to avoid hanging the JS thread
                    const BATCH_SIZE = 5;
                    const activeProfiles = profileDocs.filter(doc => !doc.isDeleted);
                    const profiles: ProfileMetadata[] = [];

                    for (let i = 0; i < activeProfiles.length; i += BATCH_SIZE) {
                        const batch = activeProfiles.slice(i, i + BATCH_SIZE);
                        const batchResults = await Promise.all(batch.map(async doc => {
                            let name = doc.name;
                            let description = doc.description;

                            // If name is encrypted (object with iv/ciphertext), decrypt it
                            if (encryptionKey && doc.name_enc) {
                                try {
                                    const iv = new Uint8Array(doc.name_enc.iv);
                                    const ciphertext = new Uint8Array(doc.name_enc.ciphertext).buffer;
                                    name = await decryptPayload(encryptionKey, iv, ciphertext);

                                    if (doc.description_enc) {
                                        const dIv = new Uint8Array(doc.description_enc.iv);
                                        const dCiphertext = new Uint8Array(doc.description_enc.ciphertext).buffer;
                                        description = await decryptPayload(encryptionKey, dIv, dCiphertext);
                                    }
                                } catch (e) {
                                    console.error('Failed to decrypt profile name:', e);
                                    name = `[Encrypted Profile ${doc._id.slice(-4)}]`;
                                }
                            }

                            return {
                                id: doc._id,
                                name,
                                description,
                                createdAt: doc.createdAt,
                                updatedAt: doc.updatedAt,
                                remoteSyncEndpoint: doc.remoteSyncEndpoint,
                            };
                        }));
                        profiles.push(...batchResults);
                    }

                    set({ profiles, isLoading: false });
                } catch (err: any) {
                    // Refined Error Catching: Check for status or name
                    const status = err.status || err.name || 'UnknownError';
                    const errorMsg = err.message || `Failed to fetch profiles (${status})`;
                    set({ error: errorMsg, isLoading: false });
                    useErrorStore.getState().dispatchError(errorMsg);
                }
            },

            setActiveProfile: async (id: string) => {
                const currentId = get().activeProfileId;
                if (currentId && currentId !== id) {
                    await closeProfileDb(currentId);
                }
                set({ activeProfileId: id });
            },

            createProfile: async (name: string, description?: string): Promise<string> => {
                set({ isLoading: true, error: null });
                try {
                    const masterDb = getProfileDb('master');
                    const authState = useAuthStore.getState();

                    // Stabilization: Ensure we are unlocked before proceeding
                    if (!authState.isUnlocked) {
                        throw new Error('Vault must be unlocked to create a profile.');
                    }

                    const encryptionKey = authState.encryptionKey;
                    if (!encryptionKey) {
                        throw new Error('Encryption key is unavailable. Please try locking and unlocking again.');
                    }

                    // Validate: Prevent duplicate profile names
                    const existingProfiles = await list_profiles(masterDb);
                    const authStateCurrent = useAuthStore.getState();
                    const key = authStateCurrent.encryptionKey;
                    
                    // Check for duplicate names by decrypting and comparing
                    for (const doc of existingProfiles) {
                        if (doc.name_enc && key) {
                            try {
                                const iv = new Uint8Array(doc.name_enc.iv);
                                const ciphertext = new Uint8Array(doc.name_enc.ciphertext).buffer;
                                const existingName = await decryptPayload(key, iv, ciphertext);
                                if (existingName.toLowerCase() === name.toLowerCase()) {
                                    throw new Error(`A profile with the name "${name}" already exists.`);
                                }
                            } catch (e) {
                                console.error('Failed to decrypt profile name for validation:', e);
                            }
                        }
                    }

                    // Encrypt the profile metadata
                    const nameEnc = await encryptPayload(encryptionKey, name);
                    const encryptedName = {
                        iv: nameEnc.iv,
                        ciphertext: Array.from(new Uint8Array(nameEnc.ciphertext))
                    };
                    
                    let encryptedDescription = undefined;
                    if (description) {
                        const descEnc = await encryptPayload(encryptionKey, description);
                        encryptedDescription = {
                            iv: descEnc.iv,
                            ciphertext: Array.from(new Uint8Array(descEnc.ciphertext))
                        };
                    }

                    // Use the DAL function to create the profile with encrypted metadata
                    const profileId = await create_profile_encrypted(masterDb, encryptedName, encryptedDescription);

                    // Initialize the profile database with encrypted metadata
                    const profileDb = getProfileDb(profileId);
                    await profileDb.createDocument('profile_init', {
                        initialized: true,
                        name_enc: encryptedName,
                        description_enc: encryptedDescription
                    });
                    
                    await get().fetchProfiles();
                    
                    // Return the profile ID so UI can auto-select it
                    return profileId;
                } catch (err: any) {
                    const status = err.status || err.name || 'UnknownError';
                    const errorMsg = err.message || `Failed to create profile (${status})`;
                    set({ error: errorMsg, isLoading: false });
                    useErrorStore.getState().dispatchError(errorMsg);
                    throw err;
                }
            },

            deleteProfile: async (id: string) => {
                set({ isLoading: true, error: null });
                try {
                    const masterDb = getProfileDb('master');

                    // NFR12 Compliance: Destroy actual profile database FIRST
                    // If this fails, we MUST NOT mark as deleted in master (rollback safety)
                    const profileDb = getProfileDb(id);
                    await profileDb.destroy();
                    // Note: destroy() already calls delete profileDatabases[this.profileId]

                    // Only after successful destroy, mark as deleted in master
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
                    const status = err.status || err.name || 'UnknownError';
                    const errorMsg = err.message || `Failed to delete profile (${status})`;
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
