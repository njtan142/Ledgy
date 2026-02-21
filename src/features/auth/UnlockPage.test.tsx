import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnlockPage } from './UnlockPage';
import { useAuthStore } from './useAuthStore';
import { MemoryRouter } from 'react-router-dom';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.mock('./useAuthStore', () => ({
    useAuthStore: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('input-otp', () => ({
    OTPInput: ({ value, onChange, maxLength }: any) => (
        <input
            role="textbox"
            value={value}
            maxLength={maxLength}
            onChange={(e) => onChange(e.target.value)}
        />
    ),
}));

describe('UnlockPage', () => {
    const mockUnlock = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAuthStore as any).mockReturnValue({
            unlock: mockUnlock,
        });
    });

    it('renders the unlock page', () => {
        render(
            <MemoryRouter>
                <UnlockPage />
            </MemoryRouter>
        );
        expect(screen.getByText(/Ledgy Locked/i)).toBeInTheDocument();
        expect(screen.getByText(/Enter your 6-digit TOTP code/i)).toBeInTheDocument();
    });

    it('calls unlock when 6 digits are entered', async () => {
        mockUnlock.mockResolvedValue(true);
        render(
            <MemoryRouter>
                <UnlockPage />
            </MemoryRouter>
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '123456' } });

        await waitFor(() => {
            expect(mockUnlock).toHaveBeenCalledWith('123456');
        });
        expect(mockNavigate).toHaveBeenCalledWith('/profiles');
    });

    it('displays error message on invalid code', async () => {
        mockUnlock.mockResolvedValue(false);
        render(
            <MemoryRouter>
                <UnlockPage />
            </MemoryRouter>
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '000000' } });

        await waitFor(() => {
            expect(screen.getByText(/Invalid code/i)).toBeInTheDocument();
        });
    });

    it('disables button when less than 6 digits', () => {
        render(
            <MemoryRouter>
                <UnlockPage />
            </MemoryRouter>
        );

        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: '123' } });

        const button = screen.getByRole('button', { name: /Unlock Vault/i });
        expect(button).toBeDisabled();
    });
});
