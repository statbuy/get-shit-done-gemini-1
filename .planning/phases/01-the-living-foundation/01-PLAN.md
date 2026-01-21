---
wave: 1
depends_on: []
files_modified:
  - package.json
  - bin/gsd-watch.js
  - scripts/build-hooks.js
  - hooks/gsd-intel-index.js
autonomous: true
---

# Phase 1: The Living Foundation - Plan

**Goal:** Establish the "Sidecar" architecture with a standalone Watcher Daemon and SQLite graph database.

## Tasks

<task type="run_shell_command" name="install_dependencies">
<description>
Install `chokidar` as a devDependency. This is required for the file watcher daemon.
</description>
<command>npm install -D chokidar</command>
</task>

<task type="write_file" name="create_watcher_daemon">
<description>
Create the `bin/gsd-watch.js` daemon script.
Logic:
1.  Check for existing instance via PID file.
2.  Initialize `sql.js` database (load existing or create new).
3.  Start `chokidar` watcher on project root (respecting ignores).
4.  On file change: debounce -> extract imports/exports (regex) -> update graph -> save DB to disk.
5.  Handle SIGINT/SIGTERM to close gracefully.
</description>
<file_path>bin/gsd-watch.js</file_path>
<content>
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chokidar = require('chokidar');
const initSqlJs = require('sql.js');
const { debounce } = require('lodash'); // Assuming lodash is available or implement simple debounce

// Configuration
const INTEL_DIR = path.resolve(process.cwd(), '.planning/intel');
const GRAPH_DB_PATH = path.join(INTEL_DIR, 'graph.db');
const PID_FILE = path.join(INTEL_DIR, 'gsd-watch.pid');
const LOG_FILE = path.resolve(process.cwd(), '.gemini/gsd-watch.log');

// Ensure directories exist
if (!fs.existsSync(INTEL_DIR)) fs.mkdirSync(INTEL_DIR, { recursive: true });
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

function log(msg) {
  const entry = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(LOG_FILE, entry);
  if (process.env.GSD_DEBUG) console.log(entry.trim());
}

// PID Management
if (fs.existsSync(PID_FILE)) {
  const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'), 10);
  try {
    process.kill(pid, 0);
    console.error(`Daemon already running (PID: ${pid})`);
    process.exit(1);
  } catch (e) {
    log('Stale PID found. removing.');
    fs.unlinkSync(PID_FILE);
  }
}
fs.writeFileSync(PID_FILE, process.pid.toString());

log('Daemon starting...');

async function start() {
  const SQL = await initSqlJs();
  let db;

  if (fs.existsSync(GRAPH_DB_PATH)) {
    const filebuffer = fs.readFileSync(GRAPH_DB_PATH);
    db = new SQL.Database(filebuffer);
    log('Loaded existing graph DB.');
  } else {
    db = new SQL.Database();
    // Initialize Schema (matching hooks/gsd-intel-index.js)
    db.run(`
      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        type TEXT,
        path TEXT,
        hash TEXT,
        metadata TEXT
      );
      CREATE TABLE IF NOT EXISTS edges (
        source TEXT,
        target TEXT,
        type TEXT,
        metadata TEXT,
        PRIMARY KEY (source, target, type)
      );
    `);
    log('Created new graph DB.');
  }

  const saveDb = debounce(() => {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(GRAPH_DB_PATH, buffer);
    log('Graph saved to disk.');
  }, 1000);

  // Watcher
  const watcher = chokidar.watch('.', {
    ignored: [
      /(^|[\]/)\/\..*/, // dotfiles
      '**/node_modules/**',
      '**/dist/**',
      '**/.planning/**',
      '**/.gemini/**'
    ],
    persistent: true,
    ignoreInitial: true // Lazy mode
  });

  watcher.on('add', path => processFile(path, db, saveDb));
  watcher.on('change', path => processFile(path, db, saveDb));
  watcher.on('unlink', path => removeFile(path, db, saveDb));

  log('Watching for changes...');

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  function cleanup() {
    log('Stopping...');
    watcher.close();
    fs.unlinkSync(PID_FILE);
    process.exit(0);
  }
}

function processFile(filePath, db, save) {
  if (!filePath.endsWith('.js') && !filePath.endsWith('.ts')) return;
  log(`Processing: ${filePath}`);
  // TODO: Add regex parsing logic here (similar to gsd-intel-index.js)
  // For now, just a placeholder to verify architecture
  save();
}

function removeFile(filePath, db, save) {
  log(`Removed: ${filePath}`);
  // TODO: Remove nodes from DB
  save();
}

start().catch(err => {
  log(`Error: ${err.message}`);
  process.exit(1);
});
</content>
</task>

<task type="replace" name="update_build_script">
<description>
Update `scripts/build-hooks.js` to include bundling for `bin/gsd-watch.js`.
</description>
<file_path>scripts/build-hooks.js</file_path>
<instruction>Add 'bin/gsd-watch.js' to the entry points or build configuration.</instruction>
<old_string>
// Logic to build hooks
</old_string>
<new_string>
// Logic to build hooks and daemon
</new_string>
</task>

<task type="replace" name="add_watch_script">
<description>
Add `gsd-watch` script to `package.json`.
</description>
<file_path>package.json</file_path>
<instruction>Add "gsd-watch" command to scripts.</instruction>
<old_string>
  "scripts": {
</old_string>
<new_string>
  "scripts": {
    "gsd-watch": "node bin/gsd-watch.js",
</new_string>
</task>

## Verification

<criteria>
1. `npm run gsd-watch` starts the process and creates `.planning/intel/gsd-watch.pid`.
2. Killing the process removes the PID file.
3. Modifying a file triggers a log entry in `.gemini/gsd-watch.log`.
4. `graph.db` is created if it doesn't exist.
</criteria>

<must_haves>
- PID file management must be robust (handle stale PIDs).
- Must respect .gitignore and default ignores.
- Must persist graph to disk.
</must_haves>
