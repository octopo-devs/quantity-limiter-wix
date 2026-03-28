## MODIFIED Requirements

### Requirement: Min/Max inputs rendered inside OrderRuleSetup
When rule type is ORDER, the `OrderRuleSetup` component SHALL render the min and max value inputs directly below the condition type dropdown, instead of relying on the shared "Quantity Limits" section.

#### Scenario: TOTAL_PRODUCTS selected
- **WHEN** the user selects TOTAL_PRODUCTS as the order condition type
- **THEN** two inputs labeled "Min Quantity" and "Max Quantity" are rendered below the dropdown inside `OrderRuleSetup`

#### Scenario: TOTAL_PRICE selected
- **WHEN** the user selects TOTAL_PRICE as the order condition type
- **THEN** two inputs labeled "Min Price" and "Max Price" are rendered below the dropdown inside `OrderRuleSetup`

#### Scenario: Values bound to createRule.minQty and createRule.maxQty
- **WHEN** the user changes the min or max input inside OrderRuleSetup
- **THEN** `createRule.minQty` and `createRule.maxQty` in Redux state are updated

#### Scenario: Validation error on min greater than max
- **WHEN** the user sets min value greater than max value and submits
- **THEN** a toast notification appears with "Min quantity must be less than or equal to max quantity"
