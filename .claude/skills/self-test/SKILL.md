---
name: self-test
description: >
  Use this skill to verify a finished implementation against its manual test cases AND sync the related story documentation with the shipped code in one pass. Trigger when the user mentions "self-test", "run tests", "test feature", "verify implementation", "run test cases", "sync docs", or after completing the implementation of a story/task. This skill handles **manual tests only** — unit tests and E2E specs are owned by the superpowers TDD cycle in Phase 3, not here. Always run this skill before declaring a story done — it is the only skill that is allowed to mark a user story as `status: DONE`.
---

# self-test

Run the manual test cases for a story against the real running system, record each result, sync the user story + test case file + indexes with the shipped code, and mark the story `DONE` only if every non-BYPASS case passes.

This skill **only cares about manual tests** — the `TC-[id]-[name].md` file that `/create-test-case` produced. Code-level tests (Vitest unit tests, Playwright E2E specs) are written and maintained by the superpowers `test-driven-development` flow in Phase 3. This skill does not read, write, or run them.

---

## Two execution modes

A test case can target either a user-facing UI or a backend surface. This skill picks the mode per story, not per case:

- **Browser mode** — the story produces something a user sees or clicks. Use `/playwright-cli` to drive a headed browser at localhost. This is the default mode whenever the story has any frontend surface.
- **Integration mode** — the story is backend-only (API endpoint, job, webhook, data pipeline, migration, SDK). No browser. Hit real HTTP endpoints with `curl` / the host project's HTTP client, inspect real responses, and read the real database or queue to confirm side effects. Use real data and real API calls — do not mock.

If the story touches both (e.g., an API plus a UI that consumes it), run the browser flow for the UI cases and integration calls for the pure API cases. The TC file does not need to split them; pick the right tool per case.

---

## Input

- A feature that has been implemented on the current branch
- The corresponding user story at `docs/features/[group]/US-[id]-[name]/US-[id]-[name].md`
- The corresponding manual test cases at `docs/features/[group]/US-[id]-[name]/TC-[id]-[name].md`

Scope detection:

1. If the user names a story / feature explicitly → use it.
2. Otherwise infer scope from the diff against the repo's default branch. Detect the default branch dynamically — never hardcode `master` or `main`:

   ```bash
   DEFAULT_BRANCH=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@')
   # fallbacks if origin/HEAD is not set:
   #   git config --get init.defaultBranch
   #   pick `main` if it exists, else `master`
   git diff "$DEFAULT_BRANCH"...HEAD
   ```

   Fall back to `git diff` (working tree) only if the branch has no divergence from the default branch.
3. Map changed files to stories via `docs/features/` and ask the user to confirm if the inference is ambiguous.

---

## Output

| Artifact          | Path                                                     | Action                |
| ----------------- | -------------------------------------------------------- | --------------------- |
| User Story        | `docs/features/[group]/US-[id]-[name]/US-[id]-[name].md` | Update + status flip  |
| Test Cases        | `docs/features/[group]/US-[id]-[name]/TC-[id]-[name].md` | Update test results + structure |
| Group Index       | `docs/features/[group]/index.md`                         | Update                |
| Features Index    | `docs/features/index.md`                                 | Update                |

**Not in scope:** `src/__tests__/`, `tests/e2e/`, or any other code-level test file. Those belong to Phase 3 (superpowers / TDD). If they are out of sync with the shipped code, that is a Phase 3 bug — report it, do not fix it here.

---

## Core contract

