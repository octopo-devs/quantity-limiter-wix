## ADDED Requirements

### Requirement: Storefront stripped of shipping/delivery logic
The storefront at `order-limiter-backend/storefront/` SHALL have all shipping/delivery estimation components, contexts, and types removed.

#### Scenario: Shipping components removed
- **WHEN** the storefront is built
- **THEN** ShippingRule, ZipcodeRule, CountryRule, RuleTimeline components do not exist in the bundle

#### Scenario: Shipping contexts removed
- **WHEN** the storefront initializes
- **THEN** RuleContext, ZipcodeRuleContext, CountryRuleContext, TimeCountdownContext are not in the context provider tree

### Requirement: QuantityLimitContext provides rule evaluation
The storefront SHALL include a `QuantityLimitContext` that receives rules from AppContext, evaluates them against the current product/cart state, and exposes evaluation results to rendering components.

#### Scenario: Rules loaded from AppContext
- **WHEN** AppContext receives rules from the shop-metafield API response
- **THEN** QuantityLimitContext receives the rules and stores them for evaluation

#### Scenario: Product page evaluation
- **WHEN** the current page is a product page and ShopifyContext provides the current product/variant
- **THEN** QuantityLimitContext evaluates all applicable rules for the current variant and exposes the result (message text, rule, total, remaining)

#### Scenario: Cart page evaluation
- **WHEN** the current page is a cart page
- **THEN** QuantityLimitContext evaluates rules for each cart line item and exposes results keyed by variant/product ID

#### Scenario: No applicable rules
- **WHEN** no rules match the current product or cart items
- **THEN** QuantityLimitContext exposes an empty result and no messages are rendered

### Requirement: Calculator ported and adapted to backend rule shape
The `order-limit-calculator` and `rule-processor` from `quantity-limiter-storefront/` SHALL be ported to `storefront/src/core/`, with interfaces adapted to match the backend Rule entity structure.

#### Scenario: Rule type mapping
- **WHEN** a rule of type PRODUCT with `ruleProduct.conditionType=SPECIFIC_PRODUCTS` is evaluated
- **THEN** the calculator matches variants whose product IDs appear in `ruleProduct.productIds`

#### Scenario: Group product conditions
- **WHEN** a PRODUCT rule has `ruleProduct.conditionType=GROUP_OF_PRODUCTS` with `groupProducts` conditions
- **THEN** the calculator evaluates each condition (TAG/VENDOR/TITLE with EQUALS/CONTAINS/STARTS_WITH/ENDS_WITH/NOT_EQUALS/NOT_CONTAINS operators) using the rule's `conjunction` (AND/OR)

#### Scenario: Collection rule matching
- **WHEN** a COLLECTION rule is evaluated
- **THEN** the calculator matches variants whose product belongs to any collection in `ruleCollection.collectionIds`

#### Scenario: Customer rule matching
- **WHEN** a CUSTOMER rule with `ruleCustomer.conditionType=CUSTOMER_TAGS` is evaluated
- **THEN** the calculator matches if the current customer has any of `ruleCustomer.customerTags` AND does not have any of `ruleCustomer.excludeCustomerTags`

#### Scenario: Order rule evaluation
- **WHEN** an ORDER rule is evaluated with `ruleOrder.conditionType=TOTAL_PRICE`
- **THEN** the calculator sums the total price of all cart items and compares against `minQty`/`maxQty`

#### Scenario: Variant IDs are string UUIDs
- **WHEN** variant matching is performed
- **THEN** the calculator uses string comparison (not parseInt) for Wix UUID-based variant and product IDs

### Requirement: Inline message component renders limit messages
A `QuantityLimitMessage` React component SHALL replace `RenderRule` and render inline warning messages with branding styles applied.

#### Scenario: Message with branding
- **WHEN** a limit message is rendered
- **THEN** the component applies `backgroundColor`, `textColor`, `fontSize`, `fontFamily`, `textAlign`, and `customCss` from the Branding entity

#### Scenario: Message template interpolation
- **WHEN** a message template contains `{{min}}`, `{{max}}`, or `{{multiple}}` placeholders
- **THEN** the component replaces them with the actual values from the rule

#### Scenario: Contact Us button
- **WHEN** a rule has `showContactUsInNotification=true`
- **THEN** the component renders a Contact Us button with `contactUsButtonText` as label and `contactUsMessage` as the action

#### Scenario: No message to display
- **WHEN** the calculator returns no result for the current variant
- **THEN** the component renders nothing

### Requirement: Widget re-evaluates on product/variant changes
The storefront SHALL re-evaluate quantity-limit rules when the Wix page context changes, using the boilerplate's existing reactivity mechanisms.

#### Scenario: Wix page navigation
- **WHEN** the shopper navigates to a different product page (detected via `wixDevelopersAnalytics` PageView event)
- **THEN** the app re-initializes via `window.estimatedReInitApp()` and evaluates rules for the new product

#### Scenario: Variant change detected
- **WHEN** ShopifyContext detects a variant change (via its 500ms polling of `window.estimatedCurrentProduct`)
- **THEN** QuantityLimitContext re-evaluates rules for the new variant and updates displayed messages

### Requirement: Utility functions ported for calculation support
Currency formatting, weight conversion, and string placeholder replacement utilities SHALL be ported from `quantity-limiter-storefront/src/utils/` to `storefront/src/shared/utils/`.

#### Scenario: Currency formatting
- **WHEN** a rule message references a monetary value (e.g., TOTAL_PRICE limits)
- **THEN** the value is formatted using `Intl.NumberFormat` with the shop's currency code

#### Scenario: Weight conversion
- **WHEN** a rule message references a weight value (e.g., TOTAL_WEIGHT limits)
- **THEN** the value is converted from grams to the shop's weight unit (kg/lb/oz/g)
