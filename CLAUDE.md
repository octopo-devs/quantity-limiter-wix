# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quantity Limiter for Wix - a Wix app allowing store owners to set min/max quantity limits on products, collections, customers, and orders with storefront warning messages.

## Repository Structure

Monorepo with three sub-projects:

- **quantity-limiter-backend/** - NestJS v11 API + storefront build (TypeScript, MariaDB, Redis)
- **quantity-limiter-frontend/** - React 18 dashboard embedded in Wix (Vite, Redux Toolkit, WDS)
- **quantity-limiter-backend/storefront/** - Wix CLI embedded script extension (React, Vite, IIFE output)

## Common Commands

### Backend (`cd quantity-limiter-backend`)

```bash
pnpm start:dev           # Dev server with watch (port 4000)
pnpm build               # Production build
pnpm lint                # ESLint with auto-fix
pnpm format              # Prettier
pnpm isready             # format + lint + build (pre-commit check)
pnpm test                # Jest unit tests
pnpm test:watch          # Jest watch mode
pnpm test:cov            # Jest with coverage report
pnpm test:e2e            # End-to-end tests
pnpm migration:generate  # Generate TypeORM migration (requires build first)
pnpm migration:run       # Apply migrations
pnpm migration:revert    # Revert last migration
```

Run a single backend test: `pnpm jest --testPathPattern=<pattern>`

### Frontend (`cd quantity-limiter-frontend`)

```bash
pnpm dev       # Vite dev server (port 3000)
pnpm build     # Production build
pnpm lint      # ESLint
pnpm lint:fix  # ESLint with auto-fix
pnpm format    # Prettier
pnpm test      # Jest tests
```

### Storefront (`cd quantity-limiter-backend/storefront`)

```bash
pnpm dev          # Vite dev
pnpm build        # TypeScript + Vite build (outputs IIFE to ../extensions/quantity-limiter/assets/)
pnpm build:watch  # Watch mode
pnpm wix:dev      # Wix CLI dev mode
pnpm wix:build    # Wix CLI build
pnpm wix:release  # Release to Wix
```

## Architecture

### Backend (NestJS)

- **Module pattern**: Each feature module in `src/modules/` has controller, service, module, dto/, entities/, types/, response/ subdirectories
- **Key modules**: Rules (core CRUD), Shop (settings/onboarding), Wix (OAuth/API proxy), Webhook, Attributes (synced Wix data), Branding (storefront appearance), Analytics, Admin, PublicEndpoint (unauthenticated APIs), CustomerIO
- **Auth**: Passport with custom `HeaderStrategy` — validates HMAC-signed Wix instance tokens (`sign.base64data` format, SHA256)
- **Guards**: `HeaderAuthGuard` (dashboard API), `WebhookAuthGuard` (Wix webhooks), `ParamsAuthGuard` (query param auth)
- **Database**: MariaDB via TypeORM with `SnakeNamingStrategy`, entity prefix `order_limiter`, migrations stored in separate `migrations-storage` repo
- **Cache**: Redis via `@nestjs/cache-manager` with `CustomCacheInterceptor` (service identifier: `avada-quantity-limiter`)
- **Queue**: Bull (Redis-backed) with named processors (`CustomerIoProcessor`, `SyncDataShopifyProcessor`). Retry: 5 attempts, 10min backoff, queue prefix: `quantity-limiter`
- **Cron**: `AttributeCronService` (attribute sync), `AdminDailyCronService` (analytics), `RemoveDataCronService` (cleanup)
- **Health**: `/health/ready` (DB connectivity) and `/health/live` (app running) for K8s probes
- **API prefix**: `api` in dev, `/w/api` in production (set via `API_ENDPOINT_PREFIX` env var)
- **API docs**: Scalar UI at `/${API_ENDPOINT_PREFIX}/api-docs`
- **Request limits**: 120MB JSON body, 50MB urlencoded
- **Logging**: Winston-based `GlobalLogger`, `LoggingMiddleware` logs requests >500ms or non-2xx
- **Port**: 4000 dev, 3000 production

### Frontend (React Dashboard)

- **State**: Redux Toolkit for UI state, RTK Query (`createApi` + `fetchBaseQuery`) for API calls
- **Persistence**: redux-persist with localStorage (toast, banner, settings, popup) and sessionStorage (session, rule data)
- **Auth**: Instance token extracted from Wix dashboard URL params, sent as `Authorization` header
- **UI**: `@wix/design-system` (WDS) v1.240+ with `@wix/wix-ui-icons-common`
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM v6
- **Path alias**: `@` maps to `src/`
- **Env prefix**: `REACT_APP_`, `APP_`, `CANNY_` (Vite)
- **Key pages**: Home (`/home`), Rules list (`/rules`), Create rule wizard (`/rules/create`), Edit rule (`/rules/edit/:id`), Appearance (`/appearance`)
- **Redux slices**: auth, settings, appearance, createRule, preview, highlightPreview, toast, banner, popup, session, cache, loading, navigate, appbar, error

### Storefront (Embedded Script)

- Built as IIFE bundle injected into Wix storefronts
- Detects instance ID from `window` variable or script `data-instance-id` attribute
- Uses HMAC signing for public API calls (no auth token)
- Mounts into `.order-limiter-block`, `#ol-storefront-root`, or creates container
- Editor mode detected via `static.parastorage.com` in URL
- Context providers: AppContext (metafields/config), CartContext, LanguageContext, QuantityLimitContext, ShopifyContext
- Output: `extensions/quantity-limiter/assets/quantity-limiter.min.js` + `.css`

### Data Model

Core entity is **Rule** (UUID PK, shop FK, minQty/maxQty, notification settings, message templates) with type-specific OneToOne relations (cascade delete with orphan cleanup):
- `RuleProduct` - product limits (selection: ALL_PRODUCTS/GROUP_OF_PRODUCTS/SPECIFIC_PRODUCTS), condition groups with operators (EQUALS/CONTAINS/STARTS_WITH/etc.)
- `RuleCollection` - collection limits
- `RuleCustomer` - customer limits
- `RuleOrder` - order limits (by TOTAL_PRODUCTS/TOTAL_PRICE/TOTAL_WEIGHT)

Rule types: `PRODUCT`, `COLLECTION`, `CUSTOMER`, `ORDER`
Notification triggers: `LIMIT_REACHED`, `ADD_TO_CART_BUTTON_CLICKED`, `NO_NOTIFICATION`

Other entities: `ShopGeneral`, `ShopInfo`, `ShopInstalled` (shop metadata), Admin/Analytics entities (daily logs, performance metrics, onboarding)

### CI/CD

- GitLab CI with Docker + Kubernetes deployment
- Environments: `develop` branch -> dev, tags on `main` -> production
- Migrations: auto-generated, stored in separate `migrations-storage` repo, applied manually
- Backend namespace: `app-quantity-limiter`, Frontend namespace: `app-estimated`

## Conventions

- Backend: snake_case DB columns (SnakeNamingStrategy), UUID primary keys, `order_limiter` table prefix
- Frontend: Redux slices per feature, RTK Query for server state with tag-based cache invalidation (RULES, APPEARANCE), styled-components for CSS
- Storefront: Context API for state, styled-components v6, event-driven updates from Wix
- Formatting: Prettier (120 char width, single quotes, trailing commas)
- Commit style: Short, lowercase prefixes: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `ci:`, `workflow:`

## Local Development Setup

Run all three services simultaneously for live development with Wix:

1. **Frontend** (`cd quantity-limiter-frontend`): `pnpm dev` — Vite dev server on port 3000
2. **Backend** (`cd quantity-limiter-backend`): `pnpm start:dev` — NestJS dev server on port 4000
3. **Storefront** (`cd quantity-limiter-backend/storefront`): `pnpm build:watch` — rebuilds IIFE bundle on change, served by Backend API

Then expose the local backend via **Cloudflare Tunnel** (`cloudflared`) to get an HTTPS URL that Wix uses as the real server endpoint. This means code changes in any sub-project reflect immediately on the Wix Develop App without redeployment.

## Development Workflow

See `AGENTS.md` for the 4-phase AI-assisted workflow: Explore Story → Create Test Case → Implement (TDD) → Verify & Sync. All feature artifacts live in `docs/features/<group>/US-<id>-<name>/`.
