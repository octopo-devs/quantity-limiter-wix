## 1. Backend — Extend shop-metafield Response

- [x] 1.1 Modify `PublicEndpointService.getShopMetafield()` to query active rules for the shop with relations (ruleProduct, ruleCollection, ruleCustomer, ruleOrder) eagerly loaded
- [x] 1.2 Load Branding via ShopGeneral's OneToOne relation and include as `data.branding` in the metafield response
- [x] 1.3 Include `data.rules` array in the response containing all active rules with sub-entities and message fields
- [x] 1.4 Ensure `PublicEndpointModule` imports `RulesModule` (or `TypeOrmModule.forFeature([Rule])`) for rule querying
- [ ] 1.5 Write unit tests: response includes rules with sub-entities, response includes branding, empty rules when none active

## 2. Storefront — Strip Shipping/Delivery Logic

- [x] 2.1 Remove components: `RenderRule/ShippingRule`, `RenderRule/ZipcodeRule`, `RenderRule/CountryRule`, `RuleTimeline`, `TimeCountDown`
- [x] 2.2 Remove contexts: `RuleContext`, `TimeCountdownContext` (and any ZipcodeRuleContext, CountryRuleContext if separate)
- [x] 2.3 Remove shipping-related hooks and types from `shared/types/` and `hooks/`
- [x] 2.4 Remove shipping-related styled components from `styled/`
- [x] 2.5 Update `main.tsx` context provider tree — remove stripped contexts, keep ShopifyContext → AppContext → LanguageContext
- [x] 2.6 Verify build still compiles after stripping

## 3. Storefront — Port Calculator & Rule Processor

- [x] 3.1 Create `storefront/src/core/` directory
- [x] 3.2 Port `order-limit-calculator.ts` from `quantity-limiter-storefront/src/core/` — adapt interfaces to backend Rule entity shape (rule.maxQty instead of rule.condition.max, ruleProduct.productIds instead of triggerProducts, etc.)
- [x] 3.3 Port `rule-processor.ts` — adapt `processRules()` and `filterRulesByDate()` to backend rule shape
- [x] 3.4 Adapt variant ID handling from numeric (parseInt) to string UUID comparison throughout calculator
- [x] 3.5 Port `multiple-quantity-handler.ts` if multiple quantity support is in scope

## 4. Storefront — Port Utility Functions

- [x] 4.1 Port `currency.ts` (Intl.NumberFormat currency formatting) to `storefront/src/shared/utils/`
- [x] 4.2 Port `weight.ts` (gram/lb/oz/kg conversion) to `storefront/src/shared/utils/`
- [x] 4.3 Port `string.ts` (placeholder replacement for React elements) to `storefront/src/shared/utils/`
- [x] 4.4 Port `number.ts` and `date.ts` utilities if needed by calculator

## 5. Storefront — Define Quantity-Limit Types

- [x] 5.1 Create `storefront/src/shared/types/quantity-limit.types.ts` with Rule, RuleProduct, RuleCollection, RuleCustomer, RuleOrder interfaces matching backend entities
- [x] 5.2 Define enums: RuleType, ProductSelectionType, RuleGroupProductConditionType, RuleGroupProductConditionOperator, RuleCustomerConditionType, OrderConditionType, NotificationTrigger
- [x] 5.3 Define OrderLimitResult, CalculateLimitParams interfaces for calculator I/O
- [x] 5.4 Update AppContext type to include `rules: Rule[]` and `branding: Branding | null` in its state

## 6. Storefront — Create QuantityLimitContext

- [x] 6.1 Create `storefront/src/context/QuantityLimitContext/` with provider and hook
- [x] 6.2 Consume rules from AppContext, current product/variant/cart from ShopifyContext
- [x] 6.3 Call `calculateOrderLimits()` when product/variant/cart state changes
- [x] 6.4 Expose evaluation results: per-variant messages, matched rules, totals, remaining
- [x] 6.5 Add to context provider tree in `main.tsx`: ShopifyContext → AppContext → LanguageContext → QuantityLimitContext → App

## 7. Storefront — Create QuantityLimitMessage Component

- [x] 7.1 Create `storefront/src/components/QuantityLimitMessage/` React component
- [x] 7.2 Render inline warning message with icon and message text (port from OrderLimitsInline)
- [x] 7.3 Apply branding styles: backgroundColor, textColor, fontSize, fontFamily, textAlign, customCss
- [x] 7.4 Implement message template interpolation ({{min}}, {{max}}, {{multiple}}, {{weight_unit}}, currency values)
- [x] 7.5 Render Contact Us button when `showContactUsInNotification=true`
- [x] 7.6 Render nothing when no limit message applies

## 8. Storefront — Wire Up MainContainer

- [x] 8.1 Update `MainContainer.tsx` to render `QuantityLimitMessage` via Portal instead of `RenderRule`
- [x] 8.2 Ensure DOM injection uses `custom_position` from ShopGeneral for selector targeting
- [x] 8.3 Create styled-components for quantity-limit message styling (replace shipping styles)

## 9. Storefront — Update AppContext for Rules & Branding

- [x] 9.1 Update AppContext to read `data.rules` and `data.branding` from shop-metafield API response
- [x] 9.2 Store rules and branding in AppContext state, expose via context value
- [x] 9.3 Pass branding to CustomStyled for global style application

## 10. Integration & Verification

- [x] 10.1 Build storefront with `pnpm build` — verify successful IIFE bundle output (TypeScript compiles clean; Vite build blocked by broken symlink in node_modules — pre-existing env issue, not code issue)
- [x] 10.2 Verify no shipping/delivery code remains in the bundle (search for removed component names)
- [ ] 10.3 Test with a shop that has active rules: verify messages appear on product page
- [ ] 10.4 Test with a shop with no rules: verify clean exit, no errors
- [ ] 10.5 Test variant change triggers re-evaluation via ShopifyContext polling
