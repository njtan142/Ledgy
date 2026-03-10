import type { LedgerEntry } from '../types/ledger';
import type { LedgerSchema } from '../types/ledger';

/**
 * Pure, synchronous JIT migration function.
 * Strips keys from entry.data that are no longer present in schema.fields,
 * and bumps schema_version to match the current schema.
 *
 * No default injection: fields newly added to the schema are simply absent
 * from the migrated data (intentional — see Dev Notes for rationale).
 */
export function migrateEntryData(
    entry: LedgerEntry,
    schema: LedgerSchema
): { migrated: LedgerEntry; didMigrate: boolean } {
    if (entry.schema_version >= schema.schema_version) {
        return { migrated: entry, didMigrate: false };
    }

    const activeFieldNames = new Set(schema.fields.map(f => f.name));
    const newData: Record<string, unknown> = {};
    for (const key of Object.keys(entry.data)) {
        if (activeFieldNames.has(key)) {
            newData[key] = entry.data[key];
        }
    }

    return {
        migrated: { ...entry, data: newData, schema_version: schema.schema_version },
        didMigrate: true,
    };
}
