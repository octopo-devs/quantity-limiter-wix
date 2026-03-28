## ADDED Requirements

### Requirement: Storefront initializes from embedded-script parameters
The storefront entry point SHALL read the `instanceId` from the Wix embedded-script dynamic parameter system instead of reading `data-instance-id` from a DOM script element.

#### Scenario: instanceId from embedded parameter
- **WHEN** the embedded script loads on a Wix site page
- **THEN** the storefront reads `instanceId` from the parameter injected by `embedScript()` (e.g., via a data attribute on the script tag, a global variable set in `embedded.html`, or inline script assignment)

#### Scenario: Fallback for missing instanceId
- **WHEN** `instanceId` is not available (e.g., `embedScript()` was not called)
- **THEN** the storefront logs a warning and exits cleanly without rendering

### Requirement: HMAC key generation uses embedded instanceId
The HMAC public key generation SHALL use the `instanceId` from the embedded-script parameter, replacing the DOM-based `scriptElement.getAttribute('data-instance-id')` pattern.

#### Scenario: Public API authentication
- **WHEN** the storefront calls `GET_SHOP_METAFIELDS`
- **THEN** the HMAC key is generated using the instanceId from the embedded parameter and the request succeeds

### Requirement: React app mount point created dynamically
The storefront SHALL create its own mount point in the DOM since the embedded script does not have a pre-existing container element with a known class.

#### Scenario: Mount element creation
- **WHEN** the storefront initializes in non-editor mode
- **THEN** it creates a container element (or uses the embedded HTML's container) and mounts the React app into it

#### Scenario: Editor mode detection
- **WHEN** `window.location.origin` is `https://static.parastorage.com` (Wix editor)
- **THEN** the storefront renders the `PreviewInEditor` component with quantity-limit styles
