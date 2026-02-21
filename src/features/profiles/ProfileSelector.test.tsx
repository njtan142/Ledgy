import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileSelector } from './ProfileSelector';
import { useProfileStore } from '../../stores/useProfileStore';
import { BrowserRouter } from 'react-router-dom';

// Wrapper for router context
const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('ProfileSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useProfileStore.setState({
            profiles: [
                { id: '1', name: 'Profile 1', description: 'Desc 1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
                { id: '2', name: 'Profile 2', description: 'Desc 2', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            ],
            isLoading: false,
            error: null,
        });
    });

    it('renders the list of profiles', () => {
        renderWithRouter(<ProfileSelector />);

        expect(screen.getByText('Profile 1')).toBeDefined();
        expect(screen.getByText('Profile 2')).toBeDefined();
        expect(screen.getByText('Select Profile')).toBeDefined();
    });

    it('navigates to the app on profile selection', async () => {
        const setActiveProfileSpy = vi.spyOn(useProfileStore.getState(), 'setActiveProfile');

        renderWithRouter(<ProfileSelector />);

        const profileCard = screen.getByText('Profile 1');
        fireEvent.click(profileCard);

        expect(setActiveProfileSpy).toHaveBeenCalledWith('1');
        // Navigation verification usually requires mocking useNavigate or checking window.location
    });

    it('calls createProfile on "New Profile" click', async () => {
        const createProfileSpy = vi.spyOn(useProfileStore.getState(), 'createProfile').mockResolvedValue(undefined);

        renderWithRouter(<ProfileSelector />);

        const newProfileBtn = screen.getByText('New Profile');
        fireEvent.click(newProfileBtn);

        expect(createProfileSpy).toHaveBeenCalled();
    });
});
