## ADDED Requirements

### Requirement: Home page displays rule statistics
The Home page SHALL display a summary of the user's rules with counts for total, active, and inactive rules.

#### Scenario: Dashboard shows rule counts
- **WHEN** user navigates to the Home page
- **THEN** the page displays cards showing total rules count, active rules count, and inactive rules count

#### Scenario: Loading state while fetching
- **WHEN** rule data is being fetched
- **THEN** the Home page displays a loading spinner

### Requirement: Home page provides quick action to create a rule
The Home page SHALL include a call-to-action button that navigates to the Create Rule page.

#### Scenario: Quick action button navigates to create
- **WHEN** user clicks the "Create new limit" button on the Home page
- **THEN** the app navigates to `/rules/create`

### Requirement: Home page has a proper page layout
The Home page SHALL use the Wix Design System `Page` component with a header title of "Dashboard".

#### Scenario: Page renders with correct structure
- **WHEN** user navigates to the Home page
- **THEN** the page displays a header with title "Dashboard" and structured content below
