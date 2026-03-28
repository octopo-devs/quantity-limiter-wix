# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Wix e-commerce **Quantity Limiter** app — a monorepo with two packages:

- `order-limiter-frontend/` — React 18 + Vite + TypeScript admin dashboard
- `order-limiter-backend/` — NestJS 11 + TypeORM + MySQL REST API

The app lets Wix store owners create rules that restrict customer purchase quantities based on products, collections, customer segments, or order history.

## Commands

### Frontend (`order-limiter-frontend/`)

```bash
pnpm dev          # Start dev server on port 3000
pnpm build        # Production build → build/
pnpm test         # Jest tests
pnpm lint         # ESLint check
pnpm lint:fix     # Auto-fix ESLint issues
pnpm format       # Prettier formatting
```

### Backend (`order-limiter-backend/`)

```bash
npm run start:dev       # Watch mode (nodemon)
npm run build           # Compile TS → dist/
npm run start           # Run compiled app
npm run test            # Jest unit tests
npm run test:cov        # Coverage report
npm run lint            # ESLint with auto-fix
npm run isready         # Format → Lint → Build (pre-CI check)

# Database migrations
npm run migration:generate  # Generate new migration
npm run migration:run       # Apply pending migrations
npm run migration:revert    # Revert last migration
```

## Architecture

### Frontend

- **State**: Redux Toolkit + RTK Query for server state/caching; Redux-Persist for session/localStorage
- **Routing**: React Router v6 with a shared `Layout` wrapper (sidebar + main content)
- **UI**: Wix Design System components
- **Path alias**: `@` maps to `src/`
- **API**: RTK Query base URL from `REACT_APP_API_END_POINT` env var; all requests include Authorization + Wix instance token headers

Pages: `Home`, `Rules` (main CRUD table), `Appearance` (branding), `Feedback`

### Backend

**Module structure** (`src/modules/`):
- `rules/` — Core CRUD for quantity-limit rules; entities: `Rule`, `RuleProduct`, `RuleCollection`, `RuleCustomer`, `RuleOrder`
- `shop/` — Store settings, onboarding state, general config
- `wix/` — OAuth install flow (`/wix/install-app`, `/wix/authorization`) and product sync
- `webhook/` — Wix webhook handler (`POST /webhook/wix`)
- `branding/` — Store appearance customization
- `attributes/` — Products/collections sync from Wix
- `public-endpoint/` — Unauthenticated endpoints
- `analytics/`, `customer-io/` — Tracking integrations

**Shared infrastructure** (`src/shared/`):
- `auth/` — `HeaderAuthGuard` (validates Wix token in Authorization header), `WebhookAuthGuard`
- `queue/` — Bull + Redis job queue
- `cron/` — Scheduled tasks
- `logger/` — Winston logging
- `database/` — TypeORM MySQL2 config

**Rule entity** key fields: `id` (UUID), `shop`, `name`, `type` (PRODUCT|COLLECTION|CUSTOMER|ORDER), `isActive`, `minQty`, `maxQty`, limit messages, and 1:1 relations to type-specific sub-entities.

**Auth flow**: Wix OAuth → tokens stored per shop → `HeaderAuthGuard` validates per request.

**API docs**: Swagger + Scalar available in dev mode.

## Environment

- Frontend: copy `.env.sample` → `.env`; set `REACT_APP_API_END_POINT` and `REACT_APP_ENV`
- Backend: requires MySQL + Redis; configure via environment variables for DB credentials, Redis URL, Wix OAuth credentials
- Migrations run against compiled `dist/` output — always `npm run build` before `migration:run`
