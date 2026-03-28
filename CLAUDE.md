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
npm run start:dev           # Dev server with watch (port 4000)
npm run build               # Production build
npm run lint                # ESLint with auto-fix
npm run format              # Prettier
npm run isready             # format + lint + build (pre-commit check)
npm run test                # Jest unit tests
npm run test:watch          # Jest watch mode
npm run test:e2e            # End-to-end tests
npm run migration:generate  # Generate TypeORM migration
npm run migration:run       # Apply migrations
npm run migration:revert    # Revert last migration
```

### Frontend (`cd quantity-limiter-frontend`)

```bash
npm run dev       # Vite dev server (port 3000)
npm run build     # Production build
npm run lint      # ESLint
npm run lint:fix  # ESLint with auto-fix
npm run format    # Prettier
npm run test      # Jest tests
```

### Storefront (`cd quantity-limiter-backend/storefront`)

```bash
npm run dev          # Vite dev
npm run build        # TypeScript + Vite build (outputs IIFE to ../extensions/quantity-limiter/assets/)
npm run build:watch  # Watch mode
npm run wix:dev      # Wix CLI dev mode
npm run wix:build    # Wix CLI build
npm run wix:release  # Release to Wix
```

## Architecture

### Backend (NestJS)

- **Module pattern**: Each feature module in `src/modules/` has controller, service, module, dto/, entities/, types/, response/ subdirectories
- **Auth**: Passport with JWT + custom header strategy. Frontend sends Wix instance token as `Authorization` header
- **Guards**: `HeaderAuthGuard` (dashboard API), `WebhookAuthGuard` (Wix webhooks)
- **Database**: MariaDB via TypeORM with `SnakeNamingStrategy`, entity prefix `order_limiter`, migrations stored in separate repo
- **Cache**: Redis via `@nestjs/cache-manager` with custom `CustomCacheInterceptor`
- **Queue**: Bull (Redis-backed) for async job processing
- **Health**: `/health/ready` and `/health/live` endpoints for K8s probes
- **API prefix**: `api` in dev, `/w/api` in production (set via `API_ENDPOINT_PREFIX` env var)
- **Port**: 4000 dev, 3000 production

### Frontend (React Dashboard)

- **State**: Redux Toolkit for UI state, RTK Query (`createApi` + `fetchBaseQuery`) for API calls
- **Auth**: Instance token extracted from Wix dashboard URL params
- **UI**: `@wix/design-system` (WDS) v1.240+ with `@wix/wix-ui-icons-common`
- **Forms**: React Hook Form + Zod validation
- **Routing**: React Router DOM v6
- **Path alias**: `@` maps to `src/`
- **Key pages**: Home (`/home`), Rules list (`/rules`), Create rule wizard (`/rules/create`), Edit rule (`/rules/edit/:id`), Appearance (`/appearance`)

### Storefront (Embedded Script)

- Built as IIFE bundle injected into Wix storefronts
- Detects instance ID from `window` variable or script `data-instance-id` attribute
- Uses HMAC signing for public API calls (no auth token)
- Mounts into `.order-limiter-block`, `#ol-storefront-root`, or creates container
- Editor mode detected via `static.parastorage.com` in URL
- Output: `extensions/quantity-limiter/assets/quantity-limiter.min.js` + `.css`

### Data Model

Core entity is **Rule** with type-specific OneToOne relations:
- `RuleProduct` - product limits (selection: ALL/GROUP/SPECIFIC)
- `RuleCollection` - collection limits
- `RuleCustomer` - customer limits
- `RuleOrder` - order limits (by total products/price/weight)

Rule types: `PRODUCT`, `COLLECTION`, `CUSTOMER`, `ORDER`

### CI/CD

- GitLab CI with Docker + Kubernetes deployment
- Environments: `develop` branch -> dev, tags on `main` -> production
- Migrations: auto-generated, stored in separate `migrations-storage` repo, applied manually
- Backend namespace: `app-quantity-limiter`, Frontend namespace: `app-estimated`

## Conventions

- Backend: snake_case DB columns (SnakeNamingStrategy), UUID primary keys, `order_limiter` table prefix
- Frontend: Redux slices per feature, RTK Query for server state, styled-components for CSS
- Storefront: Context API for state, styled-components, event-driven updates from Wix
- Formatting: Prettier (120 char width, single quotes, trailing commas)
