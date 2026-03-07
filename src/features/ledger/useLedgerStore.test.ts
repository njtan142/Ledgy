import { describe, it, expect, beforeEach } from 'vitest';
import { useLedgerStore } from './useLedgerStore';
import { useErrorStore } from '../../stores/useErrorStore';

describe('useLedgerStore', () => {
    beforeEach(() => {
        useErrorStore.getState().clearError();
        localStorage.clear();
    });

    it('initializes with correct default state', () => {
        const state = useLedgerStore.getState();
        expect(state.entries).toEqual([]);
        expect(state.schemas).toEqual([]);
        expect(state.isLoading).toBe(false);
        expect(state.error).toBeNull();
    });

    it('creates entry with required fields', async () => {
        await useLedgerStore.getState().createEntry({ type: 'test', name: 'Test Entry' });
        const state = useLedgerStore.getState();
        expect(state.entries).toHaveLength(1);
        expect(state.entries[0].type).toBe('test');
        expect(state.entries[0].schema_version).toBe(1);
        expect(state.entries[0]._id).toMatch(/entry:\d+/);
    });

    it('updates entry with new values', async () => {
        await useLedgerStore.getState().createEntry({ type: 'test', name: 'Original' });
        const entryId = useLedgerStore.getState().entries[0]._id;
        await useLedgerStore.getState().updateEntry(entryId, { name: 'Updated' });
        
        const state = useLedgerStore.getState();
        expect(state.entries[0].name).toBe('Updated');
        expect(state.entries[0].updatedAt).toBeTruthy();
    });

    it('soft deletes entry with ghost reference pattern', async () => {
        await useLedgerStore.getState().createEntry({ type: 'test' });
        const entryId = useLedgerStore.getState().entries[0]._id;
        await useLedgerStore.getState().deleteEntry(entryId);
        
        const state = useLedgerStore.getState();
        expect(state.entries[0].isDeleted).toBe(true);
        expect(state.entries[0].deletedAt).toBeTruthy();
    });

    it('creates schema with fields', async () => {
        await useLedgerStore.getState().createSchema({
            name: 'Test Schema',
            fields: [{ name: 'field1', type: 'text' }],
        });
        const state = useLedgerStore.getState();
        expect(state.schemas).toHaveLength(1);
        expect(state.schemas[0].name).toBe('Test Schema');
        expect(state.schemas[0].fields).toHaveLength(1);
    });

    it('filters entries by schema type', async () => {
        await useLedgerStore.getState().createEntry({ type: 'type1' });
        await useLedgerStore.getState().createEntry({ type: 'type2' });
        
        await useLedgerStore.getState().loadEntries('type1');
        const state = useLedgerStore.getState();
        expect(state.entries).toHaveLength(1);
        expect(state.entries[0].type).toBe('type1');
    });

    it('sets error on failure', async () => {
        const originalSetItem = localStorage.setItem;
        localStorage.setItem = () => {
            throw new Error('Storage error');
        };

        await useLedgerStore.getState().createEntry({ type: 'fail' });
        const state = useLedgerStore.getState();
        expect(state.error).toBeTruthy();

        localStorage.setItem = originalSetItem;
    });
});
