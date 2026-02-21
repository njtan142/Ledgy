import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './useAuthStore';

interface AuthGuardProps {
    children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
    const { isUnlocked, isRegistered } = useAuthStore();
    const location = useLocation();

    if (!isRegistered()) {
        // If not registered, always force setup
        if (location.pathname !== '/setup') {
            return <Navigate to="/setup" replace />;
        }
        return <>{children}</>;
    }

    if (!isUnlocked) {
        // If registered but locked, redirect to unlock
        if (location.pathname !== '/unlock') {
            return <Navigate to="/unlock" replace />;
        }
        return <>{children}</>;
    }

    return <>{children}</>;
};
