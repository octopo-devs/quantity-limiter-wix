## ADDED Requirements

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

### Requirement: Shared Quantity Limits section hidden for ORDER type
The shared "Quantity Limits" section in `Step2Content` SHALL NOT render when `createRule.type === RuleType.ORDER`.

#### Scenario: ORDER type hides shared section
- **WHEN** the user selects ORDER as the rule type
- **THEN** the "Quantity Limits" section below the type-specific setup is not visible

#### Scenario: Other types show shared section
- **WHEN** the user selects PRODUCT, COLLECTION, or CUSTOMER as the rule type
- **THEN** the "Quantity Limits" section is visible as before

### Requirement: TOTAL_WEIGHT removed from ORDER condition dropdown
The ORDER condition type dropdown SHALL show only two options: "Total Products" (`TOTAL_PRODUCTS`) and "Total Price" (`TOTAL_PRICE`). `TOTAL_WEIGHT` SHALL NOT appear in the dropdown.

#### Scenario: Dropdown options
- **WHEN** the user opens the order condition type dropdown
- **THEN** exactly two options are shown: "Total Products" and "Total Price"

#### Scenario: Existing TOTAL_WEIGHT rules still load
- **WHEN** an existing rule with `conditionType = TOTAL_WEIGHT` is loaded for editing
- **THEN** the form loads without error (the enum value remains in code for backward compatibility)
