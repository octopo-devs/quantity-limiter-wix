## Why

The Setup Limits feature has several bugs and UX gaps discovered during manual testing. Users cannot set rule scheduling dates (despite the table showing Start/End columns), get no validation feedback when submitting incomplete forms, and encounter inconsistent UI labels and missing affordances. These issues degrade trust in the product and block core workflows.

## What Changes

- Add form validation with inline error messages for required fields (Rule Name) on Create/Edit rule forms
- Add Start Date and End Date picker fields to both Create and Edit rule forms
- Replace the placeholder Home page (`"home"` raw text) with a proper dashboard layout
- Add tooltips to action column icons (edit/delete) in the rules table
- Fix button label inconsistency: unify "Create new limit" / "Create Rule" terminology
- Add "no results" empty state for the rules table search
- Set meaningful default values for "Contact Us Button Text" and "Contact Us Message" fields
- Suppress or address UNSAFE_componentWillReceiveProps console warnings (Wix Design System dependency)

## Capabilities

### New Capabilities
- `rule-form-validation`: Inline validation for required fields on Create/Edit rule forms with error messages
- `rule-date-scheduling`: Start and End date picker fields on Create/Edit rule forms, persisted to API
- `home-dashboard`: Replace placeholder Home page with a proper dashboard (rule stats summary, quick actions)
- `rules-table-polish`: Tooltips on action icons, "no results" empty state for search, consistent button labels, meaningful default field values

### Modified Capabilities
- `order-rule-setup`: Adding date scheduling fields and validation to the existing rule creation/edit workflow

## Impact

- **Frontend**: `order-limiter-frontend/src/pages/Rules/` (Create/Edit forms, table component), `order-limiter-frontend/src/pages/Home/` (dashboard), Redux slices for rule state
- **Backend**: Rule entity may need `startDate`/`endDate` fields exposed via API (fields already exist in DB per table display)
- **Dependencies**: May need to update `@wix/design-system` to resolve deprecated lifecycle warnings
- **API**: No breaking changes expected; date fields are additive
