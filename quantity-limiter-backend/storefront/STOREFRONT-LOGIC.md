# Storefront Logic Analysis

## Overview

The storefront is an IIFE-bundled React application injected into Wix store pages via an embedded script extension. It enforces quantity limits on products by:

1. Fetching rules from the backend API on page load
2. Listening to Wix analytics events for page/product/cart changes
3. Evaluating rules against current product + cart state
4. Displaying warning messages and disabling add-to-cart/checkout buttons when limits are violated

---

## 1. Bootstrap & Initialization (`main.tsx`)

### Entry Point

```
DOMContentLoaded (or immediate if already loaded)
  -> boot()
    -> initializeApp()   // fetch data & mount React
    -> registerListener() // subscribe to Wix events (skipped in editor mode)
```

### Instance ID Resolution

Reads `window.__OL_INSTANCE_ID` or the `data-instance-id` attribute from the script tag identified by `VITE_APP_ID_SCRIPT`.

### Editor Mode Detection

If `window.location.origin === 'https://static.parastorage.com'`, renders a static preview (`PreviewInEditor`) and exits early.

### App Initialization Sequence

1. Get instance ID
2. Generate HMAC public key from instance ID + secret (`VITE_PUBLIC_API_HMAC_KEY`)
3. Call `GET /public-endpoint/shop-metafield?shop={id}&key={hmac}` to fetch settings, rules, branding, languages
4. Store response in `window.qlAppMetafields`
5. Find mount element: `.synctrack-edd` > `#ol-storefront-root` > script tag fallback
6. Render React tree into mount element

### React Provider Tree

```
StyleSheetManager
  -> ShopifyContextProvider    (polls window globals for product/page state)
    -> AppContextProvider      (shop settings, rules, branding)
      -> CartContextProvider   (cart items from Wix API)
        -> LanguageContextProvider (locale detection)
          -> QuantityLimitContextProvider (rule evaluation engine)
            -> App
```

---

## 2. Wix Event Handling (`main.tsx`)

Registers via `window.wixDevelopersAnalytics.register(appId, callback)`.

| Event | Action |
|-------|--------|
| `PageView` | Sets `qlCurrentPage`. Detects session change (visitorId). Clears product data unless overlay page (side cart/popup). Triggers re-render. |
| `ViewContent` | Fetches product collections + variants via `GET /public-endpoint/currentProduct`. Sets `qlCurrentProduct`, `qlCurrentCollectionIds`, `qlProductVariants`. |
| `CustomizeProduct` | Updates `qlCurrentProduct` (variant selection change). Triggers re-render. |
| `AddToCart` / `addToCart` | Saves `cartId`. Refreshes cart after 500ms delay. |
| `RemoveFromCart` / `removeFromCart` | Refreshes cart after 500ms delay. |

---

## 3. State Management

### Window Globals (Bridge Layer)

The app uses `window.*` globals as a bridge between Wix analytics events (set in `main.tsx`) and React contexts (read via polling).

| Global | Type | Purpose |
|--------|------|---------|
| `qlShop` | `string` | Instance ID |
| `qlCurrentPage` | `IWixPage` | Current page analytics data |
| `qlCurrentProduct` | `IWixProductData` | Current product on page |
| `qlProductVariants` | `IWixVariant[]` | Product variants from API |
| `qlCurrentCollectionIds` | `string[]` | Collections the product belongs to |
| `qlQuantityOnPage` | `number` | Quantity from input field |
| `qlCartId` | `string` | Wix cart ID |
| `qlCartRefresh` | `() => void` | Trigger cart re-fetch |
| `qlCartClear` | `() => void` | Clear cart on session change |
| `qlReInitApp` | `() => void` | Force React re-render |
| `qlAppMetafields` | `object` | Cached API response (settings, rules, branding) |
| `qlVisitorId` | `string` | Track visitor for session change detection |
| `qlPrevProductId` | `string` | Prevent duplicate product info fetches |

### ShopifyContext (Polling Bridge)

Polls window globals every **500ms** to sync Wix event data into React state:
- `currentProduct`, `currentVariant`, `selectedVariantId` from `qlCurrentProduct`
- `pageQuantity` from `qlQuantityOnPage`
- `locale` from `wixEmbedsAPI.getLanguage()`
- `currentPage` from `qlCurrentPage.pageTypeIdentifier`
- `currentProductInfo` (variants + collections) from `qlProductVariants` + `qlCurrentCollectionIds`

### AppContext (Configuration)

