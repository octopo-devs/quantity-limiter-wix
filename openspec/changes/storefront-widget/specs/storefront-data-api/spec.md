## ADDED Requirements

### Requirement: Shop metafield response includes active quantity-limit rules
The `GET /public-endpoint/shop-metafield` endpoint SHALL include all active quantity-limit rules for the shop in the `data.rules` field of the response, with their sub-entities (ruleProduct, ruleCollection, ruleCustomer, ruleOrder) eagerly loaded.

#### Scenario: Shop has active rules
- **WHEN** a valid shop-metafield request is made for a shop with active quantity-limit rules
- **THEN** the response `data.rules` array contains all rules where `isActive=true`, each including its type-specific sub-entity (ruleProduct, ruleCollection, ruleCustomer, or ruleOrder) with all fields

#### Scenario: Shop has no active rules
- **WHEN** a valid shop-metafield request is made for a shop with no active rules
- **THEN** the response `data.rules` is an empty array

#### Scenario: Rule sub-entities are included
- **WHEN** a rule of type PRODUCT is returned
- **THEN** the rule includes `ruleProduct` with `conditionType` (ALL_PRODUCTS, GROUP_OF_PRODUCTS, SPECIFIC_PRODUCTS), `productIds` (JSON array), `groupProducts` (JSON array of conditions with type/operator/value), `conjunction` (AND/OR), and `sellProductInMultiples` flag

#### Scenario: Rule of type COLLECTION is returned
- **WHEN** a rule of type COLLECTION is returned
- **THEN** the rule includes `ruleCollection` with `collectionIds` (JSON array)

#### Scenario: Rule of type CUSTOMER is returned
- **WHEN** a rule of type CUSTOMER is returned
- **THEN** the rule includes `ruleCustomer` with `conditionType` (ALL_CUSTOMERS, CUSTOMER_TAGS), `customerTags` (JSON array), and `excludeCustomerTags` (JSON array)

#### Scenario: Rule of type ORDER is returned
- **WHEN** a rule of type ORDER is returned
- **THEN** the rule includes `ruleOrder` with `conditionType` (TOTAL_PRODUCTS, TOTAL_PRICE, TOTAL_WEIGHT)

### Requirement: Shop metafield response includes branding settings
The `GET /public-endpoint/shop-metafield` endpoint SHALL include the shop's branding settings in the `data.branding` field, loaded via the ShopGeneral → Branding OneToOne relation.

#### Scenario: Shop has branding configured
- **WHEN** a valid shop-metafield request is made for a shop with branding settings
- **THEN** the response `data.branding` contains `displayType`, `backgroundColor`, `textColor`, `fontFamily`, `textAlign`, `fontSize`, and `customCss`

#### Scenario: Shop has no branding record
- **WHEN** a valid shop-metafield request is made for a shop without a branding record
- **THEN** the response `data.branding` is `null`

### Requirement: Rule fields include message templates and display settings
Each rule in `data.rules` SHALL include the message template fields and display settings needed by the storefront widget.

#### Scenario: Rule message fields present
- **WHEN** a rule is returned in the response
- **THEN** the rule includes `minQtyLimitMessage`, `maxQtyLimitMessage`, `breakMultipleLimitMessage`, `contactUsButtonText`, `contactUsMessage`, `showContactUsInNotification`, and `notifyAboutLimitWhen`
