## ADDED Requirements

### Requirement: Table columns use accurate date labels
The rules table SHALL label its date columns as "Created" and "Updated" to accurately reflect the `createdAt` and `updatedAt` timestamps they display.

#### Scenario: Column headers show correct labels
- **WHEN** user views the Limits management table
- **THEN** the date columns are labeled "Created" and "Updated" (not "Start" and "End")

#### Scenario: Date values remain unchanged
- **WHEN** user views date values in the table
- **THEN** each row shows the rule's `createdAt` date under "Created" and `updatedAt` date under "Updated"
