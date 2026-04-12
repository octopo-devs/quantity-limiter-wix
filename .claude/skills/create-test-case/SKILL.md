---
name: create-test-case
description: >
  Use this skill to generate manual end-to-end test cases for a user story that already exists — split into HAPPY, EDGE, and ERROR sections. Trigger when the user mentions "create-test-case", "write test cases", "generate test cases", or passes a path to an existing `US-[id]-[name].md` file. Always run this skill after `explore-story` (and after the PO has validated the story) and before any implementation work in the superpowers phase. This skill does not write code or run tests — its only output is the `TC-[id]-[name].md` file.
---

# create-test-case

Given an approved user story, produce a manual test case file with three clearly separated sections: **HAPPY**, **EDGE**, and **ERROR**.

This skill never researches the app, never splits stories, and never writes implementation code. If the story does not exist yet, the `explore-story` skill must run first.

---

## Input

- Path to an existing user story file: `docs/features/[group]/US-[id]-[name]/US-[id]-[name].md`

If the user mentions a story by name or ID without a path, locate it under `docs/features/` first. If no matching story exists, stop and tell the user to run `/explore-story` first — do not invent a story.

---

## Output

| Artifact       | Path                                                     |
| -------------- | -------------------------------------------------------- |
| Test Cases     | `docs/features/[group]/US-[id]-[name]/TC-[id]-[name].md` |
| Group Index    | `docs/features/[group]/index.md`                         |
| Features Index | `docs/features/index.md`                                 |

The test case file lives **in the same folder** as its user story file. This co-location is required — `/self-test` assumes it.

---

## Output Schema

```
test_cases:
  - id: TC-[id]-[name]
  - group: [group]
  - linked_story: US-[id]-[name]
  - summary:
      happy: N
      edge:  N
      error: N
  - cases:
      - id: TC-[id]-[name]-H01 | TC-[id]-[name]-E01 | TC-[id]-[name]-R01   # H = HAPPY, E = EDGE, R = ERROR
        test-result: PENDING
        test-result-note: ""
        type: happy_path | edge_case | error_case
        description: string
        precondition: string
        steps: list[string]
        expected_result: string
```

Every newly written test case starts with `test-result: PENDING` and an empty `test-result-note`. Only `/self-test` updates those fields later.

---

## The three sections

Every test case file must group its cases into three clearly labelled sections, in this order:

### 1. HAPPY — the standard successful flow

The user does exactly what the story expects, with valid data, correct permissions, and a reachable network. These cases prove the feature works when everything goes right. Cover at least:

- The primary success path described in the story
- Any alternate success path the acceptance criteria calls out (e.g., "admin can also do X")
- Each distinct successful entry point, if the story has more than one

### 2. EDGE — boundary and special conditions

Still valid input, but at the edge of what the story allows. These cases prove the feature does not quietly break at the boundaries. Cover, when relevant:

- Minimum / maximum values, lengths, counts
- Empty, single-item, and many-item collections
- Unicode / whitespace / very long strings in text fields
- Concurrent actions (two tabs, rapid clicks)
- Slow or interrupted networks if the flow is async
- Unusual but supported states (just-created user, expired-but-renewed session, timezone edges)

Write an edge case **only** if the story implies it is in scope. Do not invent edges the story does not care about.

### 3. ERROR — error handling and rejected input

The user does something the story should reject, or the environment fails. These cases prove the feature fails safely and tells the user what went wrong. Cover, when relevant:

- Validation failures for each required field
- Unauthorized or forbidden access (wrong role, no login)
- Missing prerequisites (no selection, empty parent resource)
- External/system failures (API down, timeout, 500 response) — only if the story specifies the expected behavior
- Attempted access to another user's data, if applicable

Every ERROR case must have a concrete, user-visible expected result — a specific message, toast, redirect, or disabled state. "Shows an error" is not enough.

---

## Mindset

**Write from the actor's seat, not the code's seat.** Every step describes what the actor *does* and *observes* at the surface the story lives on — not how the implementation is wired internally.

The actor depends on the story's surface:

- **Frontend / UI stories** — the actor is a user with a browser. Steps are clicks, keystrokes, navigation. Expected results are visible UI: toasts, text, disabled states, routes. Never reference internal component names or React state.
- **Backend-only stories** — the actor is an API consumer (another service, a tester with `curl`, a script). Steps are HTTP calls with concrete methods, paths, headers, and bodies. Expected results are real, observable effects: response status + body shape, DB rows, queue entries, webhook deliveries, log lines. It is **fine** to reference public routes (`POST /api/disputes`) and public data contracts here — they are the actor's surface.

What stays off-limits in both cases: internal function names, private modules, ORM call shapes, framework internals. If a step can only be expressed by naming internals, the story is probably under-specified — stop and ask for clarification instead of papering over the gap.

---

## Steps

### Step 1 — Load and sanity-check the story

- Read the full `US-[id]-[name].md` file
- Extract: actor, goal, acceptance criteria, steps, any notes, and the `feasibility` block if present
- If the story file is missing, unreadable, or clearly incomplete (no acceptance criteria, no steps), stop and tell the user to run `/explore-story` first
- If the `feasibility` verdict is `BLOCKED`, stop and tell the user — a blocked story should not have test cases written against it (in practice `explore-story` refuses to write BLOCKED stories at all, so this usually means the file was hand-crafted)
- **Check the `## Open questions for PO` section at the bottom of the story.** If it contains any question still marked **blocking** and not yet resolved, stop and tell the user:
  > This story still has unresolved blocking questions for the PO. Get them answered, edit the story file to incorporate the answers (and remove or mark the resolved questions), then re-run `/create-test-case`.
  Non-blocking questions are fine — note them in the response but proceed. If the section is missing entirely, warn the user that the story may not have been written by `/explore-story` and ask whether to continue
