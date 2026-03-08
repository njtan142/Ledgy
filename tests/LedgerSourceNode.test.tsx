import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LedgerSourceNode } from '../src/features/nodeEditor/nodes/LedgerSourceNode';
import { useLedgerStore } from '../src/stores/useLedgerStore';
import { useProfileStore } from '../src/stores/useProfileStore';

// Mock React Flow components
vi.mock('@xyflow/react', () => ({
    Handle: ({ id, type }: any) => <div data-testid={`handle-${type}-${id}`} />,
    Position: { Right: 'right', Left: 'left' },
    useReactFlow: () => ({ updateNodeData: vi.fn() }),
}));

// Mock stores
vi.mock('../src/stores/useLedgerStore');
vi.mock('../src/stores/useProfileStore');

describe('LedgerSourceNode', () => {
    const mockSchemas = [
        { _id: 'ledger-1', name: 'Coffee Ledger', fields: [{ name: 'Price', type: 'number' }] },
        { _id: 'ledger-2', name: 'Sleep Ledger', fields: [{ name: 'Hours', type: 'number' }, { name: 'Note', type: 'text' }] }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        (useProfileStore as any).mockReturnValue({ activeProfileId: 'profile-1' });
        (useLedgerStore as any).mockReturnValue({
            schemas: mockSchemas,
            fetchSchemas: vi.fn(),
        });
    });

    it('renders placeholder when no ledger is selected', () => {
        const data = { label: 'Source' };
        render(<LedgerSourceNode id="node-1" data={data} selected={false} type="ledgerSource" zIndex={0} isConnectable={true} dragging={false} />);

        expect(screen.getByText('Select Ledger...')).toBeInTheDocument();
    });
});
