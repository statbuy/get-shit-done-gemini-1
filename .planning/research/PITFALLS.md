# Pitfalls Research: GSD Ultra

## Performance & Bloat
- **CPU Spikes:** Initial scans must aggressively respect `.gitignore` and hardcoded exclusions (node_modules, .git) to avoid blocking the user's machine.
- **DB Corruption:** `sql.js` uses a read-modify-write pattern. We must ensure file-level locking or single-writer patterns to prevent corruption if the daemon and a CLI command try to update simultaneously.

## Model Reliability
- **Context Drunkenness:** While Gemini has a 1M window, filling it with irrelevant code can "dilute" the attention on the primary task. Tiering and relevance-filtering are mandatory.
- **Hallucination:** "Big Context" doesn't eliminate hallucinations; it shifts them to "API Drift." The system must periodically re-verify its understanding of types.

---
*Research Date: 2026-01-20*
