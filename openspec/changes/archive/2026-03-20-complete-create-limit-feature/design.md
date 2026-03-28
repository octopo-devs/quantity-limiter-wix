## Context

The create-limit flow is a two-step wizard in `order-limiter-frontend`. Step 1 selects the rule type (PRODUCT / COLLECTION / CUSTOMER / ORDER); Step 2 configures rule-type-specific sub-entities plus shared fields (name, qty limits, messages). The backend REST API is complete; all required endpoints exist (`GET /attributes/collections`, `POST /rules`, `PUT /rules/:id`). Only frontend work is needed.

Current gaps discovered by code review:
- `CollectionRuleSetup` accepts raw comma-separated IDs — no browse UI.
- The Edit icon in the Rules table calls `console.log` and never navigates.
- Redux initial state pre-sets `type: RuleType.PRODUCT`, making Step 1 appear complete before any user action.
- `breakMultipleLimitMessage` (exists on the `Rule` model) is not rendered in the form.
- `handleSubmit` only checks `name` and `type`; no min ≤ max guard or selection-required guard.

## Goals / Non-Goals

**Goals:**
- Collection browse modal on par with existing `SelectWixProductModal`.
- Edit button navigates to a pre-filled create form (reuse the same `CreateRule` page via a URL param or separate `/rules/edit/:id` route).
- Step 1 starts with no type pre-selected; `isStepCompleted` returns false until the user clicks a card.
- `breakMultipleLimitMessage` field shown when product rule + `sellProductInMultiples` is true.
- Submit guard: `minQty` must be ≤ `maxQty`; collection/product picker must have at least one item when the relevant condition type is selected.

**Non-Goals:**
- Backend changes.
- Redesigning the two-step layout.
- Adding new rule types or new condition types.

## Decisions

**1. Reuse `CreateRule` page for edit via route param**
- Route: `/rules/edit/:id` — `CreateRule` reads the param, fetches the rule, and pre-populates Redux state.
- Alternative: a separate `EditRule` page. Rejected — duplicates all form logic.
- Alternative: modal-based edit. Rejected — the form is too long for a modal.

**2. `SelectCollectionModal` as a new shared component**
- Mirror `SelectWixProductModal` but call `GET /attributes/collections` (paginated).
- Collections have no variants, so the tree is flat — simpler than the product picker.
- Stored in `src/components/SelectCollectionModal/`.

**3. Remove pre-selected type from Redux initial state**
- Set `type: undefined` in `initialState.createRule`.
- `isStepCompleted(STEP_1)` already guards on `createRule.type !== undefined`, so this is a one-line fix.

**4. Client-side validation in `handleSubmit`**
- Keep validation co-located with submit handler (Step 2 `handleSubmit`) — no separate validation library needed for this small surface.

## Risks / Trade-offs

- [Edit pre-fill] Fetching rule by ID adds a loading state to the create page → add a `Loader` guard before rendering form content. Mitigation: use RTK Query `useGetRuleQuery` with skip logic.
- [Collection pagination] `GET /attributes/collections` may return cursor-based or page-based results — match whatever `getCollections` query params/response shape the backend already uses. Mitigation: inspect the existing `IResponseApi.IGetCollections` type before building the modal.
