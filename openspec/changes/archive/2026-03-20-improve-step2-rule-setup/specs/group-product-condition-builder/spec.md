## ADDED Requirements

### Requirement: Visual condition builder for GROUP_OF_PRODUCTS
When `ProductRuleSetup` condition type is `GROUP_OF_PRODUCTS`, the system SHALL render a `GroupProductConditionBuilder` component instead of the raw JSON textarea. The builder SHALL display dynamic condition rows and an "Add Condition" button.

#### Scenario: Empty state on fresh rule
- **WHEN** the user selects GROUP_OF_PRODUCTS and no conditions exist yet
- **THEN** a single empty condition row is displayed with default dropdowns and an empty value input

#### Scenario: Add a condition row
- **WHEN** the user clicks "Add Condition"
- **THEN** a new empty condition row is appended below the existing rows

#### Scenario: Remove a condition row
- **WHEN** the user clicks the remove button on a condition row
- **THEN** that row is removed from the list and `groupProducts` state is updated

#### Scenario: Remove last condition row
- **WHEN** only one condition row exists and the user clicks remove
- **THEN** the row is removed, leaving the empty state with "Add Condition" button

### Requirement: Condition row type dropdown limited to Tag and Name
Each condition row SHALL display a type dropdown with only two options: "Tag" (maps to `RuleGroupProductConditionType.TAG`) and "Name" (maps to `RuleGroupProductConditionType.TITLE`).

#### Scenario: Type dropdown options
- **WHEN** the user opens the type dropdown on a condition row
- **THEN** exactly two options are shown: "Tag" and "Name"

#### Scenario: VENDOR type excluded
- **WHEN** the user opens the type dropdown
- **THEN** "Vendor" is NOT shown as an option

### Requirement: Condition row operator dropdown
Each condition row SHALL display an operator dropdown with all six `RuleGroupProductConditionOperator` values: Equals, Not Equals, Contains, Not Contains, Starts With, Ends With.

#### Scenario: Operator dropdown options
- **WHEN** the user opens the operator dropdown on a condition row
- **THEN** six options are shown with human-readable labels

#### Scenario: Select operator
- **WHEN** the user selects an operator
- **THEN** the condition's `operator` field is updated in `groupProducts` state

### Requirement: Condition row value input
Each condition row SHALL display a text input for the condition value. The value SHALL be stored as a `string` in the `RuleGroupProductCondition.value` field.

#### Scenario: Enter value
- **WHEN** the user types in the value input
- **THEN** the condition's `value` field is updated in `groupProducts` state

#### Scenario: Empty value allowed
- **WHEN** the user leaves the value input empty
- **THEN** the condition row remains valid (validation is at submit time, not inline)

### Requirement: Condition builder updates Redux state
The `GroupProductConditionBuilder` SHALL call the parent's `onFieldChange('groupProducts', conditions)` whenever any condition row is added, removed, or modified, keeping `createRule.ruleProduct.groupProducts` in sync.

#### Scenario: Modify a condition
- **WHEN** the user changes any field (type, operator, or value) in a condition row
- **THEN** `ruleProduct.groupProducts` in Redux state reflects the updated condition list

### Requirement: Conjunction dropdown works with condition builder
The existing conjunction dropdown (AND/OR) in `ProductRuleSetup` SHALL continue to render when `conditionType === GROUP_OF_PRODUCTS`, controlling `ruleProduct.conjunction`.

#### Scenario: Conjunction visible with conditions
- **WHEN** condition type is GROUP_OF_PRODUCTS and conditions exist
- **THEN** the AND/OR conjunction dropdown is visible above or beside the condition rows

### Requirement: Interface alignment for RuleGroupProductCondition
The frontend `RuleGroupProductCondition` interface in `rule.interface.ts` and the enums `RuleGroupProductConditionType` and `RuleGroupProductConditionOperator` in `rule.enum.ts` SHALL match the backend definitions in `rule.interface.ts`, `rule.enum.ts`, and `RuleGroupProductConditionDto`.

#### Scenario: Interface fields match
- **WHEN** comparing frontend and backend `RuleGroupProductCondition`
- **THEN** both define `type: RuleGroupProductConditionType`, `operator: RuleGroupProductConditionOperator`, `value: string | string[]`

#### Scenario: Enum values match
- **WHEN** comparing frontend and backend `RuleGroupProductConditionType` and `RuleGroupProductConditionOperator`
- **THEN** both contain the same set of enum values
