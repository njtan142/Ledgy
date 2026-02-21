import PouchDB from 'pouchdb';
import { v4 as uuidv4 } from 'uuid';

// In a real implementation we would dynamically load plugins or use different adapters
// For now, standard indexeddb adapter is the default in the browser
export class Database {
    private db: PouchDB.Database;

    constructor(profileId: string) {
        this.db = new PouchDB(`ledgy_${profileId}`);
    }

    // Example core operation
    async createDocument(type: string, data: any) {
        const doc = {
            _id: `${type}:${uuidv4()}`,
            type: type,
            schema_version: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...data,
        };
        return await this.db.put(doc);
    }

    async getAllDocuments() {
        return await this.db.allDocs({ include_docs: true });
    }

    // Example sync operation
    sync(remoteUrl: string) {
        return this.db.sync(remoteUrl, {
            live: true,
            retry: true,
        });
    }
}

// Global registry for currently active profile DBs
const profileDatabases: Record<string, Database> = {};

export function getProfileDb(profileId: string): Database {
    if (!profileDatabases[profileId]) {
        profileDatabases[profileId] = new Database(profileId);
    }
    return profileDatabases[profileId];
}
