import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { deriveKeyFromTotp } from '../../lib/crypto';
import { decodeSecret, verifyTotp } from '../../lib/totp';

interface AuthState {
    totpSecret: string | null; // Base32 encoded secret, persisted
    isUnlocked: boolean;
    encryptionKey: CryptoKey | null; // Volatile, never persisted
    rememberMe: boolean;
    setRememberMe: (val: boolean) => void;
    unlock: (code: string, remember: boolean) => Promise<boolean>;
    verifyAndRegister: (secret: string, code: string) => Promise<boolean>;
    lock: () => void;
    reset: () => void;
    isRegistered: () => boolean;
    initSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            totpSecret: null,
            isUnlocked: false,
            encryptionKey: null,
            rememberMe: false,

            setRememberMe: (val: boolean) => set({ rememberMe: val }),

            initSession: async () => {
                const { rememberMe, totpSecret, encryptionKey } = get();
                if (rememberMe && totpSecret && !encryptionKey) {
                    try {
                        const salt = new TextEncoder().encode('ledgy-salt-v1');
                        const key = await deriveKeyFromTotp(totpSecret, salt);
                        set({ isUnlocked: true, encryptionKey: key });
                    } catch (err) {
                        console.error('Auto-unlock failed:', err);
                    }
                }
            },

            unlock: async (code: string, remember: boolean = false) => {
                const { totpSecret } = get();
                if (!totpSecret) return false;

                try {
                    const rawSecret = decodeSecret(totpSecret);
                    const isValid = await verifyTotp(rawSecret, code);

                    if (isValid) {
                        const salt = new TextEncoder().encode('ledgy-salt-v1');
                        const key = await deriveKeyFromTotp(totpSecret, salt);

                        set({
                            isUnlocked: true,
                            encryptionKey: key,
                            rememberMe: remember
                        });
                        return true;
                    }
                } catch (error) {
                    console.error('Unlock failed:', error);
                }

                return false;
            },

            verifyAndRegister: async (secret: string, code: string) => {
                try {
                    const rawSecret = decodeSecret(secret);
                    const isValid = await verifyTotp(rawSecret, code);

                    if (isValid) {
                        const salt = new TextEncoder().encode('ledgy-salt-v1');
                        const key = await deriveKeyFromTotp(secret, salt);

                        set({
                            totpSecret: secret,
                            isUnlocked: true,
                            encryptionKey: key
                        });
                        return true;
                    }
                } catch (error) {
                    console.error('Registration failed:', error);
                }
                return false;
            },

            lock: () => {
                set({ isUnlocked: false, encryptionKey: null, rememberMe: false });
            },

            reset: () => {
                set({ totpSecret: null, isUnlocked: false, encryptionKey: null, rememberMe: false });
            },

            isRegistered: () => {
                return !!get().totpSecret;
            },
        }),
        {
            name: 'ledgy-auth-storage',
            storage: createJSONStorage(() => localStorage),
            // ONLY persist the totpSecret and rememberMe
            partialize: (state) => ({
                totpSecret: state.totpSecret,
                rememberMe: state.rememberMe
            } as AuthState),
        }
    )
);

// Initialize session on load
useAuthStore.getState().initSession();
