## ADDED Requirements

### Requirement: Dashboard page extension registration
The system SHALL register the existing frontend as a Wix dashboard page extension in the CLI configuration. The extension MUST be accessible from the Wix site dashboard.

#### Scenario: Extension appears in dashboard
- **WHEN** the app is installed on a Wix site and the user navigates to the dashboard
- **THEN** the Quantity Limiter dashboard page is available and renders the existing admin UI (Home, Rules, Appearance, Feedback pages)

#### Scenario: Extension configuration in wix.config
- **WHEN** the `wix.config.json` is inspected
- **THEN** it contains a dashboard page extension entry pointing to the frontend source directory

### Requirement: Frontend entry point adaptation
The system SHALL adapt the frontend entry point to export a dashboard page component compatible with the Wix CLI extension system, while preserving all existing routing and page functionality.

#### Scenario: Dashboard component export
- **WHEN** the Wix CLI builds the dashboard extension
- **THEN** the entry point exports a valid React component that the Wix dashboard can mount

#### Scenario: Internal routing preserved
- **WHEN** the dashboard extension is loaded
- **THEN** all existing routes (Home, Rules, Appearance, Feedback) are accessible and functional within the dashboard context

### Requirement: Auth token from Wix SDK context
The system SHALL obtain authentication tokens from the Wix SDK dashboard context instead of manual URL parameter extraction. The token MUST be passed to the backend API in the Authorization header.

#### Scenario: Token retrieval via SDK
- **WHEN** the dashboard extension initializes
- **THEN** the frontend obtains the auth token from the Wix SDK context (e.g., `@wix/dashboard` SDK instance) without requiring URL query parameters

#### Scenario: Backend API calls with SDK token
- **WHEN** the frontend makes an API call to the backend
- **THEN** the request includes the Wix SDK-provided token in the Authorization header, and the backend `HeaderAuthGuard` validates it successfully

### Requirement: Preserve existing UI and functionality
The system SHALL render all existing pages and features identically within the Wix CLI dashboard extension context. No visual or functional regressions SHALL occur.

#### Scenario: Rules page functionality
- **WHEN** a user navigates to the Rules page in the dashboard extension
- **THEN** the rules CRUD table displays correctly with all filtering, sorting, and action capabilities intact

#### Scenario: Wix Design System rendering
- **WHEN** the dashboard extension loads
- **THEN** all `@wix/design-system` components render correctly within the Wix dashboard host environment
