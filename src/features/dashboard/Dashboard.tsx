import React from 'react';
import { useUIStore } from '../../stores/useUIStore';
import { PanelRightOpen } from 'lucide-react';
import { EmptyDashboard } from './EmptyDashboard';
import { useErrorStore } from '../../stores/useErrorStore';

export const Dashboard: React.FC = () => {
    const { toggleRightInspector, rightInspectorOpen } = useUIStore();
    const dispatchError = useErrorStore(state => state.dispatchError);

    // Placeholder until ledgers are implemented
    const hasLedgers = false;

    const handleCreateLedger = () => {
        dispatchError('Schema Builder not yet implemented. Template Picker is deferred.', 'info');
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
