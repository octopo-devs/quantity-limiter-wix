## Context

The product selection modal, rule editing flow, backend product search, and default message templates have interconnected bugs that break core functionality in the rule management UI.

## Goals / Non-Goals

**Goals:**
- Fix all 4 bugs so product selection works end-to-end (create, edit, search, re-open modal).
- Set sensible default messages using template variables.
- Move Save/Create button to page header alongside Cancel (matching Appearance page).
- Hide Order limit type for MVP.

**Non-Goals:**
- Redesigning the modal or selection UX (done in previous change).
- Adding new features or capabilities beyond what's listed.

## Decisions

### 1. Fix modal list disappearing (RTK Query cache)

**Decision**: Use `useLazyGetWixProductsQuery` with `preferCacheValue: false` option when fetching, or restructure the data flow so the effect that populates `allProducts` doesn't depend on `data` reference changing.

**Approach**: Instead of relying on an effect watching `data`, call `getWixProducts(queryParams).unwrap()` and directly set `allProducts` from the result in the fetch effect. This ensures products are always populated regardless of cache state.

### 2. Fix edit mode showing only IDs

**Decision**: When loading a rule for editing that has `productIds`, make an API call to `wix/products` with `specificIds` param (comma-separated) to fetch full product details (name, image, variants). Map the response to `SelectedProduct[]` and dispatch to Redux.

**Alternative considered**: Store product details in the rule entity — rejected because it duplicates Wix data and gets stale.

### 3. Fix backend search filter condition

**Decision**: Change the condition at `wix.service.ts:127` from `if (query.filter || query.specificIds)` to `if (query.filter || query.specificIds || query.title)` so the title filter is applied when the user searches by name.

### 4. Default message templates

**Decision**: Update `createRule.slice.ts` initial state to set:
- `minQtyLimitMessage`: `'Minimum quantity is {{min_quantity}}'`
- `maxQtyLimitMessage`: `'Maximum quantity is {{max_quantity}}'`

Also update `Preview/config.ts` fallback message to use the template variable pattern and also interpolate `minQtyLimitMessage`.

### 5. Move Save button to page header

**Decision**: Lift the submit handler (validation + create/update mutation) from `Step2Content` up to `CreateRule/index.tsx`. Place the Save/Create button in `Page.Header`'s `actionsBar` next to the existing Cancel button. Step2Content becomes a pure form with no submit button or mutation hooks.

**Rationale**: Matches the Appearance page pattern. The header is always visible, making Save more discoverable. Step2Content stays focused on form rendering.

### 6. Hide Order limit type for MVP

**Decision**: Define an `ENABLED_RULE_TYPES` array excluding `RuleType.ORDER` and use it in `Step1Content` instead of `Object.values(RuleType)`. Keep the enum value and all Order-related code intact for future enablement.

**Rationale**: Minimal change — no feature flag needed, just a filtered array. To re-enable, add `RuleType.ORDER` back to the array.

## Risks / Trade-offs

- **[Edit mode API call]** → Adds an extra API call when loading a rule for editing. Mitigation: Only fires when `productIds` exist; response is small.
- **[Existing rules with empty messages]** → Existing rules saved with empty messages won't retroactively get the new defaults. Mitigation: The preview and frontend rendering already fall back to default messages when fields are empty.
