## ADDED Requirements

### Requirement: Message fields support template variables
The message text fields (Min Quantity Limit Message, Max Quantity Limit Message) SHALL support `{{min_quantity}}` and `{{max_quantity}}` template variables. Users MAY type these variables directly into the text field.

#### Scenario: User types a variable in the message field
- **WHEN** user types `You can only buy {{max_quantity}} items` in the Max Quantity Limit Message field
- **THEN** the field displays the raw template text as typed

#### Scenario: Variable is preserved in stored rule data
- **WHEN** user saves a rule with message `Minimum is {{min_quantity}} items`
- **THEN** the stored message value SHALL be `Minimum is {{min_quantity}} items` (template string, not interpolated)

### Requirement: Preview interpolates template variables in real time
The live preview panel SHALL replace `{{min_quantity}}` and `{{max_quantity}}` in message text with the actual Min Quantity and Max Quantity values from the form.

#### Scenario: Preview updates when message contains variables
- **WHEN** user sets Max Quantity to `5` and Max Quantity Limit Message to `Max is {{max_quantity}} items`
- **THEN** the preview SHALL display `Max is 5 items`

#### Scenario: Preview updates when quantity value changes
- **WHEN** user has message `Limit: {{min_quantity}} to {{max_quantity}}` with Min=2, Max=10
- **AND** user changes Max Quantity from `10` to `15`
- **THEN** the preview SHALL immediately update to display `Limit: 2 to 15`

#### Scenario: Preview handles missing variable values gracefully
- **WHEN** user types `{{min_quantity}}` in a message but Min Quantity field is empty
- **THEN** the preview SHALL display the raw `{{min_quantity}}` text without interpolation

### Requirement: Helper text shows available variables
Each message text field SHALL display helper text listing the available template variables.

#### Scenario: Helper text is visible below message fields
- **WHEN** user views the Messages section in Step 2
- **THEN** helper text reading "Available variables: {{min_quantity}}, {{max_quantity}}" SHALL be visible below each message input field

### Requirement: Default notification trigger is Limit Reached
When creating a new rule, the "Notify About Limit When" dropdown SHALL default to "Limit reached".

#### Scenario: New rule has Limit Reached pre-selected
- **WHEN** user navigates to the create new limit screen and reaches Step 2
- **THEN** the "Notify About Limit When" dropdown SHALL show "Limit reached" as the selected value

#### Scenario: Edit mode preserves existing notification trigger
- **WHEN** user edits an existing rule that has "No notification" as the trigger
- **THEN** the dropdown SHALL show "No notification" (not override with default)

### Requirement: Hide Sell Product in Multiples for MVP
The "Sell Product in Multiples" toggle SHALL NOT be visible in the rule creation/edit form. The "Multiple" column SHALL NOT be visible in the rules table.

#### Scenario: Multiples toggle is hidden in product rule setup
- **WHEN** user creates or edits a PRODUCT type rule
- **THEN** the "Sell Product in Multiples" toggle SHALL NOT appear in the form

#### Scenario: Multiple column is hidden in rules table
- **WHEN** user views the rules management table
- **THEN** there SHALL be no "Multiple" column in the table

#### Scenario: Break Multiple Limit Message is hidden
- **WHEN** user creates or edits a PRODUCT type rule
- **THEN** the "Break Multiple Limit Message" field SHALL NOT appear (since the toggle that controls it is hidden)