1. **Never halt on the first failing case.** Run every test case (happy → edge → error), record each outcome, and only after the full run do you decide the story-level verdict.
2. **Mark failures honestly.** A FAIL stays a FAIL — do not retry with different steps until it passes, and do not "fix" test cases to make them green. The human decides what to do with a failure.
3. **Status is two-state: `DRAFT` or `DONE`.** Mark the story `DONE` only when every non-BYPASS case is PASS in the same run. If even one case is FAIL, the story status must **not** flip to DONE — it stays (or reverts to) `DRAFT`. There is no `IN_PROGRESS`.
4. **Run in ordered, re-runnable checkpoints.** Step 3 (run tests) → Step 4 (write results to disk) → Step 5 (sync docs) → Step 6 (update indexes) → Step 7 (flip status). If a later checkpoint fails, the earlier ones are already on disk and a re-run can resume without re-executing what already landed.
5. **Do not fix production code, unit tests, or E2E specs.** This skill verifies and documents manual test cases only. If manual tests fail, report and stop. If unit/E2E tests fail, flag them as a Phase 3 follow-up and stop.
6. **Use real data and real calls.** Never mock the backend in integration mode. Never replace a real browser click with a synthetic DOM event in browser mode. If the environment cannot support real calls, stop and tell the user.
7. **Integration mode does not auto-clean up.** If the real DB / queue / external system is dirty from a prior run (unique constraint, duplicate email, leftover record), stop and tell the user to reset the environment manually. Do not delete records on the user's behalf, do not mutate seed data to work around conflicts, and do not mask the conflict by picking a new identifier silently.
8. **`DONE` is not a regression detector.** This skill only re-verifies stories the user points it at. A `DONE` story that silently regresses elsewhere in the codebase will not be caught until someone explicitly runs `/self-test` against it. That is a known limitation — call it out in the report when it feels relevant, but do not pretend to cover it.

---

## Steps

### Step 1 — Locate and load artifacts

- Read the user story file `US-[id]-[name].md` — grab acceptance criteria, steps, `feasibility` block, current `status`
- Read the test case file `TC-[id]-[name].md` — parse every case into `{id, type, precondition, steps, expected_result, test-result, test-result-note}`
- If the test case file does not exist:
  - If the story file is also missing → stop and tell the user to run `/explore-story`
  - If the story exists but has no TC file → stop and tell the user to run `/create-test-case`
- **Skip any test case marked `BYPASS`** — carry the existing result forward, do not execute, and count them separately in the final report
- Decide the execution mode (Browser / Integration / mixed) based on the story and its cases. If ambiguous, ask the user.

### Step 2 — Analyze shipped changes

Detect the default branch dynamically (never hardcode `master` or `main`):

```bash
DEFAULT_BRANCH=$(git symbolic-ref --short refs/remotes/origin/HEAD 2>/dev/null | sed 's@^origin/@@')
# fallbacks, in order, if origin/HEAD is not set:
#   git config --get init.defaultBranch
#   check `git show-ref --verify refs/heads/main` then refs/heads/master
```

Read git state to understand what actually shipped:

```bash
git diff "$DEFAULT_BRANCH"...HEAD --stat
git diff "$DEFAULT_BRANCH"...HEAD
git log "$DEFAULT_BRANCH"..HEAD --oneline
```

If the branch has no divergence from the default branch (uncommitted local changes only):

```bash
git diff --stat
git diff
```

From the diff, note:

1. Which files changed and how they map to the story being verified
2. Whether the change is net-new behavior, a behavior shift, a refactor, or a bug fix
3. Any acceptance criterion or manual test case whose *expected* behavior the diff appears to contradict — flag these so Step 4 can update them

Do **not** read or reason about `src/__tests__/` or `tests/e2e/` files as part of this step — they are Phase 3 territory.

### Step 3 — Run the manual test cases (Checkpoint A)

**Checkpoint A goal:** produce an in-memory result per case. Nothing is written to disk yet. If this checkpoint fails midway (e.g., dev server dies), a re-run re-executes only the cases that did not finish.

**Integration-mode pre-flight:** before the first case, do a minimal sanity probe (one safe read against the real API, or a `SELECT 1` against the DB) to detect dirty state. If you hit a unique-constraint error, a leftover test record that blocks the first case, or a mismatched schema, **stop immediately and tell the user to reset the environment manually** — per Core Contract #7, this skill never silently cleans up or mutates identifiers to work around conflicts.

Run order (regardless of mode):

1. **Happy path** — all of these first
2. **Edge case** — after happy paths
3. **Error case** — last

**Browser mode (UI-facing stories):**

- Use `/playwright-cli` to open a **headed** browser at localhost (or whatever host the user provides)
- Execute each case by following `steps` literally — click what the steps say to click, type what they say to type
- Compare the observed UI (text, toasts, navigation, disabled states) against `expected_result`
- Take a screenshot on any failing case and save it under `docs/features/[group]/US-[id]-[name]/artifacts/`

**Integration mode (backend-only stories):**

