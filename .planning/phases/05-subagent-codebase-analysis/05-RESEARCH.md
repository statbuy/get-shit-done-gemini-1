# Phase 5 Research: Subagent Codebase Analysis

**Status:** Research Complete
**Date:** 2026-01-21
**Mode:** Ecosystem & Implementation

<key_insight>
The primary challenge is **Memory Management**—both the V8 Heap (Node.js) and the LLM Context Window.

1.  **Context Window**: We cannot load 500+ files into the prompt. Solution: Subagent reads files, extracts metadata/entities, and writes *only* the summary to the Graph.
2.  **V8 Heap**: Loading a massive `sql.js` buffer + thousands of file strings in the main process can cause GC pauses. Solution: Offload "heavy" graph updates to a short-lived subagent.
3.  **Concurrency**: `sql.js` is in-memory. There is no file locking. We must strictly serialize access via a "Hot Potato" pattern: Parent drops the DB (save to disk), Child picks it up (load), modifies, drops it (save), Parent picks it up.
</key_insight>

## Standard Stack

| Component | Choice | Reason |
|-----------|--------|--------|
| **Database** | `sql.js` (WASM) | Existing project standard; portable; requires explicit save/load. |
| **Process** | `child_process.fork` | Native Node.js capability; easy setup. |
| **IPC** | File Streams + JSON Lines | `process.send` creates serialization overhead and blocks the event loop for large messages. Appending to a log file is O(1). |
| **Observability** | `tail -f` (internal equivalent) | Main process monitors the log file to show progress bars. |

## Architecture Patterns

### The "Hot Potato" Database Handoff
Since `sql.js` operates in-memory, we cannot have two processes accessing the "same" database simultaneously.

1.  **Parent**: `db.export()` -> `fs.writeFileSync('graph.db')` -> `db.close()`.
2.  **Parent**: Spawns `child_process`.
3.  **Child**: `fs.readFileSync('graph.db')` -> `new SQL.Database()`.
4.  **Child**: Performs analysis, updates graph.
5.  **Child**: `db.export()` -> `fs.writeFileSync('graph.db')` -> `process.exit(0)`.
6.  **Parent**: Detects exit -> `fs.readFileSync('graph.db')` -> `new SQL.Database()`.

### JSON Lines Logging (IPC)
Instead of spamming `process.send()`, the subagent writes structured logs to a temp file.

**Format:**
```json
{"level":"info","stage":"scanning","progress":10,"total":100,"message":"Parsing src/index.ts"}
{"level":"debug","stage":"entity-gen","file":"src/utils.ts","entity":"class:Utils"}
{"level":"error","stage":"failed","error":"SyntaxError..."}
```

## Don't Hand-Roll

- **IPC Protocol**: Do not invent a custom binary protocol. Use JSON Lines (ndjson).
- **File Watching**: Do not implement custom file watching in the subagent. The subagent should do a "one-shot" scan based on the list provided by the parent or a full directory scan if instructed.
- **Process Management**: Do not use raw `spawn` if `fork` suffices (fork gives you a Node environment automatically).

## Common Pitfalls

- **The "Lost Update"**: If the parent doesn't close/freeze its DB instance, it might overwrite the child's work if it saves on exit. **Rule:** Parent MUST NOT write to DB while Child is active.
- **Zombie Children**: If the user kills the CLI (`Ctrl+C`), the child process might keep running. **Rule:** Parent must handle `SIGINT` to kill children.
- **OOM (Out Of Memory)**: `sql.js` loads the whole DB into RAM. If the graph grows to 100MB+, passing it back and forth is slow. **Mitigation:** Future phases might need `better-sqlite3` (disk-backed), but for now, sticking to `sql.js` requires strict memory discipline.

## Code Examples

### Parent: Spawning & Handoff

```javascript
import { fork } from 'child_process';
import fs from 'fs';
import initSqlJs from 'sql.js';

async function runSubagent(db, dbPath) {
  // 1. SAVE & CLOSE
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
  db.close(); 
  db = null; // Safety

  // 2. SPAWN
  const logFile = `.gemini/tmp/subagent-${Date.now()}.log`;
  const child = fork('./agents/indexer.js', [dbPath, logFile]);

  // 3. MONITOR
  child.on('message', (msg) => {
    // Only use process.send for CRITICAL signals (like "I'm done" or "Fatal Error")
    // or keep it purely exit-code based.
  });

  return new Promise((resolve, reject) => {
    child.on('exit', async (code) => {
      if (code !== 0) return reject(new Error(`Exit ${code}`));

      // 4. RELOAD
      const SQL = await initSqlJs();
      const fileBuffer = fs.readFileSync(dbPath);
      const newDb = new SQL.Database(fileBuffer);
      resolve(newDb);
    });
  });
}
```

### Child: Indexer (agents/indexer.js)

```javascript
import fs from 'fs';
import initSqlJs from 'sql.js';

const [nodeBin, scriptFile, dbPath, logPath] = process.argv;

function log(data) {
  fs.appendFileSync(logPath, JSON.stringify(data) + '\n');
}

async function start() {
  try {
    const SQL = await initSqlJs();
    const db = new SQL.Database(fs.readFileSync(dbPath));

    // ... WORK ...
    log({ level: 'info', message: 'Processing complete' });

    // SAVE
    fs.writeFileSync(dbPath, Buffer.from(db.export()));
    process.exit(0);
  } catch (err) {
    log({ level: 'error', message: err.message });
    process.exit(1);
  }
}

start();
```