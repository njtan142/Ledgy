import React from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { PanelRightOpen } from 'lucide-react';
import { EmptyDashboard } from './EmptyDashboard';

export const Dashboard: React.FC = () => {
    const { toggleRightInspector, rightInspectorOpen } = useUIStore();

    // TODO: Replace with actual ledger count check when Epic 3 (Relational Ledger Engine) is implemented
    // Current implementation: Always shows empty state for Story 2.4 MVP
    // Future: const hasLedgers = ledgers.length > 0;
    const hasLedgers = false;

    const handleCreateLedger = () => {
        // TODO: Replace alert with proper modal/route to Schema Builder when Epic 3 is implemented
        // For now, using alert to avoid misusing the notification system for unimplemented features
        alert('Schema Builder will be available in Epic 3. This will let you define custom ledger schemas with field types.');
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-zinc-950 text-zinc-50 overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900 shrink-0">
                <div className="flex-1 flex items-baseline gap-2">
                    <h1 className="text-sm font-semibold">Dashboard</h1>
                </div>

                {!rightInspectorOpen && (
                    <button onClick={toggleRightInspector} className="ml-2 text-zinc-400 hover:text-zinc-200" title="Open Inspector">
                        <PanelRightOpen size={16} />
                    </button>
                )}
            </div>

            {/* Table Area / Main Content */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-center items-center">
                {!hasLedgers ? (
                    <EmptyDashboard onActionClick={handleCreateLedger} />
                ) : (
                    <div className="text-zinc-500">
                        {/* Future ledger view */}
                    </div>
                )}
            </div>
        </div>
    );
};
