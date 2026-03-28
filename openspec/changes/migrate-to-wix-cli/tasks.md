## 1. Wix CLI Project Scaffold

- [x] 1.1 Run `npm create @wix/app@latest` at the repo root, selecting "Extend existing application" and choosing the Quantity Limiter app
- [x] 1.2 Verify the generated files: `wix.config.json`, `.wix/` directory, root `package.json` with `@wix/cli` and `@wix/app` dependencies
- [x] 1.3 Add `.wix/` to `.gitignore` if it contains local-only state (auth tokens, dev site config)
- [x] 1.4 Install dependencies with `npm install` at the repo root

## 2. Dashboard Page Extension Setup

- [x] 2.1 Register a dashboard page extension in `wix.config.json` pointing to the frontend source
- [x] 2.2 Create the dashboard page entry point file that exports a React component wrapping the existing `App.tsx`
- [x] 2.3 Configure the extension's route/slug to match the existing app's dashboard URL

## 3. Frontend Entry Point Adaptation

- [x] 3.1 Create a new entry point file for the Wix CLI dashboard extension that imports and renders the existing `App` component
- [x] 3.2 Wrap the app with any required Wix CLI providers (e.g., `WixDesignSystemProvider` if not already present)
- [x] 3.3 Ensure React Router works within the dashboard extension context (adjust `BrowserRouter` base path if needed)
- [x] 3.4 Verify the `@` path alias resolves correctly in the Wix CLI build system

## 4. Authentication Migration

- [x] 4.1 Update the frontend auth token retrieval to use `@wix/dashboard` SDK context instead of URL query parameters
- [x] 4.2 Update the RTK Query base query to use the SDK-provided token for Authorization headers
- [x] 4.3 Verify the backend `HeaderAuthGuard` accepts tokens from the Wix SDK context format
- [ ] 4.4 Test authentication flow end-to-end: dashboard extension → API calls → backend validation

## 5. Build and Dev Scripts

- [x] 5.1 Verify `npm run dev` starts the Wix CLI dev server and opens the dashboard extension preview
- [ ] 5.2 Verify hot reload works when editing frontend source files
- [ ] 5.3 Ensure the existing `pnpm dev` / `pnpm build` scripts in `order-limiter-frontend/` still work as standalone fallback
- [ ] 5.4 Update root `package.json` scripts if needed (e.g., add `build:frontend`, `dev:backend` for clarity)

## 6. Functional Verification

- [ ] 6.1 Test Home page renders correctly in the dashboard extension
- [ ] 6.2 Test Rules page CRUD operations (create, read, update, delete rules)
- [ ] 6.3 Test Appearance page customization features
- [ ] 6.4 Test Feedback page functionality
- [ ] 6.5 Verify all Wix Design System components render correctly in the dashboard host
- [ ] 6.6 Test app version creation via Wix CLI deploy command