- **Check `feasibility.last_verified` against the edited acceptance criteria.** If the acceptance criteria or steps mention a capability, actor, or integration that the `feasibility.notes` / `feasibility.gaps` never discussed — or if `last_verified` is clearly older than the PO edits — stop and tell the user:
  > This story's feasibility block does not cover what the PO has now asked for. Re-run `/explore-story <path to US-*.md>` (refine mode) to re-verify feasibility before generating test cases. It may come back BLOCKED.
  Do not generate test cases against a stale feasibility block — `/create-test-case` is not allowed to guess whether the app can support new capability needs. Route the decision back to `/explore-story`.

### Step 2 — Derive a case list per section

Work through the story acceptance criteria and steps and draft a **flat list of case titles** grouped by HAPPY / EDGE / ERROR before writing any prose. This keeps coverage honest.

Use this mental checklist while drafting:

| Section | Ask yourself |
|---------|---------------------------------------------------------------------|
| HAPPY   | Does every acceptance criterion have at least one success case?     |
| HAPPY   | Does every distinct entry point / actor have a success case?        |
| EDGE    | What are the numeric, text, and collection boundaries in this story?|
| EDGE    | Are there any async or concurrent interactions?                     |
| ERROR   | Which inputs does the story say are invalid?                        |
| ERROR   | Which actors are forbidden from this flow?                          |
| ERROR   | What does the story say should happen when the environment fails?   |

If you can think of an obvious case the story does not cover, **do not add it** and **do not chat-block**. An obvious missing case is a story gap, not a test gap — stop and tell the user to re-run `/explore-story <path to US-*.md>` (refine mode) so the story itself is updated first. Then come back to `/create-test-case`. This keeps `create-test-case` honest to its "never invents behavior" rule and keeps the PO loop in one place.

### Step 3 — Write the test case file

Create `docs/features/[group]/US-[id]-[name]/TC-[id]-[name].md` next to the user story.

- Use the three sections **HAPPY**, **EDGE**, **ERROR** as top-level headings, in that order
- Number cases **per section** using a one-letter section prefix: `H` for HAPPY, `E` for EDGE, `R` for ERROR. So a file's cases look like `TC-[id]-[name]-H01`, `-H02`, … / `-E01`, `-E02`, … / `-R01`, `-R02`, …
- Numbers are **dense within each section** — if you add a new ERROR case later, it becomes the next free `-R` number, which will be adjacent to the existing ERROR cases on visual scan
- The three sections are still append-only — never renumber existing cases when adding new ones, and never reuse an ID after a case is BYPASSed
- Every case must have: `description`, `precondition`, `steps` (list), `expected_result`, `test-result: PENDING`, `test-result-note: ""`
- Steps must be **actor-facing** actions at the story's surface:
  - UI stories: "Click **Export**", "Type `admin@example.com` into the email field"
  - Backend-only stories: `` `POST /api/disputes` with body `{ "amount": 100, "currency": "USD" }` and header `Authorization: Bearer <admin-token>` ``
- Expected results must be **observable** at that same surface:
  - UI stories: "A toast appears reading *No rows to export*", "The page navigates to `/disputes/123` and shows the record title"
  - Backend-only stories: "Response is `201 Created` with body `{ "id": "<uuid>", "status": "pending" }`", "A new row exists in `disputes` with `status = pending`", "A `dispute.created` message is published to the `disputes` queue"
- At the top of the file, include a short header linking back to the user story with a relative path (`../US-[id]-[name].md`) and a summary count per section. Note whether the cases target **UI**, **Backend**, or **Mixed** — `/self-test` uses this to pick browser vs integration mode

### Step 4 — Update the indexes

- Update `docs/features/[group]/index.md` so this story's row shows the new test case file and the count summary (e.g. `12 test cases — 6 happy / 4 edge / 2 error`)
- Update `docs/features/index.md` only if the group totals are summarised there and the numbers changed
- Do not touch any other group's entries

### Step 5 — Human review checkpoint

**Stop. Do not continue to implementation.**

Present this summary:

```
Create-test-case complete
Story:         docs/features/[group]/US-[id]-[name]/US-[id]-[name].md
Test cases:    docs/features/[group]/US-[id]-[name]/TC-[id]-[name].md
Counts:        HAPPY=N, EDGE=N, ERROR=N (total N)
All cases:     PENDING
Waiting for human review before implementation
```

Once the human approves, the next step is `/brainstorming read @docs/features/[group]/US-[id]-[name]/US-[id]-[name].md and test cases @docs/features/[group]/US-[id]-[name]/TC-[id]-[name].md`.

---

## Rules

- **One story in, one TC file out.** If the user asks for test cases for several stories, run this skill once per story — do not merge them.
- **Never invent behavior.** If the story does not specify what should happen in a case, ask the user or skip the case. Do not guess.
- **All new cases start as PENDING.** `/self-test` is the only skill that updates `test-result` / `test-result-note`.
- **Do not reorder or renumber** existing cases when updating a file — append new cases using the next free number within their section prefix (`-H`, `-E`, `-R`).
- **Do not write unit tests or Playwright specs** here. Code-level tests are fully owned by the superpowers `test-driven-development` flow in Phase 3 — no skill in this workflow touches them.
