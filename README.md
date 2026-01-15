<div align="center">

# GET SHIT DONE (Gemini Edition)

**A light-weight and powerful meta-prompting, context engineering and spec-driven development system for Gemini CLI.**

**Solves context rot — the quality degradation that happens as Gemini fills its context window.**

[![npm version](https://img.shields.io/npm/v/get-shit-done-gemini?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-gemini)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

<br>

```bash
npx get-shit-done-gemini
```

**Works on Mac, Windows, and Linux.**

<br>

![GSD Install](assets/terminal.svg)

<br>

*"If you know clearly what you want, this WILL build it for you. No bs."*

*"By far the most powerful addition to my Gemini CLI. Nothing over-engineered. Literally just gets shit done."*

<br>

**Adapted for Gemini CLI from the original GSD system by TÂCHES.**

[Why This Fork?](#why-this-fork) · [How It Works](#how-it-works) · [Commands](#commands) · [Credits](#credits)

</div>

---

## Why This Fork?

This project is a dedicated fork of the excellent [Get Shit Done](https://github.com/glittercowboy/get-shit-done) system, originally built for Claude Code.

While the original system revolutionized the workflow for Claude users, this fork brings the same powerful context engineering and spec-driven development principles to the **Gemini CLI**. We've adapted the prompts, templates, and installation logic to ensure seamless integration with Google's Gemini environment.

The philosophy remains the same: **No enterprise roleplay bullshit. Just an incredibly effective system for building cool stuff consistently.**

---

## What It Does

Vibecoding has a bad reputation. You describe what you want, AI generates code, and you get inconsistent garbage that falls apart at scale.

GSD fixes that. It's the context engineering layer that makes Gemini CLI reliable. Describe your idea, let the system extract everything it needs to know, and let Gemini CLI get to work.

### The Problem it Solves
- **Context Rot:** Prevents Gemini from losing the plot as the conversation grows.
- **Specification:** Forces clarity before code is written.
- **Verification:** Built-in checks to ensure what was built is what was asked for.

---

## Getting Started

```bash
npx get-shit-done-gemini
```

That's it. Verify with `/gsd:help` inside your Gemini CLI interface.

### Recommended: Skip Permissions Mode

GSD is designed for frictionless automation. Run Gemini CLI with:

```bash
gemini --dangerously-skip-permissions
```

> [!TIP]
> This is how GSD is intended to be used — stopping to approve `date` and `git commit` 50 times defeats the purpose.

---

## How It Works

### 1. Start with an idea

```
/gsd:new-project
```

The system asks questions. Keeps asking until it has everything — your goals, constraints, tech preferences, edge cases. You go back and forth until the idea is fully captured. Creates **PROJECT.md**.

### 2. Define requirements & Create Roadmap

```
/gsd:define-requirements
/gsd:create-roadmap
```

Scope what's v1, what's v2. Produces **ROADMAP.md** (Phases from start to finish) and **STATE.md** (Living memory that persists across sessions).

### 3. Plan and execute phases

```
/gsd:plan-phase 1      # System creates atomic task plans
/gsd:execute-phase 1   # Parallel agents execute all plans
```

Each phase breaks into 2-3 task plans. Each plan runs in a fresh subagent context — tokens purely for implementation, zero degradation.

### 4. Ship and iterate

```
/gsd:complete-milestone   # Archive v1, prep for v2
```

Ship your MVP in a day. Add features. Insert hotfixes. The system stays modular — you're never stuck.

---

## Commands

### Setup
- `/gsd:new-project` - Initialize a new project
- `/gsd:research-project` - Research domain ecosystem
- `/gsd:define-requirements` - Scope v1/v2 requirements
- `/gsd:create-roadmap` - Create roadmap
- `/gsd:map-codebase` - Map existing codebase (brownfield)

### Execution
- `/gsd:plan-phase [N]` - Generate task plans for phase
- `/gsd:execute-phase <N>` - Execute plans in parallel
- `/gsd:execute-plan` - Run single plan
- `/gsd:progress` - Check status

### Utilities
- `/gsd:add-todo [desc]` - Capture ideas
- `/gsd:check-todos [area]` - Manage tasks
- `/gsd:debug [desc]` - Systematic debugging
- `/gsd:help` - Show all commands

---

## Credits & Standing on Shoulders of Giants

This project serves as a bridge for Gemini users to access the incredible meta-prompting system designed by **TÂCHES** (glittercowboy).

**Original Project:** [Get Shit Done](https://github.com/glittercowboy/get-shit-done)
**Original Author:** TÂCHES

We acknowledge and deeply appreciate the original work that made this adaptation possible. The core philosophy, structure, and brilliance of GSD belong to its original creator. This fork merely translates that brilliance into the language of Gemini.

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<div align="center">

**Gemini CLI is powerful. GSD makes it reliable.**

</div>