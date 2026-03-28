## Why

The create/edit limit screen has several UX gaps that hurt usability and first impressions. The notification default requires manual selection on every rule, message fields don't support dynamic variables making them error-prone, the product and collection selection modals feel clunky, and the "Sell Product in Multiples" feature is not ready for the MVP release and adds visual noise.

## What Changes

- **Default notification trigger**: Set "Notify About Limit When" to "Limit reached" by default in Step 2, so users don't have to manually select it every time.
- **Message template variables**: Support `{{min_quantity}}` and `{{max_quantity}}` placeholders in message text fields. The live preview panel auto-updates these variables with real min/max values as the user types.
- **Improved product selection UI**: Redesign the product selection modal and selected-products list for better usability — better visual hierarchy, search experience, and selection feedback.
- **Improved collection selection UI**: Redesign the collection selection modal and selected-collections list to match the improved product selection patterns.
- **Hide "Sell Product in Multiples"**: Remove the toggle from the ProductRuleSetup form and hide the "Multiple" column from the rules table for the MVP release.

## Capabilities

### New Capabilities
- `message-template-variables`: Support `{{min_quantity}}` and `{{max_quantity}}` placeholders in limit message fields with real-time preview interpolation.
- `improved-selection-modals`: Redesigned product and collection selection modals with better UX patterns.

### Modified Capabilities
- None

## Impact

- **Frontend only** — no backend changes required.
- **Files affected**:
  - `order-limiter-frontend/src/pages/Rules/components/CreateRule/components/Step2Content/index.tsx` — notification default, message fields, multiples toggle visibility
  - `order-limiter-frontend/src/pages/Rules/components/CreateRule/components/Step2Content/components/ProductRuleSetup/index.tsx` — hide multiples toggle
  - `order-limiter-frontend/src/components/SelectWixProductModal/index.tsx` — product modal redesign
  - `order-limiter-frontend/src/components/SelectCollectionModal/index.tsx` — collection modal redesign
  - `order-limiter-frontend/src/components/Preview/` — variable interpolation in preview
  - `order-limiter-frontend/src/pages/Rules/index.tsx` — hide "Multiple" column from table
  - `order-limiter-frontend/src/store/slices/createRule.slice.ts` — default notification trigger value
