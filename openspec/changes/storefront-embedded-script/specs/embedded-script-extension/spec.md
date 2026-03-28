## ADDED Requirements

### Requirement: Embedded-script extension registered in Wix CLI project
The Wix CLI project SHALL contain an embedded-script extension at `src/site/embedded-scripts/quantity-limiter/` with valid `embedded.json` and `embedded.html` files.

#### Scenario: Extension files exist
- **WHEN** the `order-limiter/src/site/embedded-scripts/quantity-limiter/` directory is inspected
- **THEN** it contains `embedded.json`, `embedded.html`, and the storefront entry point script

#### Scenario: Extension metadata configured
- **WHEN** `embedded.json` is read
- **THEN** it specifies `scriptType: "FUNCTIONAL"` and `placement: "BODY_END"` with a valid GUID `id` and `name: "quantity-limiter"`

#### Scenario: Extension registered in extensions.ts
- **WHEN** `src/extensions.ts` is inspected
- **THEN** the embedded-script extension is imported and registered via `.use()`

### Requirement: Embedded HTML references storefront script
The `embedded.html` SHALL reference the storefront entry point script and pass the `{{instanceId}}` dynamic parameter so the storefront can identify the shop.

#### Scenario: Script tag with dynamic parameter
- **WHEN** `embedded.html` is rendered by Wix on a site page
- **THEN** the storefront script loads with access to the resolved `instanceId` value

#### Scenario: CSS included
- **WHEN** the embedded script loads on a site page
- **THEN** the storefront styles are applied (either inline or via a referenced CSS file)

### Requirement: Dashboard activates embedded script via embedScript()
The dashboard page SHALL call `embedScript()` from `@wix/app-management` to activate the storefront script injection, passing the shop's `instanceId` as a dynamic parameter.

#### Scenario: Script activated on app install
- **WHEN** the app completes installation and the dashboard page loads for the first time
- **THEN** `embedScript()` is called with `{ parameters: { instanceId: "<shop-instance-id>" } }` to activate the storefront

#### Scenario: Single embedded script — no componentId
- **WHEN** the app has only one embedded-script extension
- **THEN** `embedScript()` is called WITHOUT a `componentId` option (as per Wix docs, passing componentId with a single script breaks production)

#### Scenario: Script already activated
- **WHEN** `embedScript()` has already been called for this site
- **THEN** subsequent calls update the parameters without creating duplicate injections

### Requirement: Dev parameter file for local development
The extension SHALL include a `params.dev.json` file with test values for local development with `npm run dev`.

#### Scenario: Local dev parameter values
- **WHEN** a developer runs `npm run dev`
- **THEN** the embedded script receives test values from `params.dev.json` (e.g., a test `instanceId`)
