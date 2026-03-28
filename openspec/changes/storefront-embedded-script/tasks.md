## 1. Generate Embedded-Script Extension

- [x] 1.1 Run `npm run generate -- --type=EMBEDDED_SCRIPT` in `order-limiter/` to scaffold the extension (or create manually at `src/site/embedded-scripts/quantity-limiter/`)
- [x] 1.2 Configure `embedded.json` with `id` (GUID), `name: "quantity-limiter"`, `scriptType: "FUNCTIONAL"`, `placement: "BODY_END"`
- [x] 1.3 Create `params.dev.json` with test `instanceId` value for local development
- [x] 1.4 Register the extension in `src/extensions.ts` via `.use()`

## 2. Create embedded.html Entry Point

- [x] 2.1 Create `embedded.html` with inline script setting `window.__OL_INSTANCE_ID = "{{instanceId}}"` and a `<script>` tag referencing the storefront entry point
- [x] 2.2 Include a container `<div>` for React mount point (or handle dynamic creation in the entry script)

## 3. Move Storefront Source

- [x] 3.1 Pre-build storefront with Vite IIFE → `assets/order-limiter.min.js` in the embedded-script extension directory
- [x] 3.2 Adapt `main.tsx` in storefront to support `window.__OL_INSTANCE_ID` (with fallback to legacy script tag)
- [x] 3.3 Add storefront dependencies to `order-limiter/package.json` (styled-components, etc.) if not already present
- [x] 3.4 Fix legacy import issues (AppVariableEnum, HiddenInputAttribute, CountdownClassEnum, useShopifyContext)

## 4. Adapt Initialization Flow

- [x] 4.1 Update `main.tsx` to read `instanceId` from `window.__OL_INSTANCE_ID` instead of `scriptElement.getAttribute('data-instance-id')`
- [x] 4.2 Remove `document.getElementById()` script element lookup
- [x] 4.3 Update React mount point — use the container from `embedded.html` or create one dynamically
- [x] 4.4 Ensure `window.estimatedShop`, `window.estimatedRuleLog`, and other globals are still set correctly
- [x] 4.5 Verify `wixDevelopersAnalytics` listener registration works in the embedded-script context

## 5. Dashboard embedScript() Activation

- [x] 5.1 Add `@wix/app-management` dependency to `order-limiter/package.json`
- [x] 5.2 Import `embeddedScripts` from `@wix/app-management` in the dashboard page
- [x] 5.3 Call `embedScript({ parameters: { instanceId } })` on dashboard mount (read instanceId from URL search params)
- [x] 5.4 Ensure `embedScript()` is called WITHOUT `componentId` (single embedded-script rule)

## 6. Build and Verify

- [x] 6.1 Run `npm run build` in `order-limiter/` — verify clean compilation with storefront included
- [ ] 6.2 Run `npm run dev` — verify embedded script loads in the dev site preview
- [ ] 6.3 Test storefront renders quantity-limit messages on a product page with active rules
- [ ] 6.4 Test variant change triggers re-evaluation
- [ ] 6.5 Test page navigation via `wixDevelopersAnalytics` re-initializes the app
- [ ] 6.6 Test editor mode (`parastorage.com`) renders PreviewInEditor component

## 7. Cleanup

- [ ] 7.1 Remove `order-limiter-backend/storefront/` directory after verifying the CLI version works
- [ ] 7.2 Remove storefront-related build scripts from `order-limiter-backend/` if any
- [ ] 7.3 Update CLAUDE.md to reflect the new project structure
