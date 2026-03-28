## 1. Interface Alignment Verification

- [x] 1.1 Verify `RuleGroupProductCondition` interface in frontend `rule.interface.ts` matches backend — fields: `type`, `operator`, `value: string | string[]`
- [x] 1.2 Verify `RuleGroupProductConditionType` and `RuleGroupProductConditionOperator` enums in frontend `rule.enum.ts` match backend enum values

## 2. GroupProductConditionBuilder Component

- [x] 2.1 Create `src/components/GroupProductConditionBuilder/index.tsx` — receives `conditions: RuleGroupProductCondition[]` and `onChange: (conditions: RuleGroupProductCondition[]) => void`
- [x] 2.2 Render each condition as a row: type dropdown (Tag / Name), operator dropdown (6 options with human-readable labels), value text input, remove button
- [x] 2.3 Add "Add Condition" button that appends a new empty condition row with default type=TAG, operator=EQUALS, value=''
- [x] 2.4 Implement remove handler — removes the row and calls `onChange` with updated array
- [x] 2.5 Add dropdown options config: `groupProductTypeOptions` (Tag, Name) and `groupProductOperatorOptions` (all 6 with labels) to `Step2Content/config.ts`

## 3. Wire GroupProductConditionBuilder into ProductRuleSetup

- [x] 3.1 Replace the JSON `<textarea>` block in `ProductRuleSetup` (the `GROUP_OF_PRODUCTS` section) with `<GroupProductConditionBuilder>`
- [x] 3.2 Wire `onChange` to call `onFieldChange('groupProducts', conditions)` to update Redux state
- [x] 3.3 Keep the existing conjunction dropdown (AND/OR) rendering alongside the condition builder

## 4. OrderRuleSetup — Move Min/Max Inputs

- [x] 4.1 Add `minQty`, `maxQty`, and `onRuleFieldChange` props to `OrderRuleSetup` component
- [x] 4.2 Render min/max inputs inside `OrderRuleSetup` below the condition type dropdown with context-aware labels — "Min Quantity"/"Max Quantity" for TOTAL_PRODUCTS, "Min Price"/"Max Price" for TOTAL_PRICE
- [x] 4.3 Remove `TOTAL_WEIGHT` from `orderConditionOptions` in `Step2Content/config.ts`

## 5. Hide Shared Quantity Limits for ORDER

- [x] 5.1 In `Step2Content`, wrap the "Quantity Limits" section with `createRule.type !== RuleType.ORDER` condition so it does not render for ORDER rules
- [x] 5.2 Pass `minQty`, `maxQty`, and `handleFieldChange` as props to `OrderRuleSetup` in `Step2Content`
