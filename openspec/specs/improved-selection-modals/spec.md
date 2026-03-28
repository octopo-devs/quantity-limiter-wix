## ADDED Requirements

### Requirement: Product selection modal has improved visual hierarchy
The product selection modal SHALL display products with clear visual hierarchy including properly sized images, readable product names, and distinct variant grouping.

#### Scenario: Products display with images and structured layout
- **WHEN** user opens the product selection modal via "Browse" button
- **THEN** each product SHALL display with a thumbnail image (or placeholder), bold product name, and variants listed as indented sub-items with clear visual separation

#### Scenario: Selected products count is visible in modal
- **WHEN** user selects 3 products in the product selection modal
- **THEN** the modal header or action area SHALL display a count indicator (e.g., "3 selected")

### Requirement: Product selection modal has improved search and feedback
The product selection modal SHALL provide a sticky search bar and clear visual feedback for selected items.

#### Scenario: Search bar remains visible while scrolling
- **WHEN** user scrolls through a long product list in the modal
- **THEN** the search input SHALL remain fixed at the top of the modal

#### Scenario: Selected products have clear visual indicator
- **WHEN** user selects a product in the modal
- **THEN** the product row SHALL show a distinct checked state (checkbox checked + highlighted background)

### Requirement: Selected products list shows clear management UI
The list of selected products displayed below the "Browse" button SHALL provide clear product cards with images, names, and easy removal.

#### Scenario: Selected products display as manageable cards
- **WHEN** user has selected products for a specific-products rule
- **THEN** each selected product SHALL display as a card/row with thumbnail, product name, variant info (if applicable), and a remove/delete action

### Requirement: Collection selection modal has improved visual hierarchy
The collection selection modal SHALL display collections with clear visual hierarchy and selection feedback matching the product modal improvements.

#### Scenario: Collections display with clear layout
- **WHEN** user opens the collection selection modal via "Browse" button
- **THEN** each collection SHALL display with its name in a clear, readable format with checkbox selection

#### Scenario: Selected collections count is visible in modal
- **WHEN** user selects 2 collections in the collection selection modal
- **THEN** the modal header or action area SHALL display a count indicator (e.g., "2 selected")

#### Scenario: Search bar remains visible while scrolling in collection modal
- **WHEN** user scrolls through a long collection list in the modal
- **THEN** the search input SHALL remain fixed at the top of the modal

### Requirement: Selected collections list shows clear management UI
The list of selected collections displayed below the "Browse" button SHALL provide clear collection items with easy removal.

#### Scenario: Selected collections display with remove action
- **WHEN** user has selected collections for a collection rule
- **THEN** each selected collection SHALL display with its name and a remove/delete action button
