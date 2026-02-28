import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthGuard } from './AuthGuard';
import { useAuthStore } from './useAuthStore';
import { MemoryRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Helper component to capture location
let capturedLocation: ReturnType<typeof useLocation> | null = null;

const NavigationCapture: React.FC = () => {
    capturedLocation = useLocation();
    return null;
};

describe('AuthGuard', () => {
    beforeEach(() => {
        // Reset auth store state
        useAuthStore.getState().reset();
        capturedLocation = null;
    });

    it('redirects to /setup when user is not registered', () => {
        // Simulate unregistered user (no totpSecret or encryptedTotpSecret)
        useAuthStore.getState().reset();

        const { container } = render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AuthGuard>
                    <div data-testid="protected-content">Protected Content</div>
                </AuthGuard>
                <Routes>
                    <Route path="*" element={<Navigate to="/setup" replace />} />
                    <Route path="/setup" element={<div data-testid="setup-page">Setup Page</div>} />
                </Routes>
                <NavigationCapture />
            </MemoryRouter>
        );

        // AuthGuard should redirect, so protected content should not be visible
        expect(container.querySelector('[data-testid="protected-content"]')).not.toBeInTheDocument();
        // Verify we ended up at /setup
        expect(capturedLocation?.pathname).toBe('/setup');
    });

    it('redirects to /unlock when user is registered but not unlocked', () => {
        // Simulate registered but locked user
        useAuthStore.setState({
            totpSecret: 'JBSWY3DPEHPK3PXP',
            isUnlocked: false,
            needsPassphrase: false,
        });

        const { container } = render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AuthGuard>
                    <div data-testid="protected-content">Protected Content</div>
                </AuthGuard>
                <Routes>
                    <Route path="*" element={<Navigate to="/unlock" replace />} />
                    <Route path="/unlock" element={<div data-testid="unlock-page">Unlock Page</div>} />
                </Routes>
                <NavigationCapture />
            </MemoryRouter>
        );

        // AuthGuard should redirect, so protected content should not be visible
        expect(container.querySelector('[data-testid="protected-content"]')).not.toBeInTheDocument();
        // Verify we ended up at /unlock
        expect(capturedLocation?.pathname).toBe('/unlock');
    });

    it('renders children when user is authenticated and unlocked', () => {
        // Simulate authenticated and unlocked user
        useAuthStore.setState({
            totpSecret: 'JBSWY3DPEHPK3PXP',
            isUnlocked: true,
            needsPassphrase: false,
        });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AuthGuard>
                    <div data-testid="protected-content">Protected Content</div>
                </AuthGuard>
                <NavigationCapture />
            </MemoryRouter>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
        // Verify we stayed on the requested route
        expect(capturedLocation?.pathname).toBe('/dashboard');
    });

    it('allows access when user has encryptedTotpSecret (passphrase mode) and is unlocked', () => {
        // Simulate passphrase-protected user who is unlocked
        useAuthStore.setState({
            encryptedTotpSecret: {
                iv: [1, 2, 3, 4],
                ciphertext: [5, 6, 7, 8],
                pbkdf2Salt: [9, 10, 11, 12],
            },
            isUnlocked: true,
            needsPassphrase: false,
        });

        render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AuthGuard>
                    <div data-testid="protected-content">Protected Content</div>
                </AuthGuard>
                <NavigationCapture />
            </MemoryRouter>
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
        expect(capturedLocation?.pathname).toBe('/dashboard');
    });

    it('redirects to /unlock when passphrase-protected user is not unlocked', () => {
        // Simulate passphrase-protected user who needs to unlock
        useAuthStore.setState({
            encryptedTotpSecret: {
                iv: [1, 2, 3, 4],
                ciphertext: [5, 6, 7, 8],
                pbkdf2Salt: [9, 10, 11, 12],
            },
            isUnlocked: false,
            needsPassphrase: true,
        });

        const { container } = render(
            <MemoryRouter initialEntries={['/dashboard']}>
                <AuthGuard>
                    <div data-testid="protected-content">Protected Content</div>
                </AuthGuard>
                <Routes>
                    <Route path="*" element={<Navigate to="/unlock" replace />} />
                    <Route path="/unlock" element={<div data-testid="unlock-page">Unlock Page</div>} />
                </Routes>
                <NavigationCapture />
            </MemoryRouter>
        );

        // AuthGuard should redirect, so protected content should not be visible
        expect(container.querySelector('[data-testid="protected-content"]')).not.toBeInTheDocument();
        // Verify we ended up at /unlock
        expect(capturedLocation?.pathname).toBe('/unlock');
    });
});
