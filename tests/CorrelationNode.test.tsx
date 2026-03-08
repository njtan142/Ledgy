import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CorrelationNode } from '../src/features/nodeEditor/nodes/CorrelationNode';

// Mock React Flow components
vi.mock('@xyflow/react', () => ({
    Handle: ({ id, type }: any) => <div data-testid={`handle-${type}-${id}`} />,
    Position: { Right: 'right', Left: 'left' },
}));

describe('CorrelationNode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly initially', () => {
        const data = { label: 'Corr', result: null, isComputing: false };
        render(<CorrelationNode id="node-1" data={data} selected={false} type="correlation" zIndex={0} isConnectable={true} dragging={false} />);

        expect(screen.getByText('Correlation')).toBeInTheDocument();
        // Check for the specific result display '-'
        const resultDisplay = screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'span' && 
                   element.classList.contains('text-lg') && 
                   content === '-';
        });
        expect(resultDisplay).toBeInTheDocument();
    });

    it('displays result when provided via node data', () => {
        const data = { label: 'Corr', result: 0.95, isComputing: false };
        render(<CorrelationNode id="node-1" data={data} selected={false} type="correlation" zIndex={0} isConnectable={true} dragging={false} />);

        expect(screen.getByText('0.950')).toBeInTheDocument();
        expect(screen.getByText('Strong +')).toBeInTheDocument();
    });

    it('displays dash when result is null (node is passive, awaiting data)', () => {
        const data = { label: 'Corr', result: null, isComputing: false };
        render(<CorrelationNode id="node-1" data={data} selected={false} type="correlation" zIndex={0} isConnectable={true} dragging={false} />);

        const resultDisplay = screen.getByText((content, element) => {
            return element?.tagName.toLowerCase() === 'span' && 
                   element.classList.contains('text-lg') && 
                   content === '-';
        });
        expect(resultDisplay).toBeInTheDocument();
    });

    it('displays computing state when isComputing is true', () => {
        const data = { label: 'Corr', result: null, isComputing: true };
        render(<CorrelationNode id="node-1" data={data} selected={false} type="correlation" zIndex={0} isConnectable={true} dragging={false} />);

        expect(screen.getByText('Computing...')).toBeInTheDocument();
    });
});
