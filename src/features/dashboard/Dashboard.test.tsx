import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Dashboard } from './Dashboard';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { useErrorStore } from '../../stores/useErrorStore';

describe('Dashboard Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useErrorStore.setState({ error: null });
    });

    it('renders empty dashboard initially', () => {
        render(
            <MemoryRouter initialEntries={['/app/profile1']}>
                <Routes>
                    <Route path="/app/:profileId" element={<Dashboard />} />
                </Routes>
            </MemoryRouter>
        );

        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Welcome to Ledgy!')).toBeInTheDocument();
    });

    it('dispatches an info message when creating a ledger (placeholder logic)', () => {
        const dispatchErrorSpy = vi.spyOn(useErrorStore.getState(), 'dispatchError');

        render(
            <MemoryRouter initialEntries={['/app/profile1']}>
                <Routes>
                    <Route path="/app/:profileId" element={<Dashboard />} />
                </Routes>
            </MemoryRouter>
        );

        const createBtn = screen.getByRole('button', { name: /Create Ledger/i });
        fireEvent.click(createBtn);

        expect(dispatchErrorSpy).toHaveBeenCalledWith(
            'Schema Builder not yet implemented. Template Picker is deferred.',
            'info'
        );
    });
});
