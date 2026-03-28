## Context

The Quantity Limiter app is a monorepo with two packages:
- `order-limiter-frontend/` — React 18 + Vite + TypeScript admin dashboard using Wix Design System
- `order-limiter-backend/` — NestJS 11 + TypeORM + MySQL REST API

The frontend currently runs as a standalone Vite app served on port 3000, authenticating via custom OAuth token headers. It already uses `@wix/dashboard` and `@wix/design-system` packages, indicating partial Wix SDK integration.

The Wix CLI for Apps (`@wix/app`) provides a framework to develop, preview, and deploy Wix app extensions locally. The "Extend existing application" flow lets us wrap the existing app without migrating from scratch.

## Goals / Non-Goals

**Goals:**
- Scaffold a Wix CLI project that extends the existing Wix app
- Register the frontend as a Wix dashboard page extension
- Enable `npm run dev` for local development with real Wix site preview
- Maintain the existing NestJS backend as-is (separate deployment)
- Preserve all existing frontend functionality and UI

**Non-Goals:**
- Migrating the backend to Wix CLI or Wix's hosting infrastructure
- Rewriting frontend components or changing the UI
- Removing the standalone Vite build capability (keep as fallback initially)
- Migrating to Wix's data/storage APIs — the app continues using its own MySQL backend
- Implementing Wix Blocks or custom elements

## Decisions

### 1. Use "Extend existing application" flow

**Decision**: Run `npm create @wix/app@latest` and select "Extend existing application" to scaffold the CLI project at the repo root.

**Rationale**: This is the officially recommended path for existing apps. It creates the Wix CLI config without requiring a full app rewrite. The alternative — creating a new app from scratch — would break the existing Wix app ID, OAuth credentials, and all installed instances.

**Alternatives considered**:
- New app from scratch: Would lose existing installs and require re-onboarding all merchants
- Manual config: Fragile and not documented; the scaffold ensures correct structure

### 2. Register frontend as a dashboard page extension

**Decision**: Configure the existing React app as a Wix dashboard page extension within the CLI project, adapting `order-limiter-frontend/` to export a dashboard component.

**Rationale**: The frontend is already a Wix dashboard app using `@wix/dashboard` and `@wix/design-system`. Converting it to a CLI dashboard extension is the natural fit. The Wix CLI will handle routing, hosting, and auth context injection.

**Alternatives considered**:
- Widget extension: Not appropriate — this is an admin dashboard, not a storefront widget
- Standalone page with iframe: Adds latency and complexity vs. native dashboard integration

### 3. Preserve backend independence

**Decision**: The NestJS backend remains deployed separately. The frontend continues to call it via `REACT_APP_API_END_POINT` (or equivalent env var in CLI context).

**Rationale**: The backend has its own MySQL + Redis dependencies, cron jobs, webhook handlers, and Bull queues. None of these fit within Wix's hosting model. The backend API contract doesn't change.

### 4. Adapt auth to use Wix SDK context

**Decision**: In the CLI dashboard extension context, use `@wix/dashboard`'s built-in SDK instance to get the auth token, replacing manual token extraction from URL parameters.

**Rationale**: The Wix CLI dashboard provides an SDK instance with authentication already resolved. This is more reliable than the current approach of reading tokens from query params/headers. The backend `HeaderAuthGuard` continues to validate the token — only the frontend's method of obtaining it changes.

### 5. Keep Vite config as fallback

**Decision**: Retain `vite.config.ts` and standalone dev scripts during the transition period.

**Rationale**: This allows the team to fall back to standalone development if the CLI integration has issues. Once the CLI workflow is proven stable, the Vite standalone setup can be deprecated.

## Risks / Trade-offs

- **[CLI feature gaps]** The Wix CLI for Apps doesn't support all features yet → Mitigation: Using "extend" mode preserves dashboard-configured extensions; only new extensions need CLI support
- **[Build system conflicts]** Wix CLI has its own bundler which may conflict with existing Vite config → Mitigation: The dashboard extension will use CLI's build pipeline; standalone Vite remains as fallback
- **[Auth token format change]** Tokens from Wix SDK context may differ from current manual token flow → Mitigation: Test backend `HeaderAuthGuard` compatibility; update guard if needed to accept both formats during transition
- **[Local dev requires Wix site]** `npm run dev` needs an active Wix development site → Mitigation: Document setup steps; standalone Vite dev remains available for pure frontend work
- **[Monorepo structure complexity]** Adding CLI config at root alongside existing packages may cause confusion → Mitigation: Clear documentation of which commands to use and when

## Migration Plan

1. Run `npm create @wix/app@latest` at repo root, selecting "Extend existing application"
2. Configure the dashboard page extension pointing to the frontend source
3. Adapt the frontend entry point for dashboard extension exports
4. Update auth token retrieval to use Wix SDK context
5. Test locally with `npm run dev` on a development site
6. Verify all existing pages (Home, Rules, Appearance, Feedback) work in the CLI preview
7. Create an app version through Wix CLI for staging validation
8. Rollback: If issues arise, revert to standalone Vite deployment (no destructive changes made)

## Open Questions

- What is the exact Wix app ID to use when extending? (needed during `npm create @wix/app` scaffolding)
- Are there any dashboard extensions already configured in the Wix app dashboard that might conflict with CLI-registered ones?
- Should the CLI project use the existing `order-limiter-frontend/` directory directly, or create a new `src/dashboard/` directory with imports from the existing code?