Initialized from the `GET /public-endpoint/shop-metafield` response:
- `shopGeneral` - Full shop configuration (enable/disable, position, branding, etc.)
- `rules` - Array of `QuantityLimitRule` objects
- `branding` - Display customization (colors, font, alignment)
- `isAppEnabled` - Derived from `shopGeneral.enableApp`
- `positionClass` - CSS selector for message placement (default: `.synctrack-edd`)

### CartContext (Cart State)

- Persists `cartId` in `localStorage` (`ol-cart-id` key)
- Fetches cart via `GET /public-endpoint/currentCart?shop={id}&key={hmac}&cartId={cartId}`
- Parses `lineItems` into `ICartItem[]` (productId, variantId, quantity, price, weight, name, sku)
- Maps cart items to `WixVariant[]` format for rule calculations
- Exposes `refreshCart()` and `clearCart()` via window globals

### QuantityLimitContext (Rule Evaluation)

Core calculation layer. On every dependency change:
1. Builds a `WixVariant` for the current product/variant with page quantity
2. Merges with cart variants (adds cart quantity to page quantity for same product)
3. Includes other cart items for ORDER rule calculations
4. Calls `calculateOrderLimits()` with merged variants + rules
5. Returns `results` (violations map) and `hasViolation` boolean

---

## 4. Rule Evaluation Engine (`order-limit-calculator.ts`)

### Rule Types

| Type | Scope | Evaluation Basis |
|------|-------|------------------|
| `PRODUCT` | Individual product variants | Variant quantity |
| `COLLECTION` | Products in specific collections | Variant quantity |
| `CUSTOMER` | All products (filtered by customer tags) | Variant quantity |
| `ORDER` | All products in cart/page | Total products, total price, or total weight |

### Rule-to-Variant Mapping

```
For each active rule:
  PRODUCT rules:
    - ALL_PRODUCTS -> applies to every variant
    - SPECIFIC_PRODUCTS -> applies if variant.productId in rule.productIds
    - GROUP_OF_PRODUCTS -> applies if variant matches group conditions
      (TAG/VENDOR/TITLE with operators: EQUALS, NOT_EQUALS, CONTAINS, NOT_CONTAINS, STARTS_WITH, ENDS_WITH)
      (conditions joined by AND or OR conjunction)

  COLLECTION rules:
    - Applies if product's collections overlap with rule.collectionIds

  CUSTOMER rules:
    - ALL_CUSTOMERS -> applies to every variant
    - CUSTOMER_TAGS -> applies if customer has matching tags (minus excluded tags)

  ORDER rules:
    - Always apply to every variant (evaluated on aggregate totals)
```

### Total Calculation

| Rule Type | Order Condition | Formula |
|-----------|----------------|---------|
| PRODUCT / COLLECTION / CUSTOMER | N/A | `variant.quantity` |
| ORDER | `TOTAL_PRODUCTS` | `sum(all variants quantity)` |
| ORDER | `TOTAL_PRICE` | `sum(variant.price * variant.quantity)` |
| ORDER | `TOTAL_WEIGHT` | `sum(convertWeight(variant.weight) * variant.quantity)` |

### Violation Detection

A message is shown when:
- `notifyAboutLimitWhen !== NO_NOTIFICATION`
- AND (`minQty > 0 && total < minQty`) OR (`maxQty > 0 && total > maxQty`)

### Message Formatting

Placeholders replaced in violation messages:

| Placeholder | Used When | Replaced With |
|-------------|-----------|---------------|
| `{{min}}`, `{{min_quantity}}`, `{{minimum_product_quantity}}` | Quantity min violated | `rule.minQty` |
| `{{max}}`, `{{max_quantity}}`, `{{maximum_product_quantity}}` | Quantity max violated | `rule.maxQty` |
| `{{min}}`, `{{minimum_total_product_value}}` | Price min violated | Formatted currency |
| `{{max}}`, `{{maximum_total_product_value}}` | Price max violated | Formatted currency |
| `{{min}}`, `{{minimum_product_weight}}` | Weight min violated | `rule.minQty` |
| `{{max}}`, `{{maximum_product_weight}}` | Weight max violated | `rule.maxQty` |
| `{{weight_unit}}` | Weight rules | Shop weight unit |

---

## 5. UI Rendering

### MainContainer (DOM Injection)

1. Finds DOM elements matching `positionClass` (or falls back to add-to-cart button selector)
2. Creates `div.ot-quantity-limiter` elements before/after/prepend/append the target (based on `shopGeneral.render_method`)
3. Renders `QuantityLimitMessage` into each position via React Portal
4. Re-evaluates positions on each `qlReInitApp()` trigger

### QuantityLimitMessage (Display)

