# get-shit-done-gemini (Auto-update)

## What This Is

Developing automation scripts and workflows to keep the local GSD installation synchronized with the remote GitHub repository. This ensures that as the meta-prompting framework evolves, users can effortlessly pull updates and apply them to their local agent configuration.

## Core Value

Seamless synchronization of GSD logic without breaking local paths or losing custom configurations.

## Requirements

### Validated

- ✓ Node.js installer (`bin/install.js`) — existing
- ✓ Markdown-based commands and workflows — existing
- ✓ Gemini-specific TOML configurations — existing
- ✓ Git integration for state tracking — existing
- ✓ Multi-agent parallel orchestration — existing

### Active

- [ ] Develop `/gsd:update` command for manual synchronization
- [ ] Implement post-merge git hook to automate updates after `git pull`
- [ ] Add interactive confirmation prompt before applying updates
- [ ] Implement configuration preservation logic (don't overwrite local `config.json`)
- [ ] Add backup/archive logic to save current installation before updating
- [ ] Ensure full compatibility with macOS/Darwin environments

### Out of Scope

- Support for multiple remote repositories — deferred to v1 for simplicity
- Automatic conflict resolution — user is responsible for resolving git conflicts before updating
- Non-Darwin OS support — focused on user's current environment

## Context

The project is a conversion of a Gemini-based GSD framework for Gemini. Since the framework relies on path-mapped Markdown files installed in the user's home directory (`~/.gemini/`), updates from GitHub need to be carefully applied to re-trigger path replacements and maintain the local agent's behavior.

## Constraints

- **Tech Stack**: Must remain zero-dependency (Node.js built-ins only) — To maintain easy installation and minimal footprint.
- **Platform**: macOS/Darwin — The primary development and execution environment.
- **Safety**: Interactive by default — Must ask for confirmation before modifying the local agent's environment.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Use post-merge hook | Automates the trigger for updating after successful git pulls | — Pending |
| Interactive mode | Prioritizes safety and user awareness over silent execution | — Pending |
| Preserve local config | Ensures user-specific settings (like mode or parallelization) aren't lost | — Pending |
| Backup before update | Provides a clear rollback path if an update fails or introduces issues | — Pending |

---
*Last updated: 2026-01-14 after initialization*
