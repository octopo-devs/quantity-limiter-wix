## ADDED Requirements

### Requirement: Edit button navigates to edit page
The Edit icon in the Rules table SHALL navigate to `/rules/edit/:id` instead of calling `console.log`.

#### Scenario: Click edit
- **WHEN** the user clicks the Edit icon for a rule in the Rules table
- **THEN** the browser navigates to `/rules/edit/:id` for that rule

### Requirement: Edit page pre-fills form with existing rule data
The `CreateRule` page SHALL detect an `:id` param (route `/rules/edit/:id`), fetch the rule via `GET /rules/:id`, and pre-populate all Redux create-rule state fields before rendering the form.

#### Scenario: Form pre-filled on load
- **WHEN** the user lands on `/rules/edit/:id`
- **THEN** all form fields (name, type, qty limits, messages, sub-entity fields) are populated with the existing rule values

#### Scenario: Loading state while fetching rule
- **WHEN** the rule data has not yet loaded
- **THEN** a `Loader` is displayed in place of the form content

#### Scenario: Submit updates rule
- **WHEN** the user modifies fields and clicks "Save"
- **THEN** `PUT /rules/:id` is called with the updated data, a success toast appears, and the user is navigated back to `/rules`

### Requirement: Step 1 not pre-completed on fresh create
Redux initial state SHALL NOT pre-set `createRule.type`; `type` SHALL start as `undefined` so Step 1 shows as incomplete until the user explicitly selects a rule type.

#### Scenario: Fresh create page - Step 1 incomplete
- **WHEN** the user navigates to `/rules/create`
- **THEN** the Step 1 indicator shows as incomplete (no checkmark) and Step 2 is collapsed

#### Scenario: After selecting type - Step 1 complete
- **WHEN** the user clicks a rule type card in Step 1
- **THEN** the Step 1 indicator shows a checkmark and Step 2 expands

### Requirement: Form validation on submit
The submit handler SHALL validate:
- `name` is non-empty
- `minQty` is ≤ `maxQty`
- For PRODUCT rules with `SPECIFIC_PRODUCTS` condition: at least one product selected
- For COLLECTION rules: at least one collection selected

#### Scenario: Min greater than max
- **WHEN** the user submits with `minQty` > `maxQty`
- **THEN** a toast error is shown: "Min quantity must be less than or equal to max quantity"

### Requirement: breakMultipleLimitMessage field in create form
When a PRODUCT rule has `sellProductInMultiples` enabled, Step 2 SHALL render an input for `breakMultipleLimitMessage`.

#### Scenario: Field appears conditionally
- **WHEN** rule type is PRODUCT and `sellProductInMultiples` is toggled on
- **THEN** a "Break Multiple Limit Message" input appears in the Messages section

#### Scenario: Field hidden when not applicable
- **WHEN** `sellProductInMultiples` is off (or rule type is not PRODUCT)
- **THEN** the "Break Multiple Limit Message" input is not rendered
