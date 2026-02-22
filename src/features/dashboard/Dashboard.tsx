import React from 'react';
import { EmptyDashboard } from './EmptyDashboard';
import { useErrorStore } from '../../stores/useErrorStore';

export const Dashboard: React.FC = () => {
    // Note: This will be connected to a ledger store in the future
    const ledgers: any[] = [];

    const handleCreateLedger = () => {
        // Placeholder for Schema Builder routing
        useErrorStore.getState().dispatchError('Schema Builder not yet implemented. Template Picker is deferred.', 'info');
    };

    return (
        <div className="flex-1 w-full h-full p-4 md:p-8 bg-zinc-950/20">
            <h1 className="text-3xl font-bold tracking-tight mb-8 text-zinc-100">Dashboard</h1>

            {ledgers.length === 0 ? (
                <EmptyDashboard onActionClick={handleCreateLedger} />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placeholder for real ledgers later */}
                </div>
            )}
        </div>
    );
};
