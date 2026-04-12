# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

React 18 dashboard app embedded in the Wix platform. Store owners use it to manage quantity limit rules, configure appearance, and view analytics. The package is named `estimated-delivery` (legacy name) but serves the Quantity Limiter product.

## Commands

```bash
pnpm dev       # Vite dev server (port 3000)
pnpm build     # Production build to build/
pnpm lint      # ESLint (Airbnb + TypeScript)
pnpm lint:fix  # ESLint with auto-fix
pnpm format    # Prettier (120 chars, single quotes, trailing commas)
pnpm test      # Jest + ts-jest
```

## Architecture

### Wix Embedding & Auth

The app runs inside a Wix dashboard iframe. Auth context is extracted from URL query params at startup (`src/config/index.ts`):
- `instance` — JWT token containing the site's `instanceId`, sent as `Authorization` header on all API calls
- `embedded` param controls whether the Wix SDK client is initialized (`WixClient`)
- Non-embedded mode (test mode) uses `REACT_APP_URL_SEARCH_PARAMS` env var to simulate params

### State Management (Redux Toolkit + RTK Query)

**RTK Query** (`src/redux/query/index.ts`) — single `apiCaller` with `fetchBaseQuery` pointed at `REACT_APP_API_END_POINT`. All endpoints auto-append `shop` param via `convertParams()`. Cache invalidation uses tag types: `RULES`, `APPEARANCE`, `generalSetting`, `countRules`, etc. Refetch on mount with 30s staleness window.

**Redux slices** (`src/redux/slice/`) — UI-only state. Several slices use redux-persist:
- `toast`, `banner`, `settings`, `popup` → localStorage (keyed by shop ID)
- `session` → sessionStorage

The store is configured in `src/redux/store.ts` with serializable check disabled for redux-persist compatibility.

### Routing

React Router v6 (`src/routes/index.tsx`). Key routes:
- `/home` — Dashboard
- `/rules` — Rules list, `/rules/create` — Create wizard, `/rules/edit/:id` — Edit
- `/appearance` — Storefront appearance settings
- `/onboarding` — Welcome/setup (no sidebar)

Path constants in `src/constants/path.ts` preserve URL search params across navigation.

### UI Layer

- **Components**: `@wix/design-system` (WDS) v1.240+ with `@wix/wix-ui-icons-common` icons
- **Styling**: styled-components v5 — use `$` prefix for transient props (e.g., `$isCollapsed`)
- **Forms**: react-hook-form + `@hookform/resolvers` with Zod schemas
- **Layout**: `src/components/Layout/` wraps all routes with optional sidebar

### API Endpoints (RTK Query)

All defined in `src/redux/query/index.ts`. Key groups:
- **Rules**: `getRules`, `getRuleById`, `createRule`, `updateRule`, `deleteRule` (tag: `RULES`)
- **Appearance**: `getAppearance`, `updateAppearance` (tag: `APPEARANCE`)
- **Shop**: `generalSettings`, `updateGeneralSetting`, `getShopInfo`, `getEmbeddedAppStatus`
- **Wix data**: `getWixProducts`, `getWixCollections` (proxied through backend)
- **Attributes**: `getProducts`, `getCollections`, `getProductTags`, `getProductSKUs`
- **Pricing**: `getListPricing`, `addDiscountCode`, `getUrlUpdatePlan`

### Key Patterns

- **Toast notifications**: Embedded mode uses `WixClient.dashboard.showToast()`, non-embedded uses Redux toast slice. Use the `useHandleToastNotEmbedded` hook.
- **API mutations**: Call `.unwrap()` on mutation results, handle errors with try/catch.
- **Component memoization**: Pages commonly use `memo()` export, `useMemo` for table columns, `useCallback` for handlers.
- **Type organization**: `src/types/` with subdirs `apis/` (params, response), `enum/`, `interface/`, `components/`.
- **Response types**: `DefaultResponse<T>` wraps all API responses with `data`, `code`, `message`. Paginated responses extend with `DefaultMetaResponse`.

## Environment Variables

Prefix with `REACT_APP_`, `APP_`, or `CANNY_` (Vite env prefix config).

Key vars: `REACT_APP_API_END_POINT` (backend URL), `REACT_APP_ENV` (`development`|`test`), `APP_ID` (Wix app ID).

## Path Alias

`@` maps to `src/` (configured in both `vite.config.ts` and `tsconfig.extend.json`).
