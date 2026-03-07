import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { deriveKeyFromTotp } from '../../lib/crypto';
import { encodeSecret, decodeSecret, verifyTotp } from '../../lib/totp';

interface AuthState {
    totpSecret: string | null; // Base32 encoded secret, persisted
    salt: string | null; // Base32 encoded salt, persisted
    isUnlocked: boolean;
    encryptionKey: CryptoKey | null; // Volatile, never persisted
    unlock: (code: string) => Promise<boolean>;
    verifyAndRegister: (secret: string, code: string) => Promise<boolean>;
    lock: () => void;
    isRegistered: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            totpSecret: null,
            salt: null,
            isUnlocked: false,
            encryptionKey: null,

            unlock: async (code: string) => {
                const { totpSecret, salt: saltEncoded } = get();
                if (!totpSecret) return false;

                try {
                    const rawSecret = decodeSecret(totpSecret);
                    const isValid = await verifyTotp(rawSecret, code);

                    if (isValid) {
                        // For backward compatibility, fallback to legacy salt if not present
                        const saltBytes = saltEncoded
                            ? decodeSecret(saltEncoded)
                            : new TextEncoder().encode('ledgy-salt-v1');
                        const key = await deriveKeyFromTotp(totpSecret, saltBytes);

                        set({
                            isUnlocked: true,
                            encryptionKey: key
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
                        const saltBytes = crypto.getRandomValues(new Uint8Array(16));
                        const saltEncoded = encodeSecret(saltBytes);
                        const key = await deriveKeyFromTotp(secret, saltBytes);

                        set({
                            totpSecret: secret,
                            salt: saltEncoded,
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
                set({ isUnlocked: false, encryptionKey: null });
            },

            isRegistered: () => {
                return !!get().totpSecret;
            },
        }),
        {
            name: 'ledgy-auth-storage',
            storage: createJSONStorage(() => localStorage),
            // Persist the totpSecret and the salt
            partialize: (state) => ({
                totpSecret: state.totpSecret,
                salt: state.salt
            }),
        }
    )
);
