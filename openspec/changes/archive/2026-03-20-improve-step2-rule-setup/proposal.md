## Why

The Step 2 rule configuration UI has two broken/incomplete areas:

1. **GROUP_OF_PRODUCTS condition builder** — the `ProductRuleSetup` renders a raw JSON `<textarea>` for `groupProducts`. No store owner will type valid JSON. This makes the GROUP_OF_PRODUCTS selection type effectively unusable.

2. **ORDER rule min/max placement** — the ORDER rule type reuses the shared `minQty`/`maxQty` section, but those fields should appear directly under the order condition type dropdown so the form reads as a cohesive unit. The shared "Quantity Limits" section should hide when ORDER is selected to avoid confusion. Additionally, `TOTAL_WEIGHT` is not needed for MVP and should be removed from the dropdown.

A secondary concern: the `RuleGroupProductCondition` interface (which backs the `groupProducts` JSON column) must stay aligned between backend DTOs and frontend types as we build a proper UI for it.

## What Changes

- **Group Product Condition Builder**: Replace the JSON textarea in `ProductRuleSetup` (when `conditionType === GROUP_OF_PRODUCTS`) with a dynamic row-based condition builder. Each row has a type dropdown (Tag / Name), an operator dropdown (6 options), and a value text input. Rows can be added/removed. MVP scope: only TAG and TITLE types (VENDOR excluded from dropdown).

- **Order rule min/max relocation**: Move the min/max quantity inputs into `OrderRuleSetup` component. Labels adapt based on `conditionType` — "Min/Max Quantity" for TOTAL_PRODUCTS, "Min/Max Price" for TOTAL_PRICE. Hide the shared "Quantity Limits" section in `Step2Content` when `type === ORDER`. Remove `TOTAL_WEIGHT` from the frontend dropdown options.

- **Interface alignment**: Verify and ensure the `RuleGroupProductCondition` interface (`type`, `operator`, `value` fields), the `RuleGroupProductConditionType` enum, and the `RuleGroupProductConditionOperator` enum are consistent between backend (`rules.dto.ts` / `rule.interface.ts` / `rule.enum.ts`) and frontend (`rule.interface.ts` / `rule.enum.ts`). The `value` field is typed `string | string[]` — the condition builder should handle this correctly (single text input, stored as string).

## Capabilities

### New Capabilities

- `group-product-condition-builder`: A reusable row-based condition builder component for GROUP_OF_PRODUCTS rules, supporting add/remove rows with type, operator, and value inputs.

### Modified Capabilities

- `order-rule-setup`: ORDER rule now owns its min/max inputs with context-aware labels; shared Quantity Limits section hidden for ORDER type.

## Impact

- **Frontend only** — no backend changes required. All enums, DTOs, and entity fields already exist. The `groupProducts` JSON field, `RuleGroupProductCondition` interface, and all operator/type enums are already defined on the backend.
- Files affected: `ProductRuleSetup`, `OrderRuleSetup`, `Step2Content`, `Step2Content/config.ts` (dropdown options), possibly a new `GroupProductConditionBuilder` component.
