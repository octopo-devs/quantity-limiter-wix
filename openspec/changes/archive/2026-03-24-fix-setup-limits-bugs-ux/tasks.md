## 1. Fix Toast / Validation Feedback

- [x] 1.1 Investigate `useHandleToastNotEmbedded` hook — verified: toast renders correctly in standalone mode (no fix needed)
- [x] 1.2 Add inline validation error state to Rule Name input in `Step2Content` (red border + "Rule name is required" text)
- [x] 1.3 Auto-expand Step 2 accordion when validation fails on a Step 2 field

## 2. Fix Rules Table Column Labels & Polish

- [x] 2.1 Rename "Start" column to "Created" and "End" column to "Updated" in `Rules/index.tsx` table columns
- [x] 2.2 Wrap edit `IconButton` with `<Tooltip content="Edit rule">` in the Action column
- [x] 2.3 Wrap delete `IconButton` with `<Tooltip content="Delete rule">` in the Action column
- [x] 2.4 Add empty state when `rules.length === 0` and `searchQuery` is non-empty — show "No rules found" message
- [x] 2.5 Change submit button label from "Create Rule" to "Create Limit" in `CreateRule/index.tsx:279`

## 3. Fix Default Values for Contact Us Fields

- [x] 3.1 Update `createRule` slice initial state: set `contactUsButtonText` to "Contact Us" and `contactUsMessage` to "Please contact our support team for assistance."

## 4. Replace Home Page Stub

- [x] 4.1 Replace `"home"` text in `Home/index.tsx` with a `Page` layout using header title "Dashboard"
- [x] 4.2 Add rule statistics cards (total, active, inactive) using `useGetRulesQuery` data
- [x] 4.3 Add "Create new limit" quick-action button that navigates to `/rules/create`
- [x] 4.4 Add loading state with `Loader` component while rule data is fetching
