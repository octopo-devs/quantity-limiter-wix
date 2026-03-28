## Context

The storefront script lives at `order-limiter-backend/storefront/` and builds as a standalone Vite IIFE bundle (`order-limiter.min.js`). It self-initializes by reading `data-instance-id` from its own `<script>` DOM element, generates an HMAC key, calls the public `shop-metafield` API, and renders a React app into the DOM.

The app is migrating to the Wix CLI (`order-limiter/`). The dashboard page extension is already set up. Now the storefront needs to move into the same CLI project as an embedded-script extension.

The storefront-widget change (42/46 tasks done) already ported the quantity-limit business logic — calculator, contexts, components, types — into the storefront. That code moves as-is.

## Goals / Non-Goals

**Goals:**
- Move storefront source into the Wix CLI project as an embedded-script extension
- Replace DOM-based instanceId discovery with Wix dynamic parameters
- Add `embedScript()` activation in the dashboard
- Single `npm run release` deploys both dashboard and storefront
- Preserve all storefront functionality identically

**Non-Goals:**
- Rewriting the storefront React app, contexts, or calculator
- Changing the public `shop-metafield` API
- Supporting both old and new injection methods simultaneously (clean cutover)
- Converting to a Wix site-widget or site-plugin (staying with embedded-script)

## Decisions

### 1. Use embedded-script extension, not site-widget

**Decision**: Register the storefront as an `EMBEDDED_SCRIPT` extension with `placement: "BODY_END"`.

**Rationale**: The storefront is a self-contained React app that injects into arbitrary DOM positions via Portal. It doesn't need editor configurability or slot placement. An embedded-script is the direct equivalent of the current `<script>` tag injection, just managed by Wix.

**Alternatives considered**:
- Site-widget: Would require rearchitecting around Wix's widget lifecycle and editor manifest. Overkill for a script that manages its own rendering.
- Site-plugin: Requires a predefined slot in a Wix business solution. Not applicable.

### 2. Pass instanceId via embedded.html inline script

**Decision**: In `embedded.html`, set `window.__OL_INSTANCE_ID = "{{instanceId}}"` in an inline `<script>` block, then reference the main storefront script. The storefront reads `window.__OL_INSTANCE_ID` on init.

**Rationale**: The Wix dynamic parameter system (`{{paramName}}`) works in `embedded.html` content. Using a global variable is the simplest bridge — it requires minimal changes to the existing initialization code (replace `scriptElement.getAttribute('data-instance-id')` with `window.__OL_INSTANCE_ID`).

**Alternatives considered**:
- Data attribute on a div: Would need the storefront to find a specific element, same complexity as current approach.
- Import from a generated module: Not supported by the embedded-script system.

### 3. Move source files directly, don't restructure

**Decision**: Copy the storefront `src/` contents (contexts, components, core, hooks, shared, styled, apis) directly into the embedded-script extension directory. Keep the same internal folder structure.

**Rationale**: The code was just ported and tested in the storefront-widget change. Restructuring introduces risk for zero benefit. Path aliases (`~` and `@nest`) will be configured in the Wix CLI Vite config.

### 4. Activate embedScript() from dashboard on first load

**Decision**: Call `embedScript()` in the dashboard page component's initialization (e.g., `useEffect` on mount), reading the instanceId from URL params. This activates the storefront script for the site.

**Rationale**: The storefront needs to be active on every page as soon as the app is installed. Tying activation to the dashboard's first load ensures it happens during the natural install → dashboard redirect flow. No separate onboarding step needed.

### 5. Remove the old Vite IIFE build after verification

**Decision**: Once the CLI-based storefront is verified working, remove `order-limiter-backend/storefront/` and its Vite build config.

**Rationale**: Maintaining two build systems creates confusion. The CLI handles building and hosting.

## Risks / Trade-offs

- **[Wix CLI bundling limitations]** The CLI may not handle all Vite plugins (styled-components, etc.) the same way → Mitigation: Test the build early; if issues arise, pre-build and reference the output as a static asset
- **[embedScript() timing]** If user never opens the dashboard after install, the script won't activate → Mitigation: The Wix install flow redirects to dashboard by default; this is the standard pattern for all embedded-script apps
- **[Cookie consent]** Using `scriptType: "FUNCTIONAL"` means the script may be blocked until cookie consent is given → Mitigation: This is correct behavior for a functional script; if enforcement must be immediate, `"ESSENTIAL"` could be used but may violate Wix guidelines
- **[Two embedded scripts]** If a future change adds a second embedded script, the `embedScript()` call MUST be updated to include `componentId` → Mitigation: Document this constraint; currently only one script

## Migration Plan

1. Generate the embedded-script extension in the CLI project
2. Copy storefront source into the extension directory
3. Adapt the entry point to read `window.__OL_INSTANCE_ID` instead of DOM attribute
4. Configure path aliases in Astro/Vite config
5. Add `embedScript()` call to the dashboard page
6. Build and test locally with `npm run dev`
7. Release a test version, verify on a dev site
8. Remove `order-limiter-backend/storefront/` after verification

## Open Questions

- Does the Wix CLI Vite build support `styled-components` with the `StyleSheetManager` pattern used in the storefront? Or will the CSS-in-JS approach need adjustment?
- Should `embedScript()` be called every time the dashboard loads, or only once during onboarding? (Wix docs suggest repeated calls update parameters without duplicating)
- Is `FUNCTIONAL` the correct `scriptType`? The script enforces purchase rules, which could be argued as `ESSENTIAL` for the store's operation.
