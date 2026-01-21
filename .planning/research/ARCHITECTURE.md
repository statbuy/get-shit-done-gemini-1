# Architecture Research: GSD Ultra

## Sidecar Architecture
- **Daemon:** A long-running process (`npm run gsd-watch`) that monitors the filesystem and maintains the SQLite graph.
- **CLI:** Ephemeral sessions that read the state maintained by the daemon.
- **Communication:** Via shared file state in `.planning/intel/`. This avoids complex IPC while ensuring high performance.

## Prompt Tiering Strategy
- **Layer 1 (Session Start):** Injected `<codebase-intelligence>` summary (<500 tokens).
- **Layer 2 (Planning):** Injected "Reference Tiers" containing entire relevant subdirectories, utilizing the 1M+ token window.
- **Layer 3 (Execution):** Atomic tasks (<50% context) for peak reasoning.

## Build Order
1. **Phase 1:** Core Watcher Daemon & SQLite Graph.
2. **Phase 2:** Big Context Refactor (Planner logic).
3. **Phase 3:** Multimodal Verification Workflow.
4. **Phase 4:** Self-Healing Style Enforcement.

---
*Research Date: 2026-01-20*
