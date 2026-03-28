## Why

The "Create new limit" flow has several incomplete pieces that prevent store owners from successfully creating all rule types: the Collection rule type has no proper picker UI (just a raw text input for IDs), the Edit rule action is a stub (`console.log` only), client-side validation is missing (no min < max check, step 1 marks itself complete without user interaction), and `breakMultipleLimitMessage` is absent from the form despite being in the Rule model.

## What Changes

- **Collection picker**: Replace the raw comma-separated ID input in `CollectionRuleSetup` with a browse modal (mirroring `SelectWixProductModal`) that calls the existing `getCollections` API.
- **Edit rule navigation**: Wire the Edit button in the Rules table to navigate to an edit page/flow instead of `console.log`.
- **Form validation**: Add client-side validation — ensure min < max, at least one product/collection selected when required, and step 1 not pre-marked complete from Redux initial state.
- **breakMultipleLimitMessage field**: Add the missing message input in Step 2 for product rules with `sellProductInMultiples` enabled.
- **Step 1 initial state fix**: Remove pre-set `type: RuleType.PRODUCT` from Redux initial state so Step 1 starts uncompleted and forces the user to make an explicit selection.

## Capabilities

### New Capabilities

- `collection-picker`: Browse-and-select modal for collections, analogous to the existing product picker, used in `CollectionRuleSetup`.
- `edit-rule-flow`: Navigate to a pre-populated create/edit form from the Rules table edit action.

### Modified Capabilities

- none

## Impact

- **Frontend only** — no backend changes required; all needed API endpoints (`GET /attributes/collections`, `PUT /rules/:id`) already exist.
- Files affected: `CollectionRuleSetup`, `Step2Content`, `createRule.slice.ts`, `Rules/index.tsx`, `CreateRule/index.tsx`, possibly a new `SelectCollectionModal` component.
