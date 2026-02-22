import "@testing-library/jest-dom";
import PouchDB from 'pouchdb';
import PouchDBAdapterMemory from 'pouchdb-adapter-memory';

PouchDB.plugin(PouchDBAdapterMemory);
