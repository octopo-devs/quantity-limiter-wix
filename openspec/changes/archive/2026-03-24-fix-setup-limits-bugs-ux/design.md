## Context

The Setup Limits feature is the core CRUD interface for managing quantity-limit rules. Manual testing revealed bugs and UX gaps across the rules table, create/edit forms, and home page.

Key findings from code review:
- **Validation exists but feedback is invisible**: `handleSubmit` in `CreateRule/index.tsx:150` validates required fields and calls `toast.show()`, but the toast notification does not render in standalone (non-Wix-embedded) mode. The `useHandleToastNotEmbedded` hook needs investigation.
- **"Start"/"End" columns are misleading**: `Rules/config.ts:48-49` maps `createdAt` → "Start" and `updatedAt` → "End". These are NOT scheduling dates — the `Rule` interface has no `startDate`/`endDate` fields. The table headers are misleading.
- **Home page is a stub**: `Home/index.tsx:50` renders literal `"home"` text with commented-out banner components.
- **Action icons lack tooltips**: Edit/Delete `IconButton` components (lines 209-219) have no `Tooltip` wrapper, though the sort button does use one.

## Goals / Non-Goals

**Goals:**
- Fix validation feedback so users see error messages when submitting incomplete forms
- Rename misleading "Start"/"End" table columns to "Created"/"Updated" (accurate to actual data)
- Add tooltips to edit/delete action icons
- Unify button label terminology ("Create new limit" → "Create Limit" everywhere)
- Add empty state for search with no results
- Set meaningful defaults for Contact Us fields in the create form
- Replace Home page stub with a basic dashboard

**Non-Goals:**
- Adding actual date scheduling (startDate/endDate) to rules — this would require backend schema changes and is a separate feature
- Upgrading `@wix/design-system` to fix UNSAFE_componentWillReceiveProps warnings (third-party issue, low severity)
- Changing the rule creation wizard flow (Step 1 → Step 2 auto-expand) — minor UX, separate concern

## Decisions

### 1. Fix toast rendering instead of adding inline validation
The validation logic already exists in `handleSubmit`. Rather than duplicating validation with inline field errors, fix the toast notification to render properly in standalone mode. This is the smallest change for the highest impact.

**Alternative considered**: Add inline field-level validation with error states on each input. Rejected because the existing validation logic is correct and comprehensive — only the feedback mechanism is broken.

### 2. Rename "Start"/"End" to "Created"/"Updated" instead of adding date scheduling
The table shows `createdAt`/`updatedAt` but labels them "Start"/"End", implying scheduling that doesn't exist. Renaming the columns to match the actual data is the honest fix. Adding real scheduling dates is a separate feature requiring backend migration.

**Alternative considered**: Add `startDate`/`endDate` fields to the Rule entity and forms. Rejected for this change — it's a larger feature that needs backend schema changes, migration, and API updates.

### 3. Basic Home dashboard with rule statistics
Replace the `"home"` stub with a simple dashboard showing rule count summary (total, active, inactive) and a quick-action button to create a new rule. Use existing `useGetRulesQuery` for data.

**Alternative considered**: Full dashboard with charts and analytics. Rejected — out of scope for a bug-fix change.

### 4. Default Contact Us field values in Redux initial state
Set meaningful defaults in the `createRule` slice initial state: `contactUsButtonText: "Contact Us"` and `contactUsMessage: "Please contact our support team for assistance."`. This ensures new rules start with sensible values.

## Risks / Trade-offs

- **Toast fix may have side effects**: The toast hook may be designed to only work in Wix embedded mode. Need to verify `useHandleToastNotEmbedded` renders properly when the app is standalone.
  → Mitigation: Test both embedded and standalone modes after the fix.

- **Renaming columns changes user expectations**: Users who relied on "Start"/"End" labels (even if inaccurate) may be confused.
  → Mitigation: The rename is more honest and prevents false expectations about scheduling capabilities.

- **Home dashboard is basic**: A minimal dashboard may feel incomplete.
  → Mitigation: This is strictly better than rendering `"home"` as raw text. Can be enhanced later.
