---
name: explore-story
description: >
  Use this skill when a new story or feature request arrives and you need to validate that it can actually be built in the current app before any code — or test cases — are written. Trigger when the user mentions "explore-story", "explore story", "analyze story", "validate story", "break down story", "refine story", or provides a Jira link / story description to analyze. Always use this skill as the very first step of a new feature, even if the user does not explicitly ask for it. Pair with the `create-test-case` skill afterwards to generate test cases.
---

# explore-story

Research the current app, verify that a story is feasible (**hard-stop with proof if it is not**), optionally split it into smaller Agile stories, and leave a list of **business-logic questions** at the end of each written story for the Product Owner to answer. The target of this phase is to produce stories the PO can read, forward to stakeholders if needed, and validate.

This skill does **not** write test cases. It does **not** block the chat waiting for answers — open questions live at the **end of each written story**. The human forwards the story to the PO, the PO answers, the human edits the story file with the answers, and only then is the story ready to feed into `/create-test-case`.

---

## Input

One of:

- **New story** — description as text (from chat), or a Jira link / Issue ID to fetch story details. No file exists yet.
- **Refine mode** — a path to an existing `docs/features/[group]/US-[id]-[name]/US-[id]-[name].md` that already has PO answers edited in. The skill re-verifies feasibility against the updated acceptance criteria and returns an updated story (or BLOCKED, with proof) without creating a new folder.

Refine mode is the required second pass whenever PO answers introduce new capability needs, change the actor, expand scope, or otherwise touch anything beyond minor wording. If the PO only clarified wording or confirmed best-guesses, refine mode is not required and the human can go straight to `/create-test-case`.

---

## Output

| Artifact       | Path                                                     |
| -------------- | -------------------------------------------------------- |
| User Story     | `docs/features/[group]/US-[id]-[name]/US-[id]-[name].md` |
| Group Index    | `docs/features/[group]/index.md`                         |
| Features Index | `docs/features/index.md`                                 |

If the original request was split into several smaller stories, write one `US-[id]-[name].md` per resulting story, each in its own folder. Each story folder is the container where `create-test-case` will later drop a sibling `TC-[id]-[name].md`.

If feasibility is **BLOCKED**, **no story file is written** — the skill stops and returns the reason + proof to the user instead.

---

## Output Schema

```
user_story:
  - id: US-[id]-[name]
  - group: [group]
  - title: string
  - goal: string
  - actor: string
  - status: DRAFT | DONE   # this skill always writes DRAFT
  - acceptance_criteria: list[string]
  - steps: list[string]
  - feasibility:
      verdict: FEASIBLE | FEASIBLE_WITH_CHANGES
      notes: string            # what in the current app supports this
      evidence: list[string]   # screenshots, routes, components, docs referenced
      gaps: list[string]       # only for FEASIBLE_WITH_CHANGES — concrete missing pieces
      last_verified: YYYY-MM-DD # date of the most recent feasibility check (including refine-mode reruns)
  - notes: string (optional)
  - open_questions_for_po: list[{question, why_it_matters, best_guess}]  # business-logic only
```

Status is a two-state field: `DRAFT` (written by this skill) and `DONE` (set only by `/self-test` when every non-BYPASS manual test case passes). There is no `IN_PROGRESS` — a story is either verified end-to-end or it is not.

`open_questions_for_po` is a **required** section in every written story (even if empty — write "None — ready for /create-test-case"). It always lives at the **very end** of the story file so the PO can scroll straight to it.

If the story is split, the output is a **list** of stories following the schema above, plus a short rationale at the top of the response explaining the split.

---

## Mindset

**Think like an end-user and a Product Owner, not a developer.** Your job is not to design the solution — your job is to make sure the story is:

1. **Understood** — everyone agrees what the user should experience.
2. **Feasible** — the current app can actually support it (or you know exactly what is missing, with proof).
3. **Right-sized** — small enough to plan and ship in one go.
4. **PO-answerable** — every remaining business-logic ambiguity is captured as an explicit question at the end of the story, with a best-guess so the PO can confirm quickly.

You should also be honest about what you do **not** know. If a business rule is ambiguous, do not invent it — write it down as an `open_questions_for_po` entry. If you cannot prove feasibility, do not fabricate a verdict — stop and show what you actually saw.

---

## Flow at a glance

**New story mode:**

```
1. Read & understand
2. Explore the current app (browser / docs / Jira / targeted source)
3. Verify feasibility
   ├─ BLOCKED  → STOP. Display reason + proof. Do not write any story file.
   ├─ FEASIBLE or FEASIBLE_WITH_CHANGES → continue
4. Split story if too big (Agile INVEST) — skip for already-small stories
5. Write the story (or one file per split story)
6. Append "Open questions for PO" at the END of each written story
   — business-logic only, with best-guess
7. Hand off to the user for PO review → manual edits → (refine mode if scope shifted) → /create-test-case
```

