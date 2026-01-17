# Codebase Concerns

**Analysis Date:** 2026-01-14

## Tech Debt

**Synchronous I/O in bin/install.js:**
- Issue: Uses `fs.readFileSync` and `fs.writeFileSync`
- Why: Simple, linear installation flow
- Impact: Potential blocking on very large filesystems, though unlikely in this context
- Fix approach: Refactor to `fs.promises` if performance becomes an issue

**Fragile Path Replacement:**
- Issue: `bin/install.js` uses regex `/~\/\.gemini\//g` to rewrite paths
- Why: To support installation from local source vs global package
- Impact: If path conventions change in the source, the installer may fail to rewrite correctly
- Fix approach: Use more robust path normalization or a configuration-driven mapping

## Known Bugs

**Complex Orchestration Verification:**
- Symptoms: Difficult to verify that parallel agents in `map-codebase.md` or `execute-phase.md` are working correctly without running the full flow
- Trigger: Modification of workflow aggregation logic
- Workaround: Manual verification during development
- Root cause: Lack of automated integration tests for prompt workflows

## Security Considerations

**Shell Execution Trust:**
- Risk: The system generates and executes shell commands via the AI agent
- Current mitigation: Workflow instructions emphasize safety and user confirmation
- Recommendations: Implement a "dry-run" mode for complex workflows

## Performance Bottlenecks

**Agent Result Aggregation:**
- Problem: Collecting results from 4 parallel agents involves waiting for all to finish before proceeding
- Cause: Synchronous step in `map-codebase.md`
- Improvement path: Allow incremental document writing as agents complete

## Fragile Areas

**Workflow Dependency on Output Format:**
- Why fragile: Aggregation logic in `collect_results` relies on agents following specific formatting in their output
- Common failures: Agent drift in response format can break parsing/aggregation
- Safe modification: Use structured output (JSON) if supported by the host agent

## Missing Critical Features

**Automated Self-Tests:**
- Problem: No automated test suite for the GSD system itself
- Current workaround: Manual "dogfooding" by using GSD to develop GSD
- Blocks: Rapid regression testing of installer or workflow changes

## Test Coverage Gaps

**Installer Logic:**
- What's not tested: Path replacement, file copying, and permission handling in `bin/install.js`
- Priority: Medium
- Difficulty to test: Requires filesystem mocking or containerized test environment

---

*Concerns audit: 2026-01-14*
*Update as issues are fixed or new ones discovered*
