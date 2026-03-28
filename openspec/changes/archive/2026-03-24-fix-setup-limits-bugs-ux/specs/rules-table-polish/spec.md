## ADDED Requirements

### Requirement: Action icons have tooltips
The edit and delete icon buttons in the rules table Action column SHALL display tooltips on hover.

#### Scenario: Edit icon tooltip
- **WHEN** user hovers over the edit icon button
- **THEN** a tooltip displays "Edit rule"

#### Scenario: Delete icon tooltip
- **WHEN** user hovers over the delete icon button
- **THEN** a tooltip displays "Delete rule"

### Requirement: Empty search results show message
The rules table SHALL display an empty state message when a search query returns no results.

#### Scenario: No matching rules
- **WHEN** user types a search query that matches no rules
- **THEN** the table area displays "No rules found" with a suggestion to adjust the search

#### Scenario: Empty state clears when search is cleared
- **WHEN** user clears the search input after seeing the empty state
- **THEN** the full rules list is displayed again

### Requirement: Consistent button label terminology
The create rule form SHALL use "Create Limit" as the submit button label (not "Create Rule") to match the page terminology.

#### Scenario: Create mode button label
- **WHEN** user is on the create new limit page
- **THEN** the submit button reads "Create Limit"

#### Scenario: Edit mode button label unchanged
- **WHEN** user is on the edit limit page
- **THEN** the submit button reads "Save" (no change)

### Requirement: Meaningful default values for Contact Us fields
The create rule form SHALL initialize Contact Us fields with meaningful defaults.

#### Scenario: New rule defaults
- **WHEN** user opens the create new limit form
- **THEN** "Contact Us Button Text" defaults to "Contact Us"
- **AND** "Contact Us Message" defaults to "Please contact our support team for assistance."