**Refine mode** (input is an existing story path with PO answers already edited in):

```
R1. Read the updated story — including the edited acceptance criteria, steps, and
    any remaining entries in `## Open questions for PO`
R2. Diff against the prior `feasibility` block — what's the PO actually asking for now?
R3. Re-verify feasibility against the current app (same Step 3 gate — BLOCKED is still a hard stop)
R4. Decide if the updated scope now needs a split (Agile INVEST) that the original did not
R5. Update the story file in place: feasibility block, acceptance criteria touch-ups,
    `last_verified` date. Never delete PO-authored content.
R6. If any blocking questions remain, re-surface them in the same section
R7. Hand off to the user → /create-test-case
```

---

## Steps

### Step 0 — Detect mode

- If the input is a path to an existing `US-[id]-[name].md` file → **refine mode**. Jump to the refine-mode steps at the bottom of this section.
- Otherwise → **new story mode**. Continue with Step 1.

### Step 1 — Read & understand the story

- If input is a **Jira link**: fetch the issue, read description + acceptance criteria + comments + linked tickets
- If input is **text**: parse directly from chat
- Identify: actor, goal, main flow, alternate flows, obvious edge cases, business rules

### Step 2 — Explore the current app

Pick the lightest research approach that gives you enough context to judge feasibility and write a faithful story. You do **not** have to use every method — use what fits the task.

**Available research methods:**

1. **Browser exploration with Playwright CLI _(optional, preferred when the feature is visible in the running app)_** — Use the `/playwright-cli` skill to open a headed browser at localhost. Navigate to relevant screens, click buttons, fill forms, take screenshots. This is the most faithful way to capture _what the user actually sees today_, but it is not mandatory — skip it when the app is not running, the screen does not yet exist, or the change is non-visual.
2. **Existing docs** — Read `docs/features/index.md` and any related `docs/features/[group]/index.md` to find related stories already documented.
3. **Jira / linked tickets** — Re-read the Jira issue, comments, attachments, and any linked tickets for context the chat message did not include.
4. **Targeted source reading** — Allowed only when needed to disambiguate (e.g., to find a route, an API contract, or an existing schema). Keep it narrow; do not start architecting from the codebase.

Record what you observe and save every piece of evidence you collect (screenshot paths, file paths, Jira comment URLs, route names). Step 3 will need them as **proof**.

### Step 3 — Verify feasibility in the current app (hard-stop gate)

Before splitting or drafting anything, form an explicit verdict on whether the story can be done in the app as it stands today. This is a **gate**: if the verdict is BLOCKED, the skill stops immediately.

Possible verdicts:

- **FEASIBLE** — every screen, route, component, data source, and permission needed already exists, and the change is purely additive or in-place.
- **FEASIBLE_WITH_CHANGES** — most of the app supports the story, but one or more specific pieces need to be added or modified (e.g., a new route, a new field on an existing schema, a new permission). List each missing piece concretely. Proceed to Step 4.
- **BLOCKED** — a fundamental capability is missing (e.g., there is no authentication at all, the required external system is not integrated, the data simply does not exist, the change contradicts an existing constraint in production data). **Do not continue.**

**If the verdict is BLOCKED:**

- **Do not write a story file.** Do not split. Do not draft open questions.
- Return a BLOCKED report to the user with **reason + proof**:

  ```
  Explore-story BLOCKED
  Reason:
    [one or two sentences explaining what is missing or broken]
  Proof:
    - [file path / route / screenshot] — [what it shows]
    - [Jira comment URL] — [what it says]
    - [observation from browser] — [what you saw]
  What would unblock this:
    - [the concrete change needed in the app or in the request before this story can be explored again]
  ```

- The proof list is **mandatory**. "I think it is blocked" is not acceptable — show the receipts. Every item should be something the user (or PO) can click, open, or navigate to in order to verify the claim themselves.
- After presenting the report, stop. Wait for the user to either fix the blocker and re-invoke the skill, or reshape the request.

**If the verdict is FEASIBLE or FEASIBLE_WITH_CHANGES:** capture the verdict, notes, evidence, and (for WITH_CHANGES) the list of gaps. This becomes the `feasibility` block in the story. Continue to Step 4.

### Step 4 — Decide whether to split the story (Agile INVEST)

Apply the **INVEST** checklist to decide if the story is the right size:

- **I**ndependent — can it be built and shipped without waiting on another story in the same batch?
- **N**egotiable — is the scope flexible, not a bundle of unrelated requirements?
- **V**aluable — does it deliver observable value on its own (to a user or to an API consumer)?
- **E**stimable — can a developer picture the work concretely?
- **S**mall — can it realistically be planned, built, and verified in one short workflow loop? (Rule of thumb: if a competent developer cannot finish it in a day or two with clear test cases, it is too big.)
- **T**estable — can a clear set of HAPPY / EDGE / ERROR test cases be written against it later by `create-test-case`?

**If the story passes all six checks → do not split it.** Small stories should stay as one story.

**If the story fails `S` or `T`** (or bundles several independent goals), split it into smaller stories along natural seams. Good seams are usually:

- By **user flow or screen** — e.g., "view list" vs "edit detail" vs "export"
- By **actor or role** — e.g., "admin can approve" vs "user can request"
- By **capability layer** — e.g., "happy path" as story 1, "bulk operations" as story 2
- By **data scope** — e.g., "single record" vs "multi-record batch"

Do **not** split along technical layers (frontend vs backend, database vs API) — each resulting story must still deliver observable end-to-end value.

If you are not sure where to cut, **do not guess** — add a business-logic question about the split to the story's `open_questions_for_po` section in Step 6.

### Step 5 — Write the user story (or stories)

- Read `docs/features/index.md` and the relevant `docs/features/[group]/index.md` to find related stories
- **If a story already exists and only needs refining:** update `docs/features/[group]/US-[id]-[name]/US-[id]-[name].md` in place
- **If this is a new story:** create the folder `docs/features/[group]/US-[id]-[name]/` and write a new `US-[id]-[name].md` inside it
- **If you split the request into several stories:** create one folder per story and write one `US-[id]-[name].md` per folder. Give each a distinct `<id>-<name>` suffix and cross-reference the siblings in a short "Related stories" section
- Write every story from the **actor's perspective** — describe what they see/do/observe, not how the code works
- Fill in the `feasibility` block from Step 3 — this is how the PO validates that the story is doable
- Update `docs/features/[group]/index.md` and `docs/features/index.md` if a new story or group was added
- Leave the `open_questions_for_po` section empty for now — Step 6 fills it in

Do **not** write a `TC-[id]-[name].md` file here. Test cases are generated by the `create-test-case` skill in the next phase.

### Step 6 — Append "Open questions for PO" at the end of each story (business-logic only)

After the story body is written, walk through what you captured in Steps 1–4 and collect every remaining ambiguity that **only a business stakeholder can answer**. Write each one into an `## Open questions for PO` section at the **very bottom** of the story file.

