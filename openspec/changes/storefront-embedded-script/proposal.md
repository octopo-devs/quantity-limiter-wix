## Why

The storefront script (`order-limiter-backend/storefront/`) currently builds as a standalone IIFE bundle (`order-limiter.min.js`) that must be manually hosted and injected via a `<script>` tag. Now that the app is migrating to the Wix CLI (`order-limiter/`), the storefront should move into the CLI project as an **embedded-script extension**. This lets Wix handle injection, hosting, deployment, and versioning — eliminating custom hosting infrastructure and aligning both the dashboard and storefront under a single `npm run release`.

## What Changes

- **Create an embedded-script extension** in `order-limiter/src/site/embedded-scripts/quantity-limiter/` with `embedded.json`, `embedded.html`, and the storefront entry point
- **Move storefront source** from `order-limiter-backend/storefront/src/` into the Wix CLI project (contexts, components, core calculator, types, utils, hooks)
- **Replace instanceId initialization** — currently reads `data-instance-id` from the `<script>` DOM element; will switch to Wix dynamic parameters (`{{instanceId}}`) populated via `embedScript()` from the dashboard
- **Add `embedScript()` activation** to the dashboard page — call `embedScript()` with shop parameters during app onboarding/install so Wix injects the storefront script on all site pages
- **Remove self-hosting build** — the Vite IIFE build config (`vite.config.ts` outputting to `../extensions/order-limiter/assets/`) is no longer needed; the Wix CLI bundles and hosts the script

## Capabilities

### New Capabilities
- `embedded-script-extension`: Wix CLI embedded-script setup, configuration, dynamic parameter passing, and `embedScript()` activation from dashboard
- `storefront-initialization`: Adapted initialization flow using Wix embedded-script params instead of DOM `data-*` attributes

### Modified Capabilities
- `storefront-widget`: Move existing storefront source into CLI project structure; the React app, contexts, calculator, and rendering logic remain functionally identical but are relocated and re-entry-pointed

## Impact

- **Wix CLI project (`order-limiter/`)**: New `src/site/embedded-scripts/` directory with storefront source; additional dependencies (styled-components, etc.) added to `package.json`
- **Dashboard page**: Needs to call `embedScript()` to activate the storefront script on install
- **Backend**: No changes — the public `shop-metafield` API remains the same
- **Build/deploy**: Single `npm run release` in `order-limiter/` deploys both dashboard and storefront
- **Old storefront (`order-limiter-backend/storefront/`)**: Can be removed after migration is verified
- **`wixDevelopersAnalytics` listener**: Unchanged — works regardless of injection method
- **Editor preview**: May need adaptation from `parastorage.com` origin check to CLI's preview flow
