import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ArithmeticNode } from '../src/features/nodeEditor/nodes/ArithmeticNode';
import { useNodeStore } from '../src/stores/useNodeStore';

// Mock useNodeStore (ArithmeticNode calls useNodeStore.getState().updateNodeData on change)
vi.mock('../src/stores/useNodeStore');

// Mock React Flow components
vi.mock('@xyflow/react', () => ({
    Handle: ({ id, type }: any) => <div data-testid={`handle-${type}-${id}`} />,
    Position: { Right: 'right', Left: 'left' },
}));

describe('ArithmeticNode', () => {
    const mockUpdateNodeData = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useNodeStore as any).getState = vi.fn().mockReturnValue({ updateNodeData: mockUpdateNodeData });
    });

    it('renders correctly initially', () => {
        const data = { label: 'Arith', operation: 'sum', result: null, isComputing: false };
        render(<ArithmeticNode id="node-1" data={data} selected={false} type="arithmetic" zIndex={0} isConnectable={true} dragging={false} />);

        expect(screen.getByText('Arithmetic')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Sum')).toBeInTheDocument();
    });

    it('calls updateNodeData when operation changes', () => {
        const data: any = { 
            label: 'Arith', 
            operation: 'sum',
            result: null, 
            isComputing: false,
        };
        
        render(<ArithmeticNode id="node-1" data={data} selected={false} type="arithmetic" zIndex={0} isConnectable={true} dragging={false} />);

        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'average' } });

        expect(mockUpdateNodeData).toHaveBeenCalledWith('node-1', { operation: 'average' });
    });

    it('displays result when provided via node data', () => {
        const data = { label: 'Arith', operation: 'sum', result: 30, isComputing: false };
        render(<ArithmeticNode id="node-1" data={data} selected={false} type="arithmetic" zIndex={0} isConnectable={true} dragging={false} />);

        expect(screen.getByText('30')).toBeInTheDocument();
    });
});
