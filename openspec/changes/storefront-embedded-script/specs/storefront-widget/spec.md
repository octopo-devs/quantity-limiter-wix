## MODIFIED Requirements

### Requirement: Storefront stripped of shipping/delivery logic
The storefront source SHALL be located at `order-limiter/src/site/embedded-scripts/quantity-limiter/` (moved from `order-limiter-backend/storefront/src/`) with all shipping/delivery estimation components, contexts, and types removed.

#### Scenario: Shipping components removed
- **WHEN** the storefront is built via the Wix CLI (`npm run build`)
- **THEN** ShippingRule, ZipcodeRule, CountryRule, RuleTimeline components do not exist in the bundle

#### Scenario: Shipping contexts removed
- **WHEN** the storefront initializes
- **THEN** RuleContext, ZipcodeRuleContext, CountryRuleContext, TimeCountdownContext are not in the context provider tree

#### Scenario: Source location
- **WHEN** the Wix CLI project structure is inspected
- **THEN** the storefront source (contexts, components, core, hooks, shared, styled) resides under `src/site/embedded-scripts/quantity-limiter/`

### Requirement: Widget re-evaluates on product/variant changes
The storefront SHALL re-evaluate quantity-limit rules when the Wix page context changes, using the `wixDevelopersAnalytics` event system. The listener registration and event handling logic SHALL be preserved identically from the original implementation.

#### Scenario: Wix page navigation
- **WHEN** the shopper navigates to a different product page (detected via `wixDevelopersAnalytics` PageView event)
- **THEN** the app re-initializes via `window.estimatedReInitApp()` and evaluates rules for the new product

#### Scenario: Variant change detected
- **WHEN** ShopifyContext detects a variant change (via its 500ms polling of `window.estimatedCurrentProduct`)
- **THEN** QuantityLimitContext re-evaluates rules for the new variant and updates displayed messages