- Shows the **first** violation result from the results map
- Renders: warning icon (SVG) + message text + optional "Contact Us" link
- Styling from branding config: `fontFamily`, `fontSize`, `textAlign`, `textColor`, `backgroundColor`
- Defaults: `#4A4A4A` text, `#FFD466` background, 14px, left-aligned
- Injects `branding.customCss` as a `<style>` tag if present

### Button Controller (`useButtonController`)

When `hasViolation === true`:
- **Product pages**: Disables add-to-cart buttons (selectors: `button[data-hook*="add-to-cart"]`, etc.)
- **Cart pages**: Disables checkout buttons (selectors: `button[data-hook*="checkout"]`, etc.)
- Sets `disabled="true"`, `opacity: 0.5`, `pointer-events: none`, adds `.ol-button-disabled` class
- Saves original disabled state in `data-ol-disabled` attribute for restoration
- Uses `MutationObserver` to catch dynamically rendered buttons
- Polls every 500ms as fallback for race conditions

### Quantity Input Observer (`useQuantityInputObserver`)

- Finds quantity inputs via selectors: `input[role="spinbutton"]`, `input[data-hook*="quantity"]`, etc.
- Listens to `input` and `change` events on inputs
- Listens to `click` events on increment/decrement buttons (with 50ms delay)
- Updates `window.qlQuantityOnPage` and calls `window.qlReInitApp()`
- Uses `MutationObserver` to handle SPA re-renders

---

## 6. API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/public-endpoint/shop-metafield` | Fetch settings, rules, branding, languages |
| GET | `/public-endpoint/currentProduct` | Fetch product collections + variants |
| GET | `/public-endpoint/currentCart` | Fetch cart line items |
| POST | `/analytics/analytic/rule` | Log rule impressions/clicks |
| POST | `/tracking/log` | Log order tracking data |

All public endpoints authenticated via HMAC-SHA256 key (`shop` + secret -> `key` param).

---

## 7. File Index

| File | Purpose |
|------|---------|
| `main.tsx` | IIFE entry point, bootstrap, Wix event registration |
| `App.tsx` | Root component, conditional rendering based on app enabled state |
| `context/AppContext/AppContext.tsx` | Shop settings, rules, branding provider |
| `context/CartContext/CartContext.tsx` | Cart state management, Wix cart API integration |
| `context/ShopifyContext/ShopifyContext.tsx` | Polls window globals for product/page state |
| `context/LanguageContext/LanguageContext.tsx` | Locale detection and language resolution |
| `context/QuantityLimitContext/QuantityLimitContext.tsx` | Merges page + cart data, runs rule evaluation |
| `core/order-limit-calculator.ts` | Rule evaluation engine (mapping, totals, violations, messages) |
| `components/MainContainer.tsx` | DOM injection, position management, re-render orchestration |
| `components/QuantityLimitMessage/QuantityLimitMessage.tsx` | Violation message display with branding |
| `components/Portal/Portal.tsx` | React Portal wrapper for DOM injection |
| `components/PreviewInEditor/index.tsx` | Static preview for Wix editor mode |
| `components/Modal/index.tsx` | Base modal (unused in main flow) |
| `hooks/useButtonController.ts` | Disables add-to-cart/checkout buttons on violation |
| `hooks/useQuantityInputObserver.ts` | Monitors quantity input changes |
| `hooks/useAnalytics.tsx` | Rule impression/click tracking |
| `hooks/useImpress.tsx` | IntersectionObserver for visibility detection |
| `hooks/useFetch.tsx` | API call utilities |
| `hooks/useClassNameObserver.tsx` | MutationObserver for class changes |
| `hooks/useFormCountObserver.ts` | Watches add-to-cart form count changes |
| `apis/index.ts` | Direct API call wrapper (no context needed) |
| `hooks/types/api.constant.ts` | API endpoint definitions |
| `hooks/types/api.interface.ts` | API payload/response types |
| `shared/types/quantity-limit.types.ts` | Core domain types (rules, variants, branding) |
| `shared/types/class.enum.ts` | CSS selector constants |
| `shared/types/shared.enum.ts` | Page types, render methods |
| `shared/types/global.ts` | Window global type declarations |
| `shared/types/wix.interface.ts` | Wix platform data types |
| `shared/utils/functions.ts` | HMAC generation, date helpers, DOM utils |
| `shared/utils/currency.ts` | Currency formatting (Intl.NumberFormat) |
| `shared/utils/weight.ts` | Weight unit conversion |
| `shared/utils/string.ts` | Placeholder replacement |
| `shared/utils/convertColor.ts` | Hex to CSS filter conversion |
| `styled/quantity-limit-styled.ts` | Global message container styles |
| `styled/custom-styled.ts` | Shop-specific style injection |

