# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Wix CLI embedded script extension that enforces quantity limits on Wix storefronts. Built as an IIFE React bundle injected into live Wix store pages via `<script>` tag. The bundle outputs to `../extensions/quantity-limiter/assets/quantity-limiter.min.js`.

## Commands

```bash
pnpm dev          # Vite dev server
pnpm build        # TypeScript check + Vite build (outputs IIFE to ../extensions/)
pnpm build:watch  # Watch mode build
pnpm lint         # ESLint
pnpm wix:dev      # Wix CLI dev mode (runs on live Wix site)
pnpm wix:build    # Wix CLI production build
pnpm wix:release  # Release to Wix marketplace
```

## Path Aliases

- `~` -> `./src`
- `@nest` -> `./src/shared/types` (backend entity type mirrors)

## Architecture

### Bootstrap Flow (`main.tsx`)

1. Resolves instance ID from `window.__OL_INSTANCE_ID` or script tag `data-instance-id`
2. Generates HMAC key from instance ID + `VITE_PUBLIC_API_HMAC_KEY` secret
3. Fetches shop metafields (settings, rules, branding) from backend public API
4. Mounts React tree into `.quantity-limiter`, `#ol-storefront-root`, or script tag element
5. Registers `wixDevelopersAnalytics` listener for page/product/cart events

### Window Globals Bridge

Wix analytics events (outside React) write to `window.ql*` globals. React contexts read them via 500ms polling. Key globals:

- `qlShop` - instance ID
- `qlCurrentProduct` - `{id, quantity, selectedVariantId}` set by Wix events
- `qlProducts` - `Map<productId, QlProductData>` product cache
- `qlCurrentPage` - current Wix page data
- `qlAppMetafields` - cached API response (settings, rules, branding)
- `qlTriggerRerender` - function to force React re-render from outside

### Context Provider Hierarchy

```
StyleSheetManager -> ShopifyContext -> AppContext -> LanguageContext -> App
```

- **ShopifyContext** - polls `window.ql*` globals, bridges Wix events to React state
- **AppContext** - shop settings, rules array, branding config, app enabled state
- **LanguageContext** - locale detection from `wixEmbedsAPI`

### Core Logic

- **`useProductValidation`** hook - merges current product + variant data, calls `calculateOrderLimits()`, returns `{results, hasViolation}`
- **`order-limit-calculator.ts`** - pure rule evaluation engine: maps rules to variants, calculates totals (quantity/price/weight), detects violations, formats messages with `{{placeholder}}` replacement
- **`useButtonController`** - disables add-to-cart buttons via DOM manipulation + MutationObserver when violations exist
- **`useQuantityInputObserver`** - monitors Wix quantity input fields and +/- buttons, updates `qlCurrentProduct.quantity`

### Rule Types and Matching

| Type       | Matches On                                                                                      |
| ---------- | ----------------------------------------------------------------------------------------------- |
| PRODUCT    | ALL_PRODUCTS, SPECIFIC_PRODUCTS (by ID), GROUP_OF_PRODUCTS (by tag/vendor/title with operators) |
| COLLECTION | Product's collections intersecting rule's collectionIds                                         |
| CUSTOMER   | ALL_CUSTOMERS or by customer tags (with exclusions)                                             |
| ORDER      | Aggregate totals: TOTAL_PRODUCTS, TOTAL_PRICE, TOTAL_WEIGHT                                     |

### Wix Event Handling (`helpers.ts`)

| Event               | Action                                                                 |
| ------------------- | ---------------------------------------------------------------------- |
| `PageView`          | Sets current page, clears product (unless overlay page like side cart) |
| `ViewContent`       | Fetches product info from API, caches in `qlProducts` map              |
| `productPageLoaded` | Same as ViewContent but different payload shape                        |
| `CustomizeProduct`  | Updates selected variant ID                                            |

### API Communication

All public endpoints use HMAC-SHA256 auth (no bearer token). Endpoints defined in `hooks/types/api.constant.ts`:

- `GET /public-endpoint/shop-metafield` - settings + rules + branding
- `GET /public-endpoint/currentProduct` - product collections + variants
- `GET /public-endpoint/currentCart` - cart line items
- `POST /analytics/analytic/rule` - rule impression logging

### UI Rendering

`MainContainer` creates DOM mount points at the configured CSS selector position (or before add-to-cart button as fallback), then renders `QuantityLimitMessage` via React Portals. Render method (before/after/prepend/append) is configurable via `shopGeneral.render_method`.

## Key Patterns

- **No router** - single-page injection, not a routed SPA
- **DOM selectors for Wix elements** defined in `ClassEnum` and hook constants - these target Wix's internal data-hook attributes
- **MutationObserver pattern** used extensively to handle Wix SPA re-renders (buttons, quantity inputs, form elements)
- **Styled-components v6** with `StyleSheetManager shouldForwardProp` to avoid prop warnings
- **IIFE output** with `var process;` prepended to avoid runtime errors in browser context
- Build output is committed to the repo at `../extensions/quantity-limiter/assets/`

## Environment Variables

- `VITE_APP_SERVER_BE_DOMAIN` - backend API base URL
- `VITE_PUBLIC_API_HMAC_KEY` - HMAC signing secret for public API auth
- `VITE_APP_ID_SCRIPT` - script tag element ID (default: `quantity-limiter-script`)
