# US-001 — Modal Quantity Limit Message

- **ID:** US-001-modal-quantity-limit-message
- **Group:** storefront
- **Title:** Show quantity limit message as a modal in storefront
- **Goal:** Allow merchants to display quantity limit messages as a modal popup (instead of only inline) so buyers clearly notice min/max quantity restrictions before checkout.
- **Actor:** Merchant (configures display type) / Buyer (sees the modal)
- **Status:** DONE

---

## User Story

**As a** merchant,
**I want** the quantity limit message to optionally display as a modal popup in my storefront,
**so that** my buyers clearly notice the min/max quantity restrictions and understand what they need to adjust before they can proceed.

---

## Acceptance Criteria

1. When a merchant sets the display type to "Popup" in the Appearance settings, quantity limit messages appear as a modal overlay on the storefront instead of an inline banner.
2. The modal displays the same content as the inline banner: violation message text and optional "Contact Us" link (if enabled by the merchant).
3. The modal visual design matches the existing modal preview in the dashboard Appearance page: centered red warning icon (circle with alert icon), message text below, and optional contact section — no title/header.
4. The modal applies the merchant's branding settings (background color, text color, font family, font size, text alignment).
5. The buyer can dismiss the modal via the close button (X) or by clicking outside the overlay (backdrop click).
6. The modal appears once per violation type — once for min limit, once for max limit (up to 2 times total per page visit). After the buyer dismisses a min violation modal, changing to another invalid quantity below the minimum does not re-trigger the modal. A max violation modal can still appear separately if the buyer exceeds the maximum.
7. After the buyer dismisses the modal, the add-to-cart button remains disabled until the buyer adjusts to a valid quantity.
8. When the merchant sets display type back to "Inline", messages revert to the current inline banner behavior with no change in functionality.
9. The display type toggle already exists in the dashboard Appearance page — no dashboard UI changes are needed.

---

## Steps (Buyer Flow)

1. Buyer visits a product page on the storefront where the merchant has set display type to "Popup".
2. Buyer selects a quantity that violates a min or max limit rule.
3. A modal overlay appears with a semi-transparent backdrop.
4. The modal shows a red circular warning icon centered at the top, followed by the quantity limit message (e.g., "Minimum order quantity is 5").
5. If "Contact Us" is enabled, a contact section appears below the message with the configured contact text and link.
6. Buyer reads the message and closes the modal (via X button, clicking outside, or pressing Escape).
7. The add-to-cart button remains disabled until the buyer adjusts to a valid quantity.
8. If the buyer changes to another quantity that still violates the same limit type (e.g., still below minimum), the modal does NOT re-appear — it was already shown for this violation type. The add-to-cart button stays disabled.
9. If the buyer changes to a quantity that violates a different limit type (e.g., exceeds maximum), the modal appears for that new violation type.
10. Once the buyer corrects the quantity to a valid value, no modal appears and the add-to-cart button becomes active.

---

## Feasibility

- **Verdict:** FEASIBLE_WITH_CHANGES
- **Notes:** The backend data model already supports a `POPUP` display type in the `Branding` entity (`displayType` enum has `INLINE` and `POPUP` values). The branding settings are already sent to the storefront via the `/public-endpoint/shop-metafield` API. The dashboard Appearance page already has an Inline/Popup toggle and a modal preview component (`WarningModal`). The change is purely in the storefront IIFE bundle — no backend or dashboard changes needed.
- **Evidence:**
  - `quantity-limiter-backend/src/modules/branding/entities/branding.entity.ts` — `displayType` column with `INLINE`/`POPUP` enum already exists
  - `quantity-limiter-backend/src/modules/branding/types/branding.enum.ts` — `DisplayType.POPUP` already defined
  - `quantity-limiter-backend/storefront/src/shared/types/branding.enum.ts` — `DisplayType.POPUP` defined in storefront types
  - `quantity-limiter-frontend/src/pages/Appearance/index.tsx` — Inline/Popup radio toggle already exists (lines 147-167)
  - `quantity-limiter-frontend/src/components/Preview/components/WarningModal/index.tsx` — existing modal preview to match visually (red warning icon, no title, message + contact section)
  - `quantity-limiter-backend/storefront/src/components/QuantityLimitMessage/QuantityLimitMessage.tsx` — current inline-only renderer, no branch on `displayType`
  - `quantity-limiter-backend/storefront/src/components/MainContainer.tsx` — orchestrates message placement, needs modal branch
  - `quantity-limiter-backend/storefront/src/context/AppContext/AppContext.tsx` — branding data already available in context
- **Gaps:**
  1. **New modal component in storefront** — a React modal/dialog component needs to be created in the storefront IIFE bundle (overlay backdrop, close button, red warning icon, message area, Escape key handling). Should visually match the dashboard's `WarningModal` preview.
  2. **Conditional rendering logic** — `MainContainer.tsx` or `QuantityLimitMessage.tsx` needs to branch on `branding.displayType` to render either inline banner or modal.
- **Last verified:** 2026-04-12

---

## Notes

- The storefront bundle is an IIFE injected into Wix sites, so the modal must be self-contained (no external UI library). Styled-components v6 is already used.
- The modal design reference is the dashboard's `WarningModal` component (`quantity-limiter-frontend/src/components/Preview/components/WarningModal/index.tsx`): red circle icon (48px, #ff4444) with white StatusAlert icon, message with branding styles applied, optional contact section, 24px padding, 8px border-radius.
- Accessibility: modal should trap focus, support Escape to close, and use `role="dialog"` + `aria-modal="true"`.
- NotificationTrigger behavior (LIMIT_REACHED vs ADD_TO_CART_BUTTON_CLICKED) is out of scope — that is an advanced feature for a future story. This story uses the current trigger logic as-is.

---

## Open questions for PO

None — all questions answered. Ready for `/create-test-case`.

Last synced: 2026-04-13
