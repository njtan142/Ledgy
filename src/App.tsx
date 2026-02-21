import { useState, useEffect } from "react";
import { getProfileDb } from "./lib/db";

function App() {
  const [dbStatus, setDbStatus] = useState<string>("Initializing Database...");
  const [name, setName] = useState("");

  useEffect(() => {
    async function initDb() {
      try {
        const db = getProfileDb("default_profile");
        const info = await db.getAllDocuments();
        setDbStatus(`PouchDB Connected & Ready. Document Count: ${info.total_rows}`);
      } catch (e: any) {
        setDbStatus(`Database Error: ${e.message}`);
      }
    }
    initDb();
  }, []);

  async function testCreateEntry() {
    try {
      const db = getProfileDb("default_profile");
      await db.createDocument("test_entry", { name: name || "Anonymous User" });
      const info = await db.getAllDocuments();
      setDbStatus(`Saved! New Document Count: ${info.total_rows}`);
    } catch (e: any) {
      setDbStatus(`Failed to save: ${e.message}`);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center font-sans">
      <h1 className="text-4xl font-bold tracking-tight mb-8 text-emerald-500">Universal Ledgy Test</h1>

      <p className="text-zinc-400 mb-8">{dbStatus}</p>

      <div className="flex flex-col gap-4 bg-zinc-900 p-6 rounded-lg border border-zinc-800 shadow-xl">
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a test name..."
          className="bg-zinc-950 border border-zinc-700 rounded-md px-4 py-2 text-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-mono"
        />
        <button
          type="button"
          onClick={testCreateEntry}
          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-semibold py-2 px-4 rounded-md transition-colors"
        >
          Create Test Document
        </button>
      </div>
    </div>
  );
}

export default App;
