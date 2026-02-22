/**
 * Sync Service
 * Handles PouchDB replication and conflict resolution
 * Story 5-4: Conflict Resolution (Accept/Reject)
 */

import { getProfileDb } from '../lib/db';
import { ConflictEntry } from '../features/sync/ConflictListSheet';

/**
 * Resolve a conflict by accepting either local or remote version
 */
export async function resolveConflict(
    profileId: string,
    entryId: string,
    winningVersion: 'local' | 'remote',
    conflict: ConflictEntry
): Promise<void> {
    const db = getProfileDb(profileId);
    
    // Get the winning version data
    const winner = winningVersion === 'local'
        ? conflict.localVersion.data
        : conflict.remoteVersion.data;

    try {
        // Get the current document to get the latest _rev
        const currentDoc = await db.getDocument<any>(entryId);
        
        // Update with winning version data, preserving envelope
        await db.updateDocument(entryId, {
            ...winner,
            // Preserve document envelope fields
            _type: currentDoc._type,
            schema_version: currentDoc.schema_version,
        });

        // Trigger a sync to propagate the resolution
        // In production, this would use PouchDB replication
        console.log(`Conflict resolved for ${entryId}: ${winningVersion} version accepted`);
    } catch (err: any) {
        console.error('Failed to resolve conflict:', err);
        throw new Error(`Failed to resolve conflict: ${err.message}`);
    }
}

/**
 * Merge field-level values from local and remote versions
 */
export function mergeConflictVersions(
    conflict: ConflictEntry,
    fieldChoices: Record<string, 'local' | 'remote'>
): any {
    const merged: any = { ...conflict.localVersion.data };

    // Apply field-level choices
    Object.keys(fieldChoices).forEach(field => {
        const choice = fieldChoices[field];
        if (choice === 'remote' && conflict.remoteVersion.data[field] !== undefined) {
            merged[field] = conflict.remoteVersion.data[field];
        } else if (choice === 'local') {
            merged[field] = conflict.localVersion.data[field];
        }
    });

    return merged;
}

/**
 * Resolve conflict with merged data
 */
export async function resolveConflictWithMerge(
    profileId: string,
    entryId: string,
    conflict: ConflictEntry,
    fieldChoices: Record<string, 'local' | 'remote'>
): Promise<void> {
    const mergedData = mergeConflictVersions(conflict, fieldChoices);
    await resolveConflictWithCustomData(profileId, entryId, mergedData);
}

/**
 * Resolve conflict with custom merged data
 */
export async function resolveConflictWithCustomData(
    profileId: string,
    entryId: string,
    customData: any
): Promise<void> {
    const db = getProfileDb(profileId);

    try {
        // Get the current document
        const currentDoc = await db.getDocument<any>(entryId);
        
        // Update with custom merged data
        await db.updateDocument(entryId, {
            ...customData,
            // Preserve document envelope fields
            _type: currentDoc._type,
            schema_version: currentDoc.schema_version,
        });

        console.log(`Conflict resolved for ${entryId} with merged data`);
    } catch (err: any) {
        console.error('Failed to resolve merged conflict:', err);
        throw new Error(`Failed to resolve merged conflict: ${err.message}`);
    }
}

/**
 * Skip conflict resolution (leave pending)
 * This is a no-op - the conflict remains in the store
 */
export function skipConflict(): void {
    // Intentionally empty - skipping means leaving the conflict as-is
    console.log('Conflict skipped - remains pending');
}
