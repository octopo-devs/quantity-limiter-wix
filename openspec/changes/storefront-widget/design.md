## Context

The Quantity Limiter app has a working admin dashboard (NestJS backend + React frontend) where store owners create quantity-limit rules. Rules are never enforced on the live storefront.

Two storefront codebases exist:
- `order-limiter-backend/storefront/` — A production Wix storefront boilerplate (Vite + React + styled-components). Handles script injection via `data-instance-id`, Wix page/product detection via `wixDevelopersAnalytics.register('PageView')`, DOM injection via MainContainer + Portal, SPA re-initialization, and API client (`callAppApi`). Currently renders shipping/delivery estimation rules.
- `quantity-limiter-storefront/` — Shopify-based quantity-limit script with working business logic: `order-limit-calculator` (924 lines), `rule-processor`, message formatting with template variables, and `OrderLimitsInline` display component.

The backend `public-endpoint` module already has `GET /public-endpoint/shop-metafield` returning `{ rootLink, data: { settings: ShopGeneral }, shop }`. The boilerplate calls this on init to bootstrap. ShopGeneral has a OneToOne relation with Branding.

## Goals / Non-Goals

**Goals:**
- Extend `shop-metafield` response to include active rules and branding
- Strip shipping/delivery logic from the boilerplate
- Port quantity-limit calculator, rule processor, and message rendering into the boilerplate's architecture
- Create a `QuantityLimitContext` for rule evaluation state
- Support product pages and cart pages with inline limit messages
- Reuse the boilerplate's existing Wix integration (page detection, DOM injection, SPA handling, Vite build)

**Non-Goals:**
- Server-side cart validation / blocking (future)
- Add-to-Cart button blocking (future)
- `notifyAboutLimitWhen` behavior / notification triggers (future)
- Collection page support (future)
- Auto-injection via Wix Embedded Script API (separate change)
- New build configuration (reuse existing Vite IIFE build)

## Decisions

### 1. Extend shop-metafield vs. new endpoint

**Decision**: Extend the existing `GET /public-endpoint/shop-metafield` response to include `data.rules` and `data.branding`.

**Why**: The boilerplate already calls this endpoint on init via `callAppApi('GET', 'GET_SHOP_METAFIELDS', ...)`. Adding rules and branding to this response avoids a second API call and keeps the boilerplate's existing bootstrap flow intact. No client-side API changes needed — just handle the new fields in AppContext.

**Alternative considered**: New `GET /public-endpoint/storefront-data` endpoint — rejected because it would require modifying the boilerplate's init flow and adding a second API call.

### 2. Separate QuantityLimitContext vs. extending RuleContext

**Decision**: Create a new `QuantityLimitContext` and remove the existing `RuleContext` (along with ZipcodeRuleContext, CountryRuleContext).

**Why**: The existing RuleContext manages shipping/delivery rules with a completely different shape (minPrepDays, maxDeliveryDays, locationConditions). Quantity-limit rules have a different structure (minQty, maxQty, ruleProduct/ruleCollection/ruleCustomer/ruleOrder sub-entities). Extending RuleContext would create confusion. A clean replacement is simpler.

### 3. Keep React for rendering vs. vanilla DOM

**Decision**: Keep React — the boilerplate already bundles it, and styled-components provides the styling infrastructure.

**Why**: The boilerplate uses React 18, styled-components, and the Portal pattern for DOM injection. Switching to vanilla DOM would require rewriting the entire injection mechanism. The existing bundle already includes React. The `QuantityLimitMessage` component replaces `RenderRule` and is a simple React component.

**Alternative considered**: Strip React for bundle size — rejected because the boilerplate's architecture depends on it (contexts, portals, styled-components).

### 4. Type alignment approach

**Decision**: Create new type definitions in `storefront/src/shared/types/` that mirror the backend Rule entity, rather than importing from `nest-types/`.

**Why**: The `nest-types/` directory contains compiled `.d.ts` files from the backend that include shipping-related types. The quantity-limit types (Rule, RuleProduct, RuleCollection, RuleCustomer, RuleOrder, enums) should be defined explicitly to keep the storefront self-contained and avoid importing irrelevant shipping types.

### 5. Calculator adaptation strategy

**Decision**: Port the `order-limit-calculator.ts` and `rule-processor.ts` from `quantity-limiter-storefront/` into a new `storefront/src/core/` directory, adapting the interfaces to match the backend Rule entity shape.

**Why**: The calculator's core algorithms (rule matching, total calculation, remaining calculation, message formatting) are sound and tested. The main adaptation is mapping the Shopify-shaped rule interface to the backend's entity structure (e.g., `rule.condition.max` → `rule.maxQty`, `rule.triggerProducts` → `rule.ruleProduct.productIds`, `rule.type: "customer_tag"` → `rule.type: "CUSTOMER"`).

## Risks / Trade-offs

- **Calculator adaptation may have edge cases** → Mitigation: The STOREFRONT-PLAN.md has a detailed data mapping table (Shopify → Wix). Follow it field by field. Test with rules created in the admin dashboard.
- **Stripping shipping logic may break shared utilities** → Mitigation: Identify shared vs. shipping-only code before removing. Keep shared utilities (convertColor, functions).
- **Bundle size may grow with rules data** → Mitigation: Rules are fetched once per page load. Early exit if no active rules. The calculator only runs when rules exist.
- **Variant IDs are strings (UUIDs) in Wix vs. numbers in Shopify** → Mitigation: The calculator uses `parseInt()` for variant matching. Must be adapted to use string comparison for Wix UUIDs.