- No browser. Use `curl`, `httpie`, or the host project's HTTP client to make the exact request the case describes, against the real running backend
- Use **real data** — fixtures from the host project, real records created via the real API, or pre-existing seed data. Do not mock the database, queue, cache, or any downstream service
- After the request, read the real side effects: response body + status + headers, database rows, queue entries, log lines, webhook deliveries — whichever the case's `expected_result` references
- For flows that span multiple calls (e.g., create → verify → delete), execute every call in order and assert each intermediate state

**For every case (both modes):**

- Record one of:
  - `PASS` — observed outcome matches `expected_result`; `test-result-note: ""`
  - `FAIL` — observed outcome does not match; `test-result-note` gets a short symptom description (what you actually saw, not a guess at the root cause)
  - `BYPASS` — never set here; only carried forward from an existing BYPASS entry
- **Keep going even after a FAIL.** Record it and move to the next case.
- Do not edit the case's `steps` or `expected_result` to make a red case go green. Reconciliation happens in Step 5, and only when the *shipped behavior* is the new source of truth.

### Step 4 — Write test results to disk (Checkpoint B)

**Checkpoint B goal:** persist every result from Checkpoint A into the `TC-*.md` file before touching any other doc. This is the safety net — if Checkpoint C (docs sync) or Checkpoint E (status flip) fails later, the test results are already recorded and a re-run will not re-execute cases that already have a fresh result.

- Update each case's `test-result` and `test-result-note` fields in place
- Preserve the `TC-[id]-[name]-H01 / -E01 / -R01` section-prefixed numbering — never renumber
- Do not edit `steps`, `expected_result`, or `precondition` here (that belongs to Checkpoint C)
- Stamp a short `Last run: YYYY-MM-DD` line at the top of the TC file

If this write fails (file locked, merge conflict, disk error), stop and tell the user. Do not continue to Checkpoint C with uncommitted results in memory.

### Step 5 — Sync user story + test cases to shipped reality (Checkpoint C)

Before writing new results to disk, reconcile the docs with what actually shipped:

**User Story (`US-[id]-[name].md`):**

- If the acceptance criteria, steps, or notes no longer match the shipped code → update them in place. Describe only what a user (or API consumer, for BE stories) now experiences — never internal implementation details.
- If a net-new user-visible or API-visible behavior was added that the story does not mention → add it to the acceptance criteria and steps.
- If the change is a pure internal refactor with no observable effect → leave the story body untouched.
- Add a `Last synced: [YYYY-MM-DD]` line at the bottom of the story.

**Test Cases (`TC-[id]-[name].md`):**

- If an existing case's `expected_result`, `steps`, or `precondition` no longer matches what the system now does → update it, then re-run that case in this same invocation and record the fresh result.
- If the shipped code has a new path, boundary, or error branch that is missing from the TC file → add a new case in the appropriate section (HAPPY / EDGE / ERROR), then run it in the same pass.
- Never delete existing cases that still describe valid behavior — mark them BYPASS with a reason instead.
- Preserve section ordering (HAPPY → EDGE → ERROR) and append-only numbering (`TC-[id]-[name]-NN`).

If a reconciliation edit changes what a case is testing, you must run the updated case in this same self-test invocation — do not leave docs updated but results stale. Rerun it, then write the fresh result back to the TC file (re-doing Checkpoint B for just that case) before proceeding.

**Preserve the section-prefixed numbering.** Any new case added during reconciliation takes the next free number within its section: new HAPPY → next `-H`, new EDGE → next `-E`, new ERROR → next `-R`. Do not renumber existing cases.

### Step 6 — Regression smoke (Checkpoint D)

- Read `docs/features/index.md` and the relevant `docs/features/[group]/index.md` to find adjacent stories that touch the same screens, endpoints, or data
- If the git diff plausibly affects any of them, do a short smoke check — one happy path per adjacent story, in the appropriate mode — and note it in the final report under `regression_risk`

### Step 7 — Update indexes and cross-references (Checkpoint E)

- `docs/features/[group]/index.md` — refresh the row for this story: count summary (`12 cases — 6 happy / 4 edge / 2 error`), link to sibling TC file, current status
- `docs/features/index.md` — refresh story counts / status if surfaced there
- Verify bidirectional links between story, test case file, and both index layers use correct relative paths
- Flag any broken link you cannot fix without human input

### Step 8 — Compute the story verdict and update status (Checkpoint F)

Status is two-state: `DRAFT` or `DONE`. Compute the verdict from the persisted results in the TC file (not from memory — re-reading keeps Checkpoint F idempotent on a resumed run):

