## Why

The Quantity Limiter app currently only has an admin dashboard (backend + frontend). Store owners can create rules, but those rules are never enforced on the live Wix storefront. Shoppers can still add any quantity to their cart. A customer-facing storefront widget is needed to display quantity limit messages on product and cart pages, closing the loop between rule creation and enforcement.

A Wix storefront boilerplate already exists at `order-limiter-backend/storefront/` — it handles script injection, Wix page detection, DOM injection via Portal, SPA navigation, and the API client layer. Currently it renders shipping/delivery estimation rules. The business logic for quantity limiting exists in `quantity-limiter-storefront/` (Shopify-based) — specifically the `order-limit-calculator`, `rule-processor`, message formatting, and display components.

## What Changes

- **Extend the existing `shop-metafield` endpoint** to include active quantity-limit rules (with sub-entities) and branding settings in the response
- **Strip shipping/delivery logic** from `order-limiter-backend/storefront/` — remove ShippingRule, ZipcodeRule, CountryRule, RuleTimeline, delivery date contexts
- **Port quantity-limit business logic** from `quantity-limiter-storefront/` into the boilerplate:
  - `order-limit-calculator.ts` — rule matching, total calculation, remaining calculation, message formatting
  - `rule-processor.ts` — rule normalization and date filtering
  - Display component — inline warning message with icon, Contact Us button, branding styles
  - Utility functions — currency formatting, weight conversion, placeholder interpolation
- **Create a QuantityLimitContext** to manage rule evaluation state, replacing the shipping-focused RuleContext
- **Adapt types** to match the backend Rule entity shape (PRODUCT/COLLECTION/CUSTOMER/ORDER types, sub-entities with conditionType, minQty/maxQty on Rule directly)

## Capabilities

### New Capabilities
- `storefront-data-api`: Extend existing shop-metafield endpoint to serve quantity-limit rules and branding
- `storefront-widget`: Port quantity-limit evaluation and rendering into the Wix storefront boilerplate

### Modified Capabilities

_(none — no existing spec requirements change)_

## Impact

- **Backend**: Modify `PublicEndpointService.shopMetafieldsPublic()` to include rules and branding in the metafield response
- **Storefront**: Replace all shipping/delivery components and contexts with quantity-limit equivalents
- **Build**: Output remains `order-limiter.min.js` via existing Vite IIFE build; no build config changes needed
- **Types**: Port and adapt `OrderLimitRule`, `Variant`, `OrderLimitResult` types to match backend entity shapes; remove shipping-related type imports from `nest-types/`
