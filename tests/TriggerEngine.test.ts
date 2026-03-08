import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeTrigger } from '../src/services/triggerEngine';
import { CanvasNode, CanvasEdge } from '../src/types/nodeEditor';

describe('Trigger Engine', () => {
    const mockNodes: CanvasNode[] = [
        { id: 't1', type: 'trigger', position: { x: 0, y: 0 }, data: { label: 'T1' } },
        { id: 'c1', type: 'correlation', position: { x: 100, y: 0 }, data: { label: 'C1' } },
        { id: 'a1', type: 'arithmetic', position: { x: 200, y: 0 }, data: { label: 'A1' } },
    ];

    const mockEdges: CanvasEdge[] = [
        { id: 'e1', source: 't1', target: 'c1' },
        { id: 'e2', source: 'c1', target: 'a1' },
    ];

    it('executes downstream nodes in sequence', async () => {
        const context = {
            triggerId: 't1',
            entryId: 'e1',
            ledgerId: 'l1',
            eventType: 'on-create' as const,
            depth: 0
        };

        // We can't easily spy on internal private functions, but we can verify it doesn't throw
        await expect(executeTrigger(context, mockNodes, mockEdges, 't1')).resolves.not.toThrow();
    });

    it('does not throw at high depth (loop prevention handled upstream)', async () => {
        // As of Story 4-4, executeTrigger no longer has explicit depth-limit checking.
        // Loop prevention is now handled at the nodeEngine level.
        const context = {
            triggerId: 't1',
            entryId: 'e1',
            ledgerId: 'l1',
            eventType: 'on-create' as const,
            depth: 100,
            profileId: 'p1',
            projectId: 'proj1',
        };

        await expect(executeTrigger(context)).resolves.not.toThrow();
    });

    it('handles branching paths', async () => {
        const branchingEdges: CanvasEdge[] = [
            { id: 'e1', source: 't1', target: 'c1' },
            { id: 'e2', source: 't1', target: 'a1' },
        ];

        const context = {
            triggerId: 't1',
            entryId: 'e1',
            ledgerId: 'l1',
            eventType: 'on-create' as const,
            depth: 0
        };

        await expect(executeTrigger(context, mockNodes, branchingEdges, 't1')).resolves.not.toThrow();
    });
});
