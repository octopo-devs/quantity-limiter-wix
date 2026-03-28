## MODIFIED Requirements

### Requirement: Message fields support template variables
The message text fields (Min Quantity Limit Message, Max Quantity Limit Message) SHALL support `{{min_quantity}}` and `{{max_quantity}}` template variables. Users MAY type these variables directly into the text field. Default messages SHALL use these template variables.

#### Scenario: New rule has default messages with template variables
- **WHEN** user creates a new rule and reaches Step 2
- **THEN** the Min Quantity Limit Message field SHALL contain `Minimum quantity is {{min_quantity}}`
- **AND** the Max Quantity Limit Message field SHALL contain `Maximum quantity is {{max_quantity}}`

#### Scenario: Preview shows interpolated default messages immediately
- **WHEN** user creates a new rule with default min=1 and max=10
- **THEN** the preview SHALL display `Maximum quantity is 10` without requiring user interaction

#### Scenario: User types a variable in the message field
- **WHEN** user types `You can only buy {{max_quantity}} items` in the Max Quantity Limit Message field
- **THEN** the field displays the raw template text as typed

#### Scenario: Variable is preserved in stored rule data
- **WHEN** user saves a rule with message `Minimum is {{min_quantity}} items`
- **THEN** the stored message value SHALL be `Minimum is {{min_quantity}} items` (template string, not interpolated)
