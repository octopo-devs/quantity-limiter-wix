# AGENTS.md

Instructions for AI coding agents working in this repository.

## What this repo is

This is a **workflow boilerplate**, not a product codebase. It installs an AI-assisted development workflow into a host project via custom skills (`.claude/skills/`) and a `docs/features/` scaffold. The host project provides the actual source code.

## The 4-phase workflow

Every feature goes through these phases sequentially. **Human review is mandatory between each phase.**

```
Phase 1: Explore Story    →  Phase 2: Create Test Case  →  Phase 3: Implement  →  Phase 4: Verify & Sync
/explore-story               /create-test-case              /brainstorming         /self-test
```

### Phase 1 — Explore Story

- **Command:** `/explore-story <story description or Jira link>`
- **What it does:** Research the app, verify feasibility, split story if too large (INVEST principles), write `US-<id>-<name>.md` with status `DRAFT`, append open questions for PO.
- **Hard rules:**
  - BLOCKED feasibility = halt, no file written, return proof.
  - Open questions go in the story file (business-logic only), not in chat.
  - Never split along FE/BE layers.
- **Output:** `docs/features/<group>/US-<id>-<name>/US-<id>-<name>.md`
- **Next:** Human sends to PO, edits answers into file, then proceeds to Phase 2.

### Phase 2 — Create Test Case

- **Command:** `/create-test-case <path to US-*.md>`
- **What it does:** Read validated story, generate manual test cases split into HAPPY / EDGE / ERROR sections, all marked `PENDING`.
- **Hard rules:**
  - Never invent behavior. Missing info = stop, route back to `/explore-story`.
  - Test case IDs are section-prefixed: `-H01`, `-E01`, `-R01`. Append-only, never renumber.
  - Steps describe user actions ("Click **Export**"), not function/API calls.
- **Output:** `docs/features/<group>/US-<id>-<name>/TC-<id>-<name>.md`
- **Next:** Human reviews test cases, then proceeds to Phase 3.

### Phase 3 — Implement (TDD)

- **Command:** `/brainstorming read @<US-*.md> and test cases @<TC-*.md>`
- **What it does:** Chain of skills that auto-invoke each other:
  1. `sp-brainstorming` — reads both US + TC (mandatory), explores source code, proposes approaches, writes design spec, cross-checks against ALL TC IDs.
  2. `sp-writing-plans` — creates implementation plan with TDD steps from the spec.
  3. `sp-subagent-driven-development` or `sp-executing-plans` — executes plan using TDD (Red-Green-Refactor).
  4. `sp-finishing-a-development-branch` — verifies all tests pass, presents merge/PR options.
- **Hard rules:**
  - Tests before code (TDD enforced).
  - Brainstorming MUST read both US-*.md and TC-*.md. Spec must cover every TC ID.
  - No auto-commit at any step.
- **Artifacts:**
  - Specs: `docs/features/<group>/US-<id>-<name>/specs/<topic>-design.md`
  - Plans: `docs/features/<group>/US-<id>-<name>/plans/<feature-name>.md`

### Phase 4 — Verify & Sync

- **Command:** `/self-test`
- **What it does:** Run ALL manual test cases from Phase 2 against the real system, sync docs, flip story status.
- **Modes (picked per story):**
  - **Browser** — UI stories, uses Playwright with headed browser at localhost.
  - **Integration** — backend stories, real HTTP + DB, no mocks. Does not auto-clean environment.
  - **Mixed** — both modes for stories spanning FE + BE.
- **Checkpoints (ordered, crash-safe, re-runnable):**
  - A: Run all test cases (never halt on first failure)
  - B: Record results (PASS/FAIL/BYPASS) in TC-*.md
  - C: Sync story + TC with shipped code; re-run any edited cases
  - D: Regression smoke on adjacent stories
  - E: Update indexes and cross-refs
  - F: Flip status — all non-BYPASS pass = `DONE`, any FAIL = stays `DRAFT`
- **Hard rules:**
  - Only `/self-test` can flip story to `DONE`.
  - Never auto-fix code. Report failures, human decides.
  - Detect default branch dynamically (never hardcode `master`/`main`).

## Artifact layout

All artifacts for a story live in one folder:

```
docs/features/
  index.md                              # top-level index
  <group>/
    index.md                            # per-group index
    US-<id>-<name>/                     # one folder per story
      US-<id>-<name>.md                 # user story (Phase 1)
      TC-<id>-<name>.md                 # test cases (Phase 2)
      specs/<topic>-design.md           # design docs (Phase 3)
      plans/<feature-name>.md           # implementation plans (Phase 3)
```

- `<group>` = feature area (e.g. `dispute`)
- `<id>` = Jira ticket ID + slug (e.g. `SP25`)
- Story status: `DRAFT` | `DONE`
- Test case result: `PENDING` | `PASS` | `FAIL` | `BYPASS`

## Full vs. light workflow

| Workflow | Phases | When to use |
|----------|--------|-------------|
| **Full** | 1 → 2 → 3 → 4 | New features, complex logic, multi-screen flows |
| **Light** | 2 → 3 → 4 (skip Phase 1) | Trivial changes where story is already clear |

Phase 2 is always required — `/self-test` needs `TC-*.md` to verify.

**When in doubt, use full workflow.**

## Critical rules

1. **No auto-commit.** No skill commits automatically. Human uses `/ship-it` or manual git.
2. **Human review between phases.** Each phase stops and waits.
3. **Tests before code** in Phase 3 (TDD).
4. **Phase 3 brainstorming reads both US + TC.** Spec self-review cross-checks every TC ID.
5. **Manual tests only in Phases 1/2/4.** Unit tests and E2E belong to Phase 3 TDD.
6. **Feasibility is a hard-stop gate.** BLOCKED = no file, return proof.
7. **`/self-test` never halts on first failure.** Run all, record individually, then verdict.
8. **`/self-test` uses real data.** No mocks, no stubs. Dirty env = stop and ask human.
9. **All artifacts in story folder.** No separate `docs/superpowers/` directory.

## Plugins

Configured in `.claude/settings.json`:
- `atlassian` — fetch Jira stories for `/explore-story`
- `context7` — fetch current library/framework docs instead of relying on training data

## Commit style

Short, lowercase prefixes: `workflow:`, `ci:`, `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, etc.
