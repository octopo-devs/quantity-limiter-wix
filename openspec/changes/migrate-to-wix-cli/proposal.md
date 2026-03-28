## Why

The Quantity Limiter app currently runs as a standalone monorepo (separate React frontend + NestJS backend) deployed independently from the Wix ecosystem. Migrating to the `@wix/app` CLI framework allows the app to integrate with Wix's development tooling, enabling local development previews on real Wix sites, streamlined deployment through Wix's infrastructure, and access to the Wix CLI extension system. This positions the app for future Wix platform capabilities and reduces custom infrastructure overhead.

## What Changes

- **Scaffold Wix CLI project**: Initialize a new `@wix/app` project that extends the existing Wix app, creating the standard Wix CLI directory structure alongside the current monorepo
- **Integrate frontend as dashboard extension**: Convert the existing React admin dashboard (`order-limiter-frontend/`) into a Wix CLI dashboard page/extension, replacing the standalone Vite build with Wix CLI's build system
- **Update app configuration**: Add Wix CLI config files (`.wix/`, `wix.config.json`) and update the project root with the required structure for CLI-based development
- **Adapt authentication flow**: Transition from custom OAuth token handling to Wix SDK's built-in authentication context provided by the CLI framework
- **Update build and dev scripts**: Replace standalone `pnpm dev` / `pnpm build` with `npm run dev` through the Wix CLI, enabling hot reload with real Wix site integration
- **Preserve backend independence**: The NestJS backend remains a separate service; only the frontend packaging and deployment model changes

## Capabilities

### New Capabilities
- `wix-cli-integration`: Wix CLI project scaffolding, configuration, and development workflow setup
- `dashboard-extension-migration`: Converting the standalone React frontend into a Wix CLI dashboard extension

### Modified Capabilities
<!-- No existing spec-level requirements are changing - this is an infrastructure/tooling migration -->

## Impact

- **Frontend (`order-limiter-frontend/`)**: Build system changes from Vite to Wix CLI bundler; entry point and routing may need adaptation for dashboard extension model
- **Authentication**: Frontend auth shifts from manual token headers to Wix SDK context; backend `HeaderAuthGuard` remains but may receive tokens in a different format
- **Dependencies**: New dependencies on `@wix/cli`, `@wix/app`, and related Wix CLI packages; some current Wix SDK packages may be upgraded or replaced
- **Development workflow**: `npm run dev` replaces `pnpm dev` for frontend; requires active Wix site for local preview
- **Deployment**: Frontend deployment moves to Wix's app versioning system instead of custom hosting
- **Backend**: No structural changes; continues as independent NestJS service with its own deployment