**In scope — write these down:**

- Business rules and policies — who is allowed to do X, what limits apply, which calculation applies
- Domain terminology — what a domain term precisely means in this product
- Lifecycle / state transitions — when a record moves from state A to state B, what side effects apply
- Edge cases that require business judgement — what happens on empty state, over-limit, expired, duplicate, cross-tenant access
- Prioritisation trade-offs — if two requirements conflict, which wins
- Scope boundaries — whether a related flow is in or out of scope for this story
- If you were unsure where to cut in Step 4: ask the PO to confirm the split line

**Out of scope — do NOT write these down here:**

- Technical implementation choices (framework, library, data model, performance tuning) — that is Phase 3
- UX micro-copy (exact button wording, toast text) unless the wording itself carries business meaning
- How to write the test cases — that is `/create-test-case`
- Questions you can answer yourself by reading the app or existing docs — answer them yourself and move on
- Anything that is already covered by the acceptance criteria

**Format for each question:**

Every entry must include the question, why it matters to the story, and your current best guess so the PO can confirm with a single word. Mark each question as **blocking** (test cases cannot be written without the answer) or **non-blocking** (test cases can be drafted but the answer will tighten them).

Example section to drop at the bottom of a story file:

```markdown
## Open questions for PO

> Answer these and edit the story file in place (update the acceptance criteria / steps / notes), then run `/create-test-case` against this file.

1. **(blocking) Who is allowed to trigger the export — any logged-in user, or only admins?**
   Why it matters: determines the actor and which ERROR cases are needed (403 vs 401).
   Best guess: admins only.

2. **(blocking) On an empty result set, should we produce an empty CSV or block the export with a message?**
   Why it matters: decides whether an empty state is a HAPPY case or an ERROR case.
   Best guess: block with a toast "no rows to export".

3. **(non-blocking) Does the export need to include soft-deleted rows?**
   Why it matters: affects the row count in every HAPPY case.
   Best guess: no, exclude soft-deleted.
```

If you genuinely have no unanswered business questions, write:

```markdown
## Open questions for PO

None — ready for `/create-test-case`.
```

