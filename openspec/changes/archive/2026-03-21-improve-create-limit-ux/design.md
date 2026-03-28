## Context

The create/edit limit screen is a 2-step wizard (`CreateRule` component) with a live preview panel. Step 2 contains notification settings, message fields, and type-specific setup components (product/collection selection). The app uses Wix Design System components, Redux Toolkit for state, and RTK Query for API calls.

Current pain points:
- Notification trigger defaults to `LIMIT_REACHED` in the Redux slice but the dropdown may not reflect this clearly to users.
- Message fields are plain text with no variable support — the preview uses hardcoded fallback strings with `${maxQuantity}` interpolation in config.ts.
- Product/collection selection modals use basic checkbox lists with minimal visual polish.
- "Sell Product in Multiples" toggle and table column are visible but not part of MVP scope.

## Goals / Non-Goals

**Goals:**
- Default "Notify About Limit When" to "Limit reached" so it's pre-selected on new rules.
- Support `{{min_quantity}}` and `{{max_quantity}}` template variables in message text fields with real-time preview interpolation.
- Improve product and collection selection modal UX with better visual hierarchy and feedback.
- Hide "Sell Product in Multiples" from the rule form and "Multiple" column from the rules table for MVP.

**Non-Goals:**
- Backend changes — this is purely frontend.
- Custom variable support beyond `{{min_quantity}}` and `{{max_quantity}}`.
- Restructuring the 2-step wizard flow or changing Step 1.
- Changing the data model or API contracts.

## Decisions

### 1. Message variable interpolation approach

**Decision**: Implement a `interpolateMessage(template, vars)` utility that replaces `{{min_quantity}}` and `{{max_quantity}}` with actual values. Use this in the Preview component's config to process messages before rendering.

**Rationale**: Simple string replacement is sufficient for two known variables. No need for a template engine. The interpolation happens at render time in the preview, keeping the stored message as a template string.

**Alternative considered**: Rich text editor with variable chips — too complex for MVP, adds dependency overhead.

### 2. Variable insertion UX in message fields

**Decision**: Add helper text below each message field showing available variables (e.g., "Available variables: `{{min_quantity}}`, `{{max_quantity}}`"). Users type variables manually into the text field.

**Rationale**: Keeps implementation simple. Variable names are intuitive and few. A click-to-insert button could be added later.

**Alternative considered**: Dropdown/button to insert variables at cursor — better UX but adds complexity. Can iterate later.

### 3. Product/collection modal improvements

**Decision**: Enhance existing modals with:
- Better visual hierarchy: product images with proper sizing, collection icons
- Selected items count badge in modal header
- Clearer selected state (checkmark overlay, not just background color)
- "Clear all" option for bulk deselection
- Sticky search bar at top of modal

**Rationale**: Incremental improvement using existing Wix Design System components. No new dependencies needed. Maintains current modal pattern.

### 4. Hiding multiples feature

**Decision**: Conditionally render the toggle and table column behind a feature flag constant (`SHOW_MULTIPLES_FEATURE = false`). Keep all underlying code intact.

**Rationale**: Clean removal path — flip the constant to `true` when ready. No dead code deletion that would need to be re-implemented later. The "Break Multiple Limit Message" field is already conditionally rendered based on the toggle state, so hiding the toggle naturally hides that message field too.

## Risks / Trade-offs

- **[Variable typos]** → Users might mistype `{{min_quantity}}`. Mitigation: Show helper text with exact variable names; preview shows raw text if variable name doesn't match, making typos visible immediately.
- **[Existing messages]** → Rules created before this change have plain text messages without variables. Mitigation: Interpolation is additive — plain text messages without `{{...}}` patterns render exactly as before.
- **[Hidden multiples data]** → Hiding the UI doesn't clear `sellProductInMultiples` data on existing rules. Mitigation: The field defaults to `false`; existing `true` values are harmless since the backend doesn't enforce multiples logic in MVP.
