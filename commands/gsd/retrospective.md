---
name: gsd:retrospective
description: Analyze recent work and update style guide
---

<objective>
Analyze recent git history and project evolution to identify patterns, anti-patterns, and improvements for the `GSD-STYLE.md` guide.
</objective>

<process>
1. **Extract History**
   Identify the range of work to analyze.

   ```bash
   # Get the latest tag (e.g., v1.0.0)
   LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

   if [ -z "$LATEST_TAG" ]; then
     echo "No tags found. Analyzing last 50 commits."
     RANGE="-n 50"
   else
     echo "Analyzing changes since $LATEST_TAG"
     RANGE="$LATEST_TAG..HEAD"
   fi

   # Capture relevant logs (fix, feat, refactor, revert)
   GIT_LOGS=$(git log $RANGE --pretty=format:"%h %s" | grep -E "fix|feat|refactor|revert")

   # Capture style guide
   STYLE_GUIDE=$(cat GSD-STYLE.md 2>/dev/null || echo "No style guide found.")
   ```

2. **Invoke Analyst**
   Spawn the retrospective agent to analyze the logs.

   ```
   Task(
     prompt="Analyze these git logs and the current style guide. Identify recurring issues or needed updates.

     Git Logs:
     $GIT_LOGS

     Current Style Guide:
     $STYLE_GUIDE

     Output specific actionable updates for GSD-STYLE.md.",
     subagent_type="gsd-retrospective-agent"
   )
   ```

3. **Verify and Apply**
   Review the agent's findings.

   The agent should have proposed specific changes or created a draft.

   **Checkpoint:**
   Ask the user to confirm the updates.

   ```
   Checkpoint(
     type="human-verify",
     description="Review proposed style guide updates",
     verification_steps="Check GSD-STYLE.md or the agent's output for correctness."
   )
   ```

   If approved, ensure changes are saved to `GSD-STYLE.md`.
</process>
