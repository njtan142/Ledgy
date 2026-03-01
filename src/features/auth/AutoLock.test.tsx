import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { AutoLock } from './AutoLock';
import { useAuthStore } from './useAuthStore';

// Mock useAuthStore
vi.mock('./useAuthStore', async () => {
    const actual = await vi.importActual('./useAuthStore');
    return {
        ...(actual as object),
        useAuthStore: vi.fn(),
    };
});

describe('AutoLock', () => {
    const mockUseAuthStore = vi.mocked(useAuthStore);
    const mockLock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('does not lock when vault is not unlocked', () => {
        mockUseAuthStore.mockReturnValue({
            lock: mockLock,
            isUnlocked: false,
        } as any);

        render(<AutoLock />);

        // Trigger visibilitychange
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });

        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(mockLock).not.toHaveBeenCalled();
    });

    it('locks on beforeunload event', () => {
        mockUseAuthStore.mockReturnValue({
            lock: mockLock,
            isUnlocked: true,
        } as any);

        render(<AutoLock />);

        act(() => {
            window.dispatchEvent(new Event('beforeunload'));
        });

        expect(mockLock).toHaveBeenCalledTimes(1);
    });

    it('locks on visibilitychange when tab becomes hidden', () => {
        mockUseAuthStore.mockReturnValue({
            lock: mockLock,
            isUnlocked: true,
        } as any);

        render(<AutoLock />);

        // Simulate tab becoming hidden
        Object.defineProperty(document, 'hidden', { value: true, writable: true });
        
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });

        // Should lock after 5 second delay
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(mockLock).toHaveBeenCalledTimes(1);
    });

    it('clears timeout if tab becomes visible again', () => {
        mockUseAuthStore.mockReturnValue({
            lock: mockLock,
            isUnlocked: true,
        } as any);

        render(<AutoLock />);

        // Tab becomes hidden
        Object.defineProperty(document, 'hidden', { value: true, writable: true });
        
        act(() => {
            document.dispatchEvent(new Event('visibilitychange'));
        });

        // Tab becomes visible again before 5 seconds
        Object.defineProperty(document, 'hidden', { value: false, writable: true });
        
        act(() => {
            vi.advanceTimersByTime(2000);
            document.dispatchEvent(new Event('visibilitychange'));
        });

        // Continue time - should not lock
        act(() => {
            vi.advanceTimersByTime(5000);
        });

        expect(mockLock).not.toHaveBeenCalled();
    });

    it('does not add event listeners when not unlocked', () => {
        mockUseAuthStore.mockReturnValue({
            lock: mockLock,
            isUnlocked: false,
        } as any);

        const { unmount } = render(<AutoLock />);

        // Remove listeners should not throw even if none were added
        expect(() => unmount()).not.toThrow();
        expect(mockLock).not.toHaveBeenCalled();
    });

    it('cleans up event listeners on unmount', () => {
        mockUseAuthStore.mockReturnValue({
            lock: mockLock,
            isUnlocked: true,
        } as any);

        const { unmount } = render(<AutoLock />);

        // Should not throw on unmount
        expect(() => unmount()).not.toThrow();
    });
});