Do not leave the section off. Its presence is the contract with the PO.

### Step 7 — Hand off to the user

**Stop. Do not continue to test cases or implementation.**

Present the following summary for the user:

```
Explore-story complete
Stories produced:
  - docs/features/[group]/US-[id1]-[name1]/US-[id1]-[name1].md   — FEASIBLE           — 3 open questions for PO (2 blocking)
  - docs/features/[group]/US-[id2]-[name2]/US-[id2]-[name2].md   — FEASIBLE_WITH_CHANGES (gaps: [list]) — 1 open question for PO (0 blocking)
Split rationale: [one-sentence reason, or "not split — story is already small enough"]

Next steps:
  1. Send each story file to the PO and collect answers to the "Open questions for PO" section.
  2. Edit the story file in place with the answers — update acceptance criteria / steps / notes, then delete the resolved questions (or mark them as "answered: ...").
  3. If the PO answers shift scope, introduce new capability needs, or change the actor:
     re-run `/explore-story <path to US-*.md>` (refine mode) before moving on. It re-verifies
     feasibility against the updated story and may still return BLOCKED.
  4. When all blocking questions are resolved, run /create-test-case against the story file.
```

Do **not** try to send the story to the PO yourself, do **not** wait in the chat for answers, and do **not** auto-update the story file with guessed answers. The human owns the PO loop.

---

### Refine mode — Steps R1–R7

Run these instead of Steps 1–7 when the input is a path to an existing `US-[id]-[name].md`.

**R1 — Read the updated story.** Load the full file. Read the `feasibility` block as it currently stands, the acceptance criteria, the steps, and every entry in `## Open questions for PO` — including any marked `answered:`. This is your "before" snapshot.

**R2 — Figure out what the PO actually changed.** Compare the story body against the `feasibility.notes` and `feasibility.gaps` from the previous run. Specifically, look for:

- New capability needs the previous feasibility did not list (new auth, new integration, new data source, new permission)
- Changed actor or role
- Expanded scope (an acceptance criterion that now implies a flow not covered before)
- New edge cases that require new backend behavior

If nothing material changed — the PO only clarified wording, confirmed a best-guess, or corrected a typo — say so in the handoff summary and update only `feasibility.last_verified`. Do not re-explore the app.

**R3 — Re-verify feasibility.** If anything in R2 is material, repeat the same Step 3 gate against the current app. The same three verdicts apply:

- **FEASIBLE / FEASIBLE_WITH_CHANGES** — update the `feasibility` block (verdict, notes, evidence, gaps, `last_verified: <today>`) and continue.
- **BLOCKED** — stop. Do **not** delete the story file, but do **not** mark it ready for `/create-test-case` either. Return the same BLOCKED report format as Step 3 (reason + proof + what would unblock this), and tell the user the story is now blocked by the PO's own clarification. They decide: revise the request with the PO, fix the app, or park the story.

**R4 — Re-check split.** The new scope may warrant a split that the original did not. Apply INVEST again. If a split is now needed, create the additional story folder(s), move the relevant acceptance criteria over, and cross-reference them. If the existing folder is no longer the right container for what survived, rename it — but never silently lose PO-authored content.

**R5 — Update the story file in place.** Rewrite only the sections affected: `feasibility`, acceptance criteria that were touched, steps that now differ, notes. Preserve everything the PO added. Bump `feasibility.last_verified` to today.

**R6 — Re-surface any remaining open questions.** If the PO's answers introduced new ambiguities (common — answers often spawn follow-ups), add them back to the `## Open questions for PO` section with the same format (question, why it matters, best guess, blocking/non-blocking). If no new questions, leave the section as the PO left it.

**R7 — Hand off.** Present:

```
Explore-story refine complete
Story:            docs/features/[group]/US-[id]-[name]/US-[id]-[name].md
Refine verdict:   UNCHANGED | UPDATED | SPLIT | BLOCKED
Feasibility:      FEASIBLE | FEASIBLE_WITH_CHANGES | BLOCKED  (was: ...)
Last verified:    YYYY-MM-DD
Open questions:   N blocking, N non-blocking

Next step: /create-test-case <story path>
```

If the verdict is BLOCKED, the "Next step" line is replaced with the BLOCKED report and a pointer back to the PO loop.

---

## Artifact Structure

```
docs/
├── superpowers/                         # plans, brainstorms, and other superpowers artifacts
└── features/
    ├── index.md                         # top-level index of all groups / stories
    └── [group]/
        ├── index.md                     # per-group index of stories
        └── US-[id]-[name]/              # one folder per story
            └── US-[id]-[name].md        # the user story (TC file added later by create-test-case)
```
