import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInactivityTimer } from './useInactivityTimer';
import { useAuthStore } from '../features/auth/useAuthStore';

// Mock useAuthStore
const mockLock = vi.fn();
vi.mock('../features/auth/useAuthStore', () => ({
    useAuthStore: vi.fn((selector: any) => {
        const state = {
            lock: mockLock,
            isUnlocked: true,
        };
        return selector(state);
    }),
}));

describe('useInactivityTimer', () => {
    const mockUseAuthStore = vi.mocked(useAuthStore);
    const mockLock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        mockUseAuthStore.mockReturnValue({
            lock: mockLock,
            isUnlocked: true,
        } as any);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('locks vault after timeout period', () => {
        renderHook(() => useInactivityTimer({ timeoutMs: 1000 }));

        // Fast-forward time by 1 second (less than timeout)
        act(() => {
            vi.advanceTimersByTime(999);
        });
        expect(mockLock).not.toHaveBeenCalled();

        // Fast-forward past timeout
        act(() => {
            vi.advanceTimersByTime(1);
        });
        expect(mockLock).toHaveBeenCalledTimes(1);
    });

    it('resets timer on user activity', () => {
        renderHook(() => useInactivityTimer({ timeoutMs: 1000 }));

        // Simulate user activity at 500ms
        act(() => {
            vi.advanceTimersByTime(500);
            window.dispatchEvent(new MouseEvent('mousemove'));
        });

        // Timer should have reset, so lock shouldn't be called at 1000ms
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(mockLock).not.toHaveBeenCalled();

        // Lock should be called at 1500ms (1000ms after activity)
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(mockLock).toHaveBeenCalledTimes(1);
    });

    it('does not start timer when not enabled', () => {
        renderHook(() => useInactivityTimer({ enabled: false, timeoutMs: 1000 }));

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(mockLock).not.toHaveBeenCalled();
    });

    it('does not start timer when vault is locked', () => {
        mockUseAuthStore.mockReturnValue({
            lock: mockLock,
            isUnlocked: false,
        } as any);

        renderHook(() => useInactivityTimer({ timeoutMs: 1000 }));

        act(() => {
            vi.advanceTimersByTime(2000);
        });

        expect(mockLock).not.toHaveBeenCalled();
    });

    it('calls custom onTimeout callback instead of lock', () => {
        const customCallback = vi.fn();
        renderHook(() => useInactivityTimer({ timeoutMs: 1000, onTimeout: customCallback }));

        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(customCallback).toHaveBeenCalledTimes(1);
        expect(mockLock).not.toHaveBeenCalled();
    });

    it('throttles activity resets to once per second', () => {
        renderHook(() => useInactivityTimer({ timeoutMs: 1000 }));

        // Simulate rapid activity
        act(() => {
            for (let i = 0; i < 10; i++) {
                window.dispatchEvent(new MouseEvent('mousemove'));
            }
        });

        // Should only reset timer once due to throttling
        act(() => {
            vi.advanceTimersByTime(1000);
        });

        expect(mockLock).toHaveBeenCalledTimes(1);
    });

    it('returns time since last activity', () => {
        const { result } = renderHook(() => useInactivityTimer({ timeoutMs: 1000 }));

        const initialTime = result.current.timeSinceLastActivity;
        expect(initialTime).toBeGreaterThanOrEqual(0);

        act(() => {
            vi.advanceTimersByTime(500);
        });

        const laterTime = result.current.timeSinceLastActivity;
        expect(laterTime).toBeGreaterThanOrEqual(500);
    });

    it('provides manual reset function', () => {
        const { result } = renderHook(() => useInactivityTimer({ timeoutMs: 1000 }));

        act(() => {
            vi.advanceTimersByTime(500);
            result.current.reset();
        });

        // Timer should reset, lock not called until 1500ms total
        act(() => {
            vi.advanceTimersByTime(500);
        });
        expect(mockLock).not.toHaveBeenCalled();
    });
});
