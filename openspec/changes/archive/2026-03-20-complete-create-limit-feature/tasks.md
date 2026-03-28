## 1. Fix Step 1 Initial State

- [x] 1.1 Remove `type: RuleType.PRODUCT` from `initialState.createRule` in `createRule.slice.ts` — set `type` to `undefined`
- [x] 1.2 Update `Step2Content` default values that assume a pre-set type (ensure conditional rendering still works when `type` is `undefined` on mount)

## 2. Add breakMultipleLimitMessage Field

- [x] 2.1 Add `breakMultipleLimitMessage` input to the Messages section in `Step2Content` — render only when `createRule.type === RuleType.PRODUCT && createRule.ruleProduct?.sellProductInMultiples`

## 3. SelectCollectionModal Component

- [x] 3.1 Create `src/components/SelectCollectionModal/index.tsx` mirroring `SelectWixProductModal` — flat list (no variants), calls `apiCaller.useGetCollectionsQuery` with search/pagination
- [x] 3.2 Add search input with debounce inside the modal
- [x] 3.3 Add infinite-scroll or pagination load-more (matching product modal pattern)
- [x] 3.4 Expose `SelectedCollection` interface: `{ collectionId: string; name: string }`

## 4. Update CollectionRuleSetup

- [x] 4.1 Replace the raw text `Input` with a selected-collections display list + "Browse" button (mirror `ProductRuleSetup` SPECIFIC_PRODUCTS UI)
- [x] 4.2 Add `setSelectedCollections` action to `createRule.slice.ts` (analogous to `setSelectedProducts`)
- [x] 4.3 Wire `SelectCollectionModal` open/close state and selection handler in `CollectionRuleSetup`
- [x] 4.4 Implement remove-collection handler that updates both Redux state and `ruleCollection.collectionIds`

## 5. Form Validation

- [x] 5.1 Add `minQty <= maxQty` guard in `handleSubmit` in `Step2Content` — show toast on failure
- [x] 5.2 Add "at least one product" guard for PRODUCT rules with `SPECIFIC_PRODUCTS` condition
- [x] 5.3 Add "at least one collection" guard for COLLECTION rules — show toast on failure

## 6. Edit Rule Flow

- [x] 6.1 Add `/rules/edit/:id` route to `src/routes/index.tsx` pointing to `CreateRule` component
- [x] 6.2 Add `GET /rules/:id` RTK Query endpoint (`getRuleById`) to `src/redux/query/index.ts`
- [x] 6.3 In `CreateRule`, read `:id` param — if present, fetch rule and dispatch `updateCreateRule` / `setSelectedProducts` / `setSelectedCollections` to pre-fill Redux state; show `Loader` until data is ready
- [x] 6.4 In `Step2Content`, detect edit mode (id present) and call `updateRuleMutation` instead of `createRuleMutation` on submit; change button label to "Save"
- [x] 6.5 Wire the Edit `IconButton` in `Rules/index.tsx` to `navigate(PATH.EDIT_RULE.pathname.replace(':id', row.id))` instead of `console.log`
- [x] 6.6 Add `EDIT_RULE` to the `PATH` constants
