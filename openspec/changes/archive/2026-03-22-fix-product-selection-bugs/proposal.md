## Why

Several bugs and UX issues in the rule creation/editing flow prevent the product selection feature from working correctly and degrade the user experience. Products disappear from modals on re-open, edit mode shows raw IDs instead of product details, search doesn't filter results, default messages don't use template variables, the save button is buried at the bottom of the form, and the Order limit type should be hidden for MVP.

## What Changes

- **Fix modal product list disappearing on re-open**: The `SelectWixProductModal` clears `allProducts` state when reopening, but RTK Query returns cached data whose reference doesn't change, so the effect that populates `allProducts` never re-fires. Fix by handling the cache scenario properly.
- **Fix edit mode showing only product IDs**: When loading a rule for editing, `CreateRule/index.tsx` maps `productIds` to `{ productId, name: productId }` without fetching actual product details (name, image, variant info). Fix by fetching product details via the Wix products API using `specificIds`.
- **Fix product search API not filtering**: Backend `wix.service.ts` line 127 conditionally applies the Wix API filter only when `query.filter || query.specificIds` is truthy, which skips the `title` filter entirely when the user only searches by title. Fix by including `query.title` in the condition.
- **Set default message templates**: Update the initial state to use `{{max_quantity}}` and `{{min_quantity}}` variable templates in default messages so the preview displays meaningful content immediately.
- **Move Save button to page header**: Move the submit logic from `Step2Content` up to `CreateRule/index.tsx` and place the Save/Create button in the `Page.Header` `actionsBar` alongside Cancel (matching the Appearance page pattern).
- **Hide Order limit type for MVP**: Filter `RuleType.ORDER` out of the Step 1 rule type grid at the UI level, keeping the enum value intact for future re-enablement.
- **Fix stale form data after edit → create**: Navigating from edit back to table then creating a new rule shows stale data from the previously edited rule. Fix by resetting Redux state on component unmount.
- **Fix collection modal cache bug**: Same RTK Query cache issue as the product modal — collection list disappears on second Browse click. Apply the same `.unwrap()` refactor.
- **Modal pagination + sizing**: Replace infinite scroll with simple pagination in both Product and Collection modals. Make modals smaller and search input full-width.
- **Fix product search**: Wix API `$contains` on title may be case-sensitive. Use `$startsWith` for case-insensitive search. Also support searching by product ID alongside title.
- **Switch collection modal to Wix API**: Replace the local DB `attributes/collections` endpoint with the Wix `COLLECTIONS_V1` API for collection search, matching the product modal pattern. Add a `handleGetCollections` method to the Wix service and a `GET /wix/collections` endpoint.
- **Fix search input full-width**: Ensure the `Input` component in both modals stretches to full container width.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `message-template-variables`: Default messages now use template variables instead of empty strings.

## Impact

- **Frontend**: `SelectWixProductModal`, `CreateRule/index.tsx`, `Step2Content/index.tsx` (remove submit logic), `Step1Content/index.tsx` (filter Order type), `createRule.slice.ts` (initial state), `Preview/config.ts`
- **Backend**: `wix.service.ts` (search filter condition)
- No data model or API contract changes.
