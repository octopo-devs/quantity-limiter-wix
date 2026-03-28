## ADDED Requirements

### Requirement: Collection browse modal in CollectionRuleSetup
`CollectionRuleSetup` SHALL replace the raw comma-separated text input with a "Browse" button that opens `SelectCollectionModal`, which fetches collections from `GET /attributes/collections` and lets the user select one or more.

#### Scenario: Open modal and select collections
- **WHEN** the user clicks "Browse" in `CollectionRuleSetup`
- **THEN** `SelectCollectionModal` opens showing a searchable, paginated list of store collections

#### Scenario: Confirm selection
- **WHEN** the user checks one or more collections and clicks "Add"
- **THEN** the modal closes and the selected collections are displayed as chips/rows in `CollectionRuleSetup`, and `ruleCollection.collectionIds` is updated in Redux state

#### Scenario: Remove a selected collection
- **WHEN** the user clicks "Remove" on a selected collection chip
- **THEN** that collection is removed from the displayed list and from `ruleCollection.collectionIds`

#### Scenario: Re-open modal preserves prior selection
- **WHEN** the user opens the modal after already having selected collections
- **THEN** previously selected collections appear pre-checked in the modal list

### Requirement: SelectCollectionModal component
The system SHALL provide a `SelectCollectionModal` component (at `src/components/SelectCollectionModal/`) that mirrors the API and behaviour of `SelectWixProductModal` but operates on collections (flat list, no variants).

#### Scenario: Search filters collections
- **WHEN** the user types in the search field
- **THEN** the list updates to show only collections whose name matches the query (debounced)

#### Scenario: Empty state
- **WHEN** no collections match the search query
- **THEN** the modal displays a "No collections found" message

### Requirement: Create-limit form validation for collection selection
When `ruleCollection.conditionType` requires specific collections, the form SHALL not submit unless at least one collection is selected.

#### Scenario: Submit with no collections selected
- **WHEN** the user clicks "Create Rule" with collection type selected but no collections chosen
- **THEN** a toast error is shown: "Please select at least one collection"