---

## Architecture Map

```
                                    WIX STOREFRONT
  ┌──────────────────────────────────────────────────────────────────────┐
  │                                                                      │
  │   <script data-instance-id="xxx">  (IIFE bundle)                    │
  │         │                                                            │
  │         ▼                                                            │
  │   ┌──────────┐     ┌──────────────────────────────────────┐         │
  │   │ main.tsx │────▶│  wixDevelopersAnalytics.register()   │         │
  │   └────┬─────┘     └──────────────┬───────────────────────┘         │
  │        │                          │                                  │
  │        │ initializeApp()          │ PageView / ViewContent /         │
  │        │                          │ CustomizeProduct / AddToCart /   │
  │        │                          │ RemoveFromCart                   │
  │        ▼                          ▼                                  │
  │   ┌─────────────────────────────────────────────┐                   │
  │   │              WINDOW GLOBALS                  │                   │
  │   │                                              │                   │
  │   │  qlShop, qlCurrentPage, qlCurrentProduct,   │                   │
  │   │  qlProductVariants, qlCurrentCollectionIds,  │                   │
  │   │  qlQuantityOnPage, qlCartId, qlVisitorId,   │                   │
  │   │  qlAppMetafields, qlReInitApp               │                   │
  │   └──────────────────────┬──────────────────────┘                   │
  │                          │                                           │
  │                     poll 500ms                                       │
  │                          │                                           │
  │   ┌──────────────────────▼──────────────────────┐                   │
  │   │            REACT CONTEXT TREE                │                   │
  │   │                                              │                   │
  │   │  ShopifyContext ──── polls window globals    │                   │
  │   │       │                                      │                   │
  │   │  AppContext ──────── settings, rules,        │                   │
  │   │       │              branding                │                   │
  │   │  CartContext ─────── cart items, variants    │                   │
  │   │       │              (localStorage + API)    │                   │
  │   │  LanguageContext ─── locale detection        │                   │
  │   │       │                                      │                   │
  │   │  QuantityLimitContext                        │                   │
  │   │       │                                      │                   │
  │   │       ├── merge page variants + cart data    │                   │
  │   │       ├── calculateOrderLimits()             │                   │
  │   │       └── results + hasViolation             │                   │
  │   └──────────────────────┬──────────────────────┘                   │
  │                          │                                           │
  │                          ▼                                           │
  │   ┌──────────────────────────────────────────────┐                  │
  │   │                 App                           │                  │
  │   │                  │                            │                  │
  │   │  ┌───────────────▼────────────────────┐      │                  │
  │   │  │          MainContainer              │      │                  │
  │   │  │                                     │      │                  │
  │   │  │  1. Find/create DOM mount points    │      │                  │
  │   │  │     (.synctrack-edd or button)      │      │                  │
  │   │  │                                     │      │                  │
  │   │  │  2. useQuantityInputObserver()      │      │                  │
  │   │  │     monitors <input> changes        │      │                  │
  │   │  │                                     │      │                  │
  │   │  │  3. useButtonController()           │      │                  │
  │   │  │     disables buttons on violation   │      │                  │
  │   │  │                                     │      │                  │
  │   │  │  4. Portal -> QuantityLimitMessage  │      │                  │
  │   │  │     ┌─────────────────────────┐     │      │                  │
  │   │  │     │ ⚠ "Max 5 items allowed" │     │      │                  │
  │   │  │     │    [Contact Us]         │     │      │                  │
  │   │  │     └─────────────────────────┘     │      │                  │
  │   │  └─────────────────────────────────────┘      │                  │
  │   └───────────────────────────────────────────────┘                  │
  │                                                                      │
  └──────────────────────────────────────────────────────────────────────┘

                                    │
                                    │ HMAC-authenticated HTTP
                                    ▼

  ┌──────────────────────────────────────────────────────────────────────┐
  │                       BACKEND API (NestJS)                           │
  │                                                                      │
  │  GET  /public-endpoint/shop-metafield  ── settings, rules, branding │
  │  GET  /public-endpoint/currentProduct  ── collections, variants     │
  │  GET  /public-endpoint/currentCart     ── cart line items            │
  │  POST /analytics/analytic/rule         ── impression/click logs     │
  │  POST /tracking/log                    ── order tracking            │
  │                                                                      │
  └──────────────────────────────────────────────────────────────────────┘


  ┌──────────────────────────────────────────────────────────────────────┐
  │                    RULE EVALUATION FLOW                              │
  │                                                                      │
  │  Active Rules                                                        │
  │       │                                                              │
  │       ▼                                                              │
  │  ┌─────────────────────────────────────────┐                        │
  │  │        Map Rules to Variants            │                        │
  │  │                                          │                        │
  │  │  PRODUCT rules ── match by:             │                        │
  │  │    ALL_PRODUCTS / SPECIFIC / GROUP       │                        │
  │  │                                          │                        │
  │  │  COLLECTION rules ── match by:          │                        │
  │  │    product.collections ∩ rule.collections│                        │
  │  │                                          │                        │
  │  │  CUSTOMER rules ── match by:            │                        │
  │  │    ALL / tag inclusion - exclusion       │                        │
  │  │                                          │                        │
  │  │  ORDER rules ── apply to ALL variants   │                        │
  │  └───────────────────┬─────────────────────┘                        │
  │                      │                                               │
  │                      ▼                                               │
  │  ┌─────────────────────────────────────────┐                        │
  │  │      Calculate Total per Variant        │                        │
  │  │                                          │                        │
  │  │  PRODUCT/COLLECTION/CUSTOMER:           │                        │
  │  │    total = variant.quantity              │                        │
  │  │                                          │                        │
  │  │  ORDER (TOTAL_PRODUCTS):                │                        │
  │  │    total = Σ all variant quantities     │                        │
  │  │                                          │                        │
  │  │  ORDER (TOTAL_PRICE):                   │                        │
  │  │    total = Σ (price × quantity)         │                        │
  │  │                                          │                        │
  │  │  ORDER (TOTAL_WEIGHT):                  │                        │
  │  │    total = Σ (weight × quantity)        │                        │
  │  └───────────────────┬─────────────────────┘                        │
  │                      │                                               │
  │                      ▼                                               │
  │  ┌─────────────────────────────────────────┐                        │
  │  │         Check Violation                 │                        │
  │  │                                          │                        │
  │  │  IF notification != NO_NOTIFICATION     │                        │
  │  │    AND (total < minQty OR total > maxQty)│                       │
  │  │  THEN format message with placeholders  │                        │
  │  │    {{min}}, {{max}}, {{weight_unit}}    │                        │
  │  └───────────────────┬─────────────────────┘                        │
  │                      │                                               │
  │                      ▼                                               │
  │              ┌───────────────┐                                       │
  │              │   RESULT      │                                       │
  │              │               │                                       │
  │              │  text: "..."  │ ── displayed in QuantityLimitMessage  │
  │              │  hasViolation │ ── controls button disabled state     │
  │              └───────────────┘                                       │
  └──────────────────────────────────────────────────────────────────────┘


  ┌──────────────────────────────────────────────────────────────────────┐
  │                    DATA FLOW TIMELINE                                │
  │                                                                      │
  │  Page Load                                                           │
  │  ────────                                                            │
  │  1. Script executes (IIFE)                                          │
  │  2. getInstanceId() from DOM                                        │
  │  3. generateHmacKey(instanceId, secret)                             │
  │  4. GET /shop-metafield -> settings + rules + branding              │
  │  5. Mount React tree                                                │
  │  6. registerListener() with Wix analytics                           │
  │                                                                      │
  │  User Views Product                                                  │
  │  ──────────────────                                                  │
  │  7. Wix fires ViewContent -> fetch product info                     │
  │  8. ShopifyContext polls -> detects product change                   │
  │  9. QuantityLimitContext recalculates -> results                     │
  │  10. MainContainer injects message DOM + Portal render              │
  │  11. useButtonController evaluates violation state                   │
  │                                                                      │
  │  User Changes Quantity                                               │
  │  ─────────────────────                                               │
  │  12. useQuantityInputObserver detects input change                  │
  │  13. Updates qlQuantityOnPage + calls qlReInitApp()                 │
  │  14. ShopifyContext picks up new quantity                            │
  │  15. QuantityLimitContext recalculates                               │
  │  16. Message shows/hides, buttons enable/disable                    │
  │                                                                      │
  │  User Adds to Cart                                                   │
  │  ─────────────────                                                   │
  │  17. Wix fires AddToCart -> saves cartId                            │
  │  18. After 500ms: CartContext.refreshCart()                          │
  │  19. GET /currentCart -> parse line items                            │
  │  20. QuantityLimitContext recalculates with cart + page data         │
  │  21. Message updates, buttons update                                 │
  │                                                                      │
  │  User Navigates Away                                                 │
  │  ──────────────────                                                  │
  │  22. Wix fires PageView -> clears product state                     │
  │  23. If visitorId changed: clear cart (session change)              │
  │  24. qlReInitApp() -> React re-renders with empty state             │
  │                                                                      │
  └──────────────────────────────────────────────────────────────────────┘
```
