import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './useAuthStore';
import { encodeSecret, generateSecret } from '../../lib/totp';

// Mocking verifyTotp to always return true for testing store logic
vi.mock('../../lib/totp', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../lib/totp')>();
    return {
        ...actual,
        verifyTotp: vi.fn().mockResolvedValue(true),
    };
});

describe('useAuthStore', () => {
    beforeEach(() => {
        // Reset the store state before each test
        useAuthStore.setState({
            totpSecret: null,
            salt: null,
            isUnlocked: false,
            encryptionKey: null
        }, true);
    });

    it('generates a unique salt during registration', async () => {
        const secret = encodeSecret(generateSecret());
        const code = '123456';

        await useAuthStore.getState().verifyAndRegister(secret, code);

        const state1 = useAuthStore.getState();
        const salt1 = state1.salt;
        expect(salt1).not.toBeNull();

        // Register again to see if salt is different
        useAuthStore.setState({ totpSecret: null, salt: null, isUnlocked: false, encryptionKey: null }, true);
        await useAuthStore.getState().verifyAndRegister(secret, code);

        const state2 = useAuthStore.getState();
        const salt2 = state2.salt;
        expect(salt2).not.toBeNull();
        expect(salt2).not.toBe(salt1);
    });

    it('uses the stored salt during unlock', async () => {
        const secret = encodeSecret(generateSecret());
        const code = '123456';

        // Register first
        await useAuthStore.getState().verifyAndRegister(secret, code);
        const registeredSalt = useAuthStore.getState().salt;
        expect(registeredSalt).not.toBeNull();

        // Lock
        useAuthStore.getState().lock();
        expect(useAuthStore.getState().isUnlocked).toBe(false);

        // Unlock
        const success = await useAuthStore.getState().unlock(code);
        expect(success).toBe(true);
        expect(useAuthStore.getState().isUnlocked).toBe(true);
        expect(useAuthStore.getState().salt).toBe(registeredSalt);
    });

    it('handles backward compatibility for missing salt', async () => {
        const secret = encodeSecret(generateSecret());
        const code = '123456';

        // Manually set secret but no salt (simulating old state)
        useAuthStore.setState({
            totpSecret: secret,
            salt: null,
            isUnlocked: false,
            encryptionKey: null
        });

        const success = await useAuthStore.getState().unlock(code);
        // It should succeed because of the fallback
        expect(success).toBe(true);
        expect(useAuthStore.getState().isUnlocked).toBe(true);
        expect(useAuthStore.getState().salt).toBeNull(); // State salt remains null
    });
});
