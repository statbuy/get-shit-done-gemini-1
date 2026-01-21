# Stack Research: GSD Ultra

## Filesystem Watcher
- **Recommended:** `chokidar`.
- **Rationale:** Superior cross-platform reliability compared to native `fs.watch`. Better support for recursive watching and handling of atomical writes (common in modern editors). Essential for a daemon that must remain stable for hours.

## SQLite Integration
- **Recommended:** `sql.js` (WASM/ASM.js).
- **Rationale:** Maximum portability for `npx`-distributed tools. Avoids native compilation issues (`node-gyp`) that plague `better-sqlite3` or `sqlite3` on diverse user machines.
- **Current State:** Already in use via `hooks/gsd-intel-index.js`. We will build upon this foundation for the daemon.

## Codebase Intelligence Patterns
- **Pattern:** Simple Graph.
- **Schema:** 
  - `nodes`: Store file paths, purposes, and symbol metadata (JSON).
  - `edges`: Track `depends_on`, `imports`, and `exports` relationships.
- **Parsing:** Use standard regex-based extraction for Phase 1; investigate `tree-sitter` for Phase 2 semantic depth.

---
*Research Date: 2026-01-20*
