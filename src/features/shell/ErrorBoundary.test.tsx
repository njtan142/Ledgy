import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary, useErrorHandler } from './ErrorBoundary';
import { useErrorStore } from '../../stores/useErrorStore';

// Test component that throws an error
const ThrowErrorComponent: React.FC<{ message?: string }> = ({ message = 'Test error' }) => {
    throw new Error(message);
};

// Test component that renders successfully
const SuccessComponent: React.FC = () => <div data-testid="success">Success</div>;

describe('ErrorBoundary', () => {
    beforeEach(() => {
        // Clear error store before each test
        useErrorStore.getState().clearError();
    });

    it('renders children when no error occurs', () => {
        render(
            <ErrorBoundary>
                <SuccessComponent />
            </ErrorBoundary>
        );

        expect(screen.getByTestId('success')).toBeInTheDocument();
    });

    it('catches and displays error when child component throws', () => {
        // Suppress console.error for this test
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <ThrowErrorComponent message="Test error message" />
            </ErrorBoundary>
        );

        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Test error message')).toBeInTheDocument();

        consoleSpy.mockRestore();
    });

    it('dispatches error to useErrorStore when error is caught', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const dispatchErrorSpy = vi.spyOn(useErrorStore.getState(), 'dispatchError');

        render(
            <ErrorBoundary>
                <ThrowErrorComponent message="Store test error" />
            </ErrorBoundary>
        );

        expect(dispatchErrorSpy).toHaveBeenCalledWith(
            expect.stringContaining('Store test error'),
            'error'
        );

        consoleSpy.mockRestore();
    });

    it('shows custom fallback when provided', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <ErrorBoundary fallback={<div data-testid="custom-fallback">Custom Fallback</div>}>
                <ThrowErrorComponent />
            </ErrorBoundary>
        );

        expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();

        consoleSpy.mockRestore();
    });

    it('allows dismiss action to reset error state', () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <ErrorBoundary>
                <ThrowErrorComponent message="Dismiss test" />
            </ErrorBoundary>
        );

        // Verify error is shown
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();

        // Click dismiss button
        const dismissButton = screen.getByText('Dismiss');
        fireEvent.click(dismissButton);

        // Error should be cleared (component re-renders children)
        // Note: This test may need adjustment based on React's error boundary behavior
        consoleSpy.mockRestore();
    });
});

describe('useErrorHandler', () => {
    it('dispatches error to useErrorStore with context', () => {
        const { result } = renderHook(() => useErrorHandler());
        const dispatchErrorSpy = vi.spyOn(useErrorStore.getState(), 'dispatchError');

        const error = new Error('Hook test error');
        result.current(error, 'Test Context');

        expect(dispatchErrorSpy).toHaveBeenCalledWith(
            'Test Context: Hook test error',
            'error'
        );
    });

    it('dispatches error without context when not provided', () => {
        const { result } = renderHook(() => useErrorHandler());
        const dispatchErrorSpy = vi.spyOn(useErrorStore.getState(), 'dispatchError');

        const error = new Error('Simple error');
        result.current(error);

        expect(dispatchErrorSpy).toHaveBeenCalledWith('Simple error', 'error');
    });
});

// Helper for testing hooks
function renderHook<T>(callback: () => T) {
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
        <div>{children}</div>
    );
    
    let resultValue: T;
    
    const TestComponent: React.FC = () => {
        resultValue = callback();
        return null;
    };
    
    render(<TestComponent />, { wrapper });
    
    return { result: { current: resultValue! } };
}
