# Features Research: GSD Ultra

## Codebase Intelligence
- **Table Stakes:** Auto-indexing of exports/imports.
- **Differentiator:** "Semantic Purpose" — using a sub-agent to describe *why* a file exists, not just what symbols it contains.
- **Exposures:** The daemon will maintain `.planning/intel/index.json` and a SQLite graph DB. CLI tools will read these snapshots at startup.

## Multimodal UAT
- **Pattern:** `checkpoint:visual-verify`.
- **Interaction:**
  1. AI builds UI.
  2. AI creates a checkpoint task requesting a screenshot.
  3. AI ingests the screenshot and compares it against the `<objective>` and `<done>` criteria.
  4. AI self-corrects if visual regressions are found.

## Context Refactor
- **Tiering:** 
  - **Reasoning Tier:** Active instructions and specific task data.
  - **Reference Tier:** Bulk codebase summaries and type definitions, leveraged by Gemini's 1M token window to prevent hallucinations.

---
*Research Date: 2026-01-20*
