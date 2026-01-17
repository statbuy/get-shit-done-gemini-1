# Gemini Conversion & Fork Maintenance

This document outlines the automated conversion process used to maintain the **Get Shit Done (GSD)** system for the Gemini CLI, derived from the original [Claude-based repository](https://github.com/glittercowboy/get-shit-done).

## Overview

The `get-shit-done-gemini` project is a "hard fork" that adapts the upstream GSD system for use with Google's Gemini CLI. To keep this fork in sync with upstream improvements while maintaining Gemini-specific compatibility, we use an automated conversion script.

## The Conversion Script

**Script:** `scripts/gemini-convert.js`

This Node.js script is the engine of the fork. It is designed to be run immediately after pulling changes from the upstream repository.

### Usage

```bash
# 1. Pull from upstream
git pull upstream main

# 2. Run conversion
node scripts/gemini-convert.js
```

### What It Does

The script performs four key operations:

1.  **Normalization of Directory Structure**
    - Moves `.claude/` directories to `.gemini/`.
    - Moves rule files from `.gemini/rules/` to the project root `rules/` (required for distribution).
    - Moves command definition files (`.toml`) to `commands/gsd/`.

2.  **Branding & Content Replacement**
    - Scans all text files (`.md`, `.js`, `.json`, etc.).
    - Replaces instances of "Claude" with "Gemini".
    - Updates configuration paths (e.g., `~/.claude` to `~/.gemini`).
    - Updates CLI command references (e.g., `claude` to `gemini`).

3.  **TOML Configuration Generation**
    - Parses Markdown-based command definitions in `commands/gsd/`.
    - Extracts the YAML frontmatter and body content.
    - Generates corresponding `.toml` configuration files required by the Gemini CLI to recognize custom commands.

4.  **Package Manifest Enforcement (`package.json`)**
    - **Name:** Enforces `get-shit-done-gemini`.
    - **Author:** Enforces `Cars10` as the author of this fork.
    - **Contributors:** Adds `TÂCHES (Original Author)` to contributors.
    - **Repository:** Sets the URL to the fork: `https://github.com/Cars-10/get-shit-done-gemini.git`.
    - **Upstream:** Adds a reference to the original repo: `https://github.com/glittercowboy/get-shit-done.git`.
    - **Version:** Appends a `-g` suffix (e.g., `1.6.3-g`) to the version number to denote the Gemini fork.

## Fork Policy

To ensure transparency and traceability:

- **Version Numbers:** We match the upstream major.minor.patch version but append `-g` (e.g., `1.6.3` -> `1.6.3-g`).
- **Credit:** The original author (TÂCHES) is always listed in the `contributors` field.
- **Upstream Link:** The `package.json` maintains a link to the original repository.
