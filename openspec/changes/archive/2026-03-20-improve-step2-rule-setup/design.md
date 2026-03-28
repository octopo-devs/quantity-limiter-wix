## Context

The create/edit rule wizard (Step 2) has type-specific setup components: `ProductRuleSetup`, `CollectionRuleSetup`, `CustomerRuleSetup`, `OrderRuleSetup`. Two of these need fixes:

- `ProductRuleSetup` renders a raw JSON textarea for the `GROUP_OF_PRODUCTS` path — unusable for store owners.
- `OrderRuleSetup` shows only a condition type dropdown; the min/max values are in a shared section below, disconnected from the order context.

The backend already supports everything needed — all enums (`RuleGroupProductConditionType`, `RuleGroupProductConditionOperator`), DTOs (`RuleGroupProductConditionDto`, `RuleOrderDto`), and the `groupProducts` JSON column are in place. This is purely a frontend change.

Current frontend interfaces (already aligned with backend):
- `RuleGroupProductCondition { type, operator, value: string | string[] }` in `rule.interface.ts`
- `RuleGroupProductConditionType { TAG, VENDOR, TITLE }` in `rule.enum.ts`
- `RuleGroupProductConditionOperator { EQUALS, NOT_EQUALS, CONTAINS, NOT_CONTAINS, STARTS_WITH, ENDS_WITH }` in `rule.enum.ts`

## Goals / Non-Goals

**Goals:**
- Replace GROUP_OF_PRODUCTS JSON textarea with a visual condition builder (TAG and TITLE types only for MVP).
- Move min/max inputs into `OrderRuleSetup` with context-aware labels; hide the shared "Quantity Limits" section when type is ORDER.
- Remove `TOTAL_WEIGHT` from the frontend ORDER condition dropdown.
- Ensure `RuleGroupProductCondition` interface stays aligned between backend and frontend.

**Non-Goals:**
- Backend changes (all required fields/enums exist).
- Supporting VENDOR condition type in the condition builder (deferred post-MVP).
- Redesigning the two-step wizard layout.
- Changing how `groupProducts` JSON is stored or validated on the backend.

## Decisions

**1. New `GroupProductConditionBuilder` component**
- A standalone component at `src/components/GroupProductConditionBuilder/index.tsx`.
- Renders dynamic rows: each row = `[type dropdown] [operator dropdown] [value input] [remove button]`.
- "Add Condition" button appends a new empty row.
- Type dropdown shows only "Tag" and "Name" (maps to `TAG` and `TITLE` enums). VENDOR is omitted from the dropdown but remains in the enum for backward compatibility.
- Operator dropdown shows all 6 operators with human-readable labels.
- Value field is a plain text input. Stored as `string` (not array) — consistent with how the backend accepts it.
- The component receives `conditions: RuleGroupProductCondition[]` and `onChange: (conditions: RuleGroupProductCondition[]) => void`.
- Alternative: inline everything in `ProductRuleSetup`. Rejected — the builder has enough complexity to warrant its own component, and it's reusable if other condition builders are needed later.

**2. Condition builder renders inside `ProductRuleSetup` only when `conditionType === GROUP_OF_PRODUCTS`**
- Replaces the existing `<textarea>` block.
- Conjunction dropdown (AND/OR) stays where it is — already rendered correctly above the condition rows.

**3. `OrderRuleSetup` receives min/max handling via props**
- `OrderRuleSetup` accepts `minQty`, `maxQty`, and `onFieldChange` (for the parent Rule fields).
- Labels adapt based on `conditionType`:
  - `TOTAL_PRODUCTS` → "Min Quantity" / "Max Quantity"
  - `TOTAL_PRICE` → "Min Price" / "Max Price"
- Alternative: duplicate the Input elements. Rejected — we pass the same `handleFieldChange` from `Step2Content` to keep a single source of truth.

**4. Hide shared "Quantity Limits" section when `type === ORDER`**
- In `Step2Content`, wrap the "Quantity Limits" block with `{createRule.type !== RuleType.ORDER && (...)}`.
- The data still lives in `createRule.minQty` / `createRule.maxQty` — no state changes, just UI relocation.

**5. Drop `TOTAL_WEIGHT` from frontend only**
- Remove `TOTAL_WEIGHT` from `orderConditionOptions` in `Step2Content/config.ts`.
- Keep the enum value in `rule.enum.ts` for backward compatibility (existing rules with TOTAL_WEIGHT shouldn't break if loaded).

**6. Interface verification (no changes expected)**
- Frontend `RuleGroupProductCondition` in `rule.interface.ts` already matches backend `RuleGroupProductCondition` in `rule.interface.ts`.
- Frontend enums `RuleGroupProductConditionType` and `RuleGroupProductConditionOperator` already match backend enums.
- The `value` field is `string | string[]` on both sides. The condition builder will always produce `string` — the union type accommodates existing data that may have been seeded as arrays.

## Risks / Trade-offs

- [Condition builder UX] Adding many condition rows could make the form long. Mitigation: acceptable for MVP; can add collapse/limit later.
- [TOTAL_WEIGHT backward compat] Existing ORDER rules with `TOTAL_WEIGHT` will still load and display, but the user won't be able to select that option for new rules. Mitigation: keep enum in code, just remove from dropdown options.
- [Value as string vs array] The backend accepts `string | string[]` for `value`. The condition builder always produces a single string. If a rule was previously created with an array value (e.g., via API/seed), the condition builder will display `value.toString()`. Mitigation: acceptable for MVP — the JSON textarea was the only way to set arrays, and no real user data should have this.
