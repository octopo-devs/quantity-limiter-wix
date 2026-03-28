## ADDED Requirements

### Requirement: Toast notifications render in standalone mode
The toast notification system SHALL display feedback messages when the app is running outside of the Wix embedded iframe (standalone mode at localhost:3000).

#### Scenario: Validation error toast on empty rule name
- **WHEN** user clicks "Create Limit" with an empty Rule Name field
- **THEN** a toast notification appears with the message "Please fill in all required fields"

#### Scenario: Success toast after rule creation
- **WHEN** user fills all required fields and clicks "Create Limit"
- **THEN** a toast notification appears with "Rule created successfully"

#### Scenario: Success toast after rule update
- **WHEN** user edits a rule and clicks "Save"
- **THEN** a toast notification appears with "Rule updated successfully"

### Requirement: Inline validation hint for required Rule Name field
The Rule Name input SHALL display a visual error state when the user attempts to submit with an empty name.

#### Scenario: Empty name submission highlights field
- **WHEN** user clicks "Create Limit" with an empty Rule Name
- **THEN** the Rule Name input shows a red border and error text "Rule name is required"
- **AND** the Step 2 accordion expands if collapsed

#### Scenario: Error clears on input
- **WHEN** user types into the Rule Name field after a validation error
- **THEN** the red border and error text are removed
