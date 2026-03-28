## 1. Default Notification Trigger

- [x] 1.1 Verify `createRule.slice.ts` initialState sets `notificationTrigger` to `NotificationTrigger.LIMIT_REACHED` — ensure the dropdown in Step2Content reflects this default on new rule creation
- [x] 1.2 Verify edit mode correctly loads the existing rule's notification trigger value (no override)

## 2. Message Template Variables

- [x] 2.1 Create `interpolateMessage(template: string, vars: Record<string, string | number>)` utility function that replaces `{{min_quantity}}` and `{{max_quantity}}` with actual values, leaving unmatched variables as raw text
- [x] 2.2 Add helper text below Min Quantity Limit Message and Max Quantity Limit Message fields showing "Available variables: {{min_quantity}}, {{max_quantity}}"
- [x] 2.3 Update Preview config (`components/Preview/config.ts`) to use `interpolateMessage` when building preview messages, passing current minQty and maxQty values
- [x] 2.4 Update WarningMessage and WarningModal components if needed to render interpolated text

## 3. Hide Sell Product in Multiples

- [x] 3.1 Add `SHOW_MULTIPLES_FEATURE = false` constant in a shared config or feature flags file
- [x] 3.2 Wrap "Sell Product in Multiples" toggle in `ProductRuleSetup` with the feature flag conditional
- [x] 3.3 Hide "Multiple" column in the rules table (`pages/Rules/index.tsx`) behind the feature flag
- [x] 3.4 Verify "Break Multiple Limit Message" field is naturally hidden when toggle is not rendered

## 4. Improve Product Selection Modal

- [x] 4.1 Improve product row layout in `SelectWixProductModal` — better image sizing, typography hierarchy, and variant grouping
- [x] 4.2 Add selected items count indicator to the modal header/action area (e.g., "3 selected")
- [x] 4.3 Ensure search bar stays sticky at the top when scrolling the product list
- [x] 4.4 Improve selected state visual feedback (checkbox + highlighted background)

## 5. Improve Collection Selection Modal

- [x] 5.1 Improve collection row layout in `SelectCollectionModal` — better typography and spacing
- [x] 5.2 Add selected items count indicator to the modal header/action area
- [x] 5.3 Ensure search bar stays sticky at the top when scrolling the collection list
- [x] 5.4 Improve selected state visual feedback to match product modal patterns

## 6. Improve Selected Items Display

- [x] 6.1 Improve selected products list in `ProductRuleSetup` — display as clear cards with thumbnail, name, variant info, and remove action
- [x] 6.2 Improve selected collections list in `CollectionRuleSetup` — display with collection name and clear remove action button
