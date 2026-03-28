## 1. Fix modal product list disappearing on re-open

- [x] 1.1 Refactor `SelectWixProductModal` data fetching to avoid RTK Query cache stale reference — use `.unwrap()` result directly or force refetch when modal opens
- [x] 1.2 Verify products appear correctly when opening modal a second time

## 2. Fix edit mode showing only product IDs

- [x] 2.1 In `CreateRule/index.tsx`, when loading a rule with `productIds`, call the Wix products API with `specificIds` param to fetch full product details (name, image, variants)
- [x] 2.2 Map the API response to `SelectedProduct[]` with proper `name`, `image`, and `variantTitle` fields
- [x] 2.3 Also fix collections: fetch collection details when loading a rule with `collectionIds` (same pattern — currently shows raw IDs as names)

## 3. Fix product search API not filtering

- [x] 3.1 In backend `wix.service.ts`, change the filter condition from `if (query.filter || query.specificIds)` to `if (query.filter || query.specificIds || query.title)` so title search works

## 4. Set default message templates

- [x] 4.1 Update `createRule.slice.ts` initial state: set `minQtyLimitMessage` to `'Minimum quantity is {{min_quantity}}'` and `maxQtyLimitMessage` to `'Maximum quantity is {{max_quantity}}'`
- [x] 4.2 Update `Preview/config.ts` fallback messages to use template variables and also interpolate `minQtyLimitMessage` (not just maxQtyLimitMessage)
- [x] 4.3 Update Preview component to pass and display `minQtyLimitMessage` alongside `maxQtyLimitMessage` in warning components

## 5. Move Save button to page header

- [x] 5.1 Move submit handler (validation + create/update mutation) from `Step2Content` to `CreateRule/index.tsx`
- [x] 5.2 Add Save/Create button to `Page.Header` `actionsBar` alongside Cancel button
- [x] 5.3 Remove the submit button and mutation hooks from `Step2Content`

## 6. Hide Order limit type for MVP

- [x] 6.1 Define `ENABLED_RULE_TYPES` array (PRODUCT, COLLECTION, CUSTOMER) in `Step1Content` and use it instead of `Object.values(RuleType)` to filter out ORDER from the rule type grid

## 7. Fix stale form data after edit → create

- [x] 7.1 Add `useEffect` cleanup in `CreateRule/index.tsx` that dispatches `resetCreateRule()` on unmount

## 8. Fix collection modal cache bug

- [x] 8.1 Refactor `SelectCollectionModal` data fetching to use `.unwrap()` pattern (same fix as product modal)

## 9. Modal pagination + sizing

- [x] 9.1 Replace infinite scroll with `Pagination` component in `SelectWixProductModal` — remove `loadMoreRef`/`useOnScreen`, add page controls
- [x] 9.2 Replace infinite scroll with `Pagination` component in `SelectCollectionModal` — same pattern
- [x] 9.3 Reduce modal width (products ~650px, collections ~500px) and ensure search input is full-width

## 10. Fix product search (Wix API)

- [x] 10.1 In backend `wix.service.ts`, change product title filter from `$contains` to `$startsWith` for case-insensitive search
- [x] 10.2 Support searching by product ID: if search query looks like a UUID/ID, also include `id.$hasSome` in the filter

## 11. Switch collection modal to Wix API

- [x] 11.1 Add `handleGetCollections` method to `wix.service.ts` — query `COLLECTIONS_V1` with paging and name filter (same pattern as `handleGetProducts`)
- [x] 11.2 Add `GetCollectionsWixDto` DTO with page, perPage, name fields
- [x] 11.3 Add `GET /wix/collections` endpoint to `wix.controller.ts`
- [x] 11.4 Add `getWixCollections` RTK Query endpoint in frontend `redux/query/index.ts`
- [x] 11.5 Update `SelectCollectionModal` to use `getWixCollections` instead of `getCollections`, map `IWixCollection` to display

## 12. Fix search input full-width

- [x] 12.1 Fix `Input` component styling in both modals to ensure full-width rendering