```
all_non_bypass_cases_passed?  → story.status = DONE
any_fail?                     → story.status = DRAFT  (including regressions of previously-DONE stories)
```

Update the `status` field in `US-[id]-[name].md`:

- `DONE` — **only** when every non-BYPASS manual test case is `PASS`
- `DRAFT` — at least one FAIL, or blocked on a human decision, or a previously-DONE story that just regressed

A regressed `DONE` story drops back to `DRAFT`. That's intentional: `DRAFT` now means "not verified end-to-end right now" — it covers both "not yet implemented" and "regressed since last run". The `Last synced` stamp + the TC file's fresh FAIL notes are enough context for a reader to tell the two apart.

The status change must be reflected in both index files so the project view is accurate.

### Step 9 — Compile the report

Present a single combined verify + sync report:

```
Self-Test + Sync Report
─────────────────────────────────
Story:               docs/features/[group]/US-[id]-[name]/US-[id]-[name].md
Mode:                Browser | Integration | Mixed
Story status:        DONE | DRAFT
Previous status:     DRAFT | DONE
Verdict:             PASS | FAIL

Manual test cases:
  Passed:            N
  Failed:            N
  Bypassed:          N
  Regression risk:   LOW | MEDIUM | HIGH

Docs synced:
  Story updated:     yes | no
  Test cases edited: [list of TC IDs] | none
  Test cases added:  [N new cases]
  Indexes updated:   yes | no

Checkpoints completed: A B C D E F   (missing letters = interrupted, safe to re-run)

Details:
  TC-[id]-[name]-H01 (happy_path): PASS
  TC-[id]-[name]-E01 (edge_case):  PASS
  TC-[id]-[name]-R01 (error_case): FAIL — [short symptom]
  ...
```

If this run flipped a previously-`DONE` story back to `DRAFT`, call it out at the top of the report with a **REGRESSION** tag so the reader does not mistake it for a first-time failure.

### Step 10 — If there are any failures

- List every FAIL with its symptom note and the file location of the failing artifact
- **Do not auto-fix production code.** Report and stop — the human decides the next step: fix code, adjust the test case, or BYPASS
- Tell the user explicitly that `status` was **not** flipped to `DONE` because of the failures, and what they need to resolve to unblock completion

---

## Rules

- **Manual tests only.** Unit tests and E2E specs are Phase 3 territory (superpowers TDD). If you notice they are stale, flag it in the report — do not touch them here.
- **Browser is optional.** Only use it when the story has a user-facing surface. Backend-only stories get integration mode with real HTTP calls and real data.
- **No mocks, no stubs, no fake data.** Always talk to the real running system. If the environment cannot support that, stop and ask the user.
- **Integration mode does not clean up.** If the environment is dirty on entry, stop and tell the user to reset it manually. Do not delete records, mutate identifiers, or mask conflicts silently. The trade-off is accepted: human does reset, skill stays honest.
- **Do not invent behavior.** Only document what the code actually does — read the implementation if unsure.
- **Preserve existing structure.** Match the formatting, heading style, and numbering of existing doc files. Append new test cases using section-prefixed IDs (`-H`, `-E`, `-R`). Never renumber old ones.
- **Default branch is detected, not assumed.** Never hardcode `master` or `main`. Detect with `git symbolic-ref` / `git config init.defaultBranch` / existence check.
- **Ordered checkpoints, each re-runnable.** Run tests → write TC results → sync docs → smoke → indexes → flip status. A crash in a later checkpoint must not lose earlier work. A re-run must be able to resume from the first incomplete checkpoint without re-executing anything that already landed on disk.
- **Status is DRAFT or DONE only.** No `IN_PROGRESS`. A regression on a previously-`DONE` story drops it back to `DRAFT` and is tagged **REGRESSION** in the report.
- **Regressions are not auto-detected.** This skill only verifies stories the user points it at. A `DONE` story silently regressing somewhere else in the codebase will not be caught — known limitation, not a bug.
- **Minimal edits.** Only touch sections actually affected by the diff.
- **Truth over green.** Never tweak a test case until it passes — if the test and the shipped behavior disagree, update exactly one side with a clear reason in the report and rerun once.
- **`DONE` is earned, not granted.** Only flip a story to `DONE` when every non-BYPASS manual case is green in the same run.
