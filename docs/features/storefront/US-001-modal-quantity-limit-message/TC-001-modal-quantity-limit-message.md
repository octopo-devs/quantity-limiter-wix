# TC-001 — Modal Quantity Limit Message

- **Linked story:** [US-001-modal-quantity-limit-message](US-001-modal-quantity-limit-message.md)
- **Surface:** UI (browser — storefront product page)
- **Summary:** HAPPY=11, EDGE=3, ERROR=1 (total 15)
- **Last run:** 2026-04-13

---

## HAPPY

### TC-001-modal-quantity-limit-message-H01
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Modal appears on min quantity violation when display type is Popup
- **precondition:** Merchant has set display type to "Popup" in Appearance settings. A product rule exists with minQty = 5 and notification trigger = LIMIT_REACHED.
- **steps:**
  1. Open the storefront product page for the product with the min quantity rule.
  2. Set the quantity to 2 (below the minimum of 5).
- **expected_result:** A modal overlay appears with a semi-transparent backdrop. The modal shows a red circular warning icon (48px) centered at the top, followed by the min quantity limit message (e.g., "Minimum order quantity is 5"). No title/header is shown. The add-to-cart button is disabled.

### TC-001-modal-quantity-limit-message-H02
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Modal appears on max quantity violation when display type is Popup
- **precondition:** Merchant has set display type to "Popup" in Appearance settings. A product rule exists with maxQty = 10 and notification trigger = LIMIT_REACHED.
- **steps:**
  1. Open the storefront product page for the product with the max quantity rule.
  2. Set the quantity to 15 (above the maximum of 10).
- **expected_result:** A modal overlay appears with the max quantity limit message (e.g., "Maximum order quantity is 10"). The modal has the same visual design as H01 (red warning icon, no title). The add-to-cart button is disabled.

### TC-001-modal-quantity-limit-message-H03
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Modal shows Contact Us section when enabled
- **precondition:** Merchant has set display type to "Popup". A rule exists with minQty = 5, notification trigger = LIMIT_REACHED, showContactUsInNotification = true, contactUsButtonText = "Contact Us", and a configured contactUsMessage.
- **steps:**
  1. Open the storefront product page.
  2. Set the quantity to 2 (triggers min violation).
- **expected_result:** The modal appears with the violation message AND a contact section below it showing the configured contact message text and a "Contact Us" link.

### TC-001-modal-quantity-limit-message-H04
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Modal applies merchant branding settings
- **precondition:** Merchant has set display type to "Popup" and configured branding: backgroundColor = #FF0000, textColor = #FFFFFF, fontFamily = "Georgia, serif", fontSize = 18, textAlign = CENTER. A rule exists with minQty = 5 and notification trigger = LIMIT_REACHED.
- **steps:**
  1. Open the storefront product page.
  2. Set the quantity to 2 (triggers violation).
- **expected_result:** The modal message area uses the merchant's branding: red background (#FF0000), white text (#FFFFFF), Georgia font, 18px font size, center-aligned text.

### TC-001-modal-quantity-limit-message-H05
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Dismiss modal via close button (X)
- **precondition:** Modal is currently displayed (display type = Popup, quantity violation active).
- **steps:**
  1. Click the close button (X) on the modal.
- **expected_result:** The modal and backdrop disappear. The add-to-cart button remains disabled (quantity is still invalid).

### TC-001-modal-quantity-limit-message-H06
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Dismiss modal via backdrop click
- **precondition:** Modal is currently displayed (display type = Popup, quantity violation active).
- **steps:**
  1. Click on the semi-transparent backdrop area outside the modal.
- **expected_result:** The modal and backdrop disappear. The add-to-cart button remains disabled (quantity is still invalid).

### TC-001-modal-quantity-limit-message-H07
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Dismiss modal via Escape key
- **precondition:** Modal is currently displayed (display type = Popup, quantity violation active).
- **steps:**
  1. Press the Escape key on the keyboard.
- **expected_result:** The modal and backdrop disappear. The add-to-cart button remains disabled (quantity is still invalid).

### TC-001-modal-quantity-limit-message-H08
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Modal does NOT re-appear for same violation type after dismiss
- **precondition:** Merchant has set display type to "Popup". A rule exists with minQty = 5 and maxQty = 10, notification trigger = LIMIT_REACHED.
- **steps:**
  1. Open the storefront product page and set quantity to 2 (min violation).
  2. Modal appears with min violation message. Dismiss it by clicking the close button.
  3. Change the quantity to 3 (still below min — same violation type).
- **expected_result:** The modal does NOT re-appear — it was already shown and dismissed for the min violation type. The add-to-cart button remains disabled.

### TC-001-modal-quantity-limit-message-H09
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Add-to-cart enabled when buyer corrects to valid quantity
- **precondition:** Merchant has set display type to "Popup". A rule exists with minQty = 5, notification trigger = LIMIT_REACHED. Modal was shown and dismissed.
- **steps:**
  1. Open the storefront product page and set quantity to 2 (triggers violation modal).
  2. Dismiss the modal.
  3. Change the quantity to 5 (valid — meets minimum).
- **expected_result:** No modal appears. The add-to-cart button becomes active/enabled. The buyer can proceed to add the product to cart.

### TC-001-modal-quantity-limit-message-H09b
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Modal appears for a different violation type (max) after min was dismissed
- **precondition:** Merchant has set display type to "Popup". A rule exists with minQty = 5 and maxQty = 10, notification trigger = LIMIT_REACHED. Min violation modal was already shown and dismissed.
- **steps:**
  1. Open the storefront product page and set quantity to 2 (min violation — modal appears).
  2. Dismiss the modal.
  3. Change the quantity to 15 (above max — different violation type).
- **expected_result:** A new modal appears with the max quantity violation message. The modal shows because max violation is a different type than the previously dismissed min violation.

### TC-001-modal-quantity-limit-message-H10
- **test-result:** PASS
- **test-result-note:** ""
- **type:** happy_path
- **description:** Inline display type shows inline banner, not modal
- **precondition:** Merchant has set display type to "Inline" in Appearance settings. A rule exists with minQty = 5 and notification trigger = LIMIT_REACHED.
- **steps:**
  1. Open the storefront product page.
  2. Set the quantity to 2 (triggers violation).
- **expected_result:** An inline banner appears near the add-to-cart button with the violation message (current behavior). No modal overlay or backdrop is shown.

---

## EDGE

### TC-001-modal-quantity-limit-message-E01
- **test-result:** PASS
- **test-result-note:** ""
- **type:** edge_case
- **description:** Buyer toggles quantity between valid and invalid values — modal resets after valid qty
- **precondition:** Merchant has set display type to "Popup". A rule exists with minQty = 5, notification trigger = LIMIT_REACHED.
- **steps:**
  1. Open the storefront product page. Set quantity to 5 (valid).
  2. Change quantity to 3 (invalid — min violation modal appears). Dismiss the modal.
  3. Change quantity to 2 (still invalid — same violation type).
  4. Change quantity to 7 (valid — no modal, dismiss state resets).
  5. Change quantity to 1 (invalid — min violation modal appears again because dismiss state was reset).
- **expected_result:** Modal appears on step 2 (first min violation) and step 5 (min violation after reset). No modal on steps 1, 3, and 4. Step 3 does not trigger modal because min violation was already dismissed. Step 5 triggers modal because the valid quantity in step 4 reset the dismiss state. Add-to-cart button is disabled during steps 2, 3, and 5, enabled during steps 1 and 4.

### TC-001-modal-quantity-limit-message-E02
- **test-result:** PASS
- **test-result-note:** ""
- **type:** edge_case
- **description:** Modal without Contact Us section (contact disabled)
- **precondition:** Merchant has set display type to "Popup". A rule exists with minQty = 5, notification trigger = LIMIT_REACHED, showContactUsInNotification = false.
- **steps:**
  1. Open the storefront product page.
  2. Set the quantity to 2 (triggers violation).
- **expected_result:** The modal appears with the red warning icon and violation message only. No contact section is displayed below the message. The modal layout is clean with no empty space where a contact section would be.

### TC-001-modal-quantity-limit-message-E03
- **test-result:** PASS
- **test-result-note:** ""
- **type:** edge_case
- **description:** Modal with large font size branding
- **precondition:** Merchant has set display type to "Popup" and configured branding with fontSize = 72 (maximum allowed). A rule exists with minQty = 5 and notification trigger = LIMIT_REACHED.
- **steps:**
  1. Open the storefront product page.
  2. Set the quantity to 2 (triggers violation).
- **expected_result:** The modal appears and renders the message in 72px font. The modal content remains readable and does not overflow outside the modal boundaries or off-screen. The close button is still visible and clickable.

---

## ERROR

### TC-001-modal-quantity-limit-message-R01
- **test-result:** PASS
- **test-result-note:** ""
- **type:** error_case
- **description:** Buyer cannot bypass quantity limit by dismissing the modal
- **precondition:** Merchant has set display type to "Popup". A rule exists with minQty = 5, notification trigger = LIMIT_REACHED. Buyer has set quantity to 2.
- **steps:**
  1. Modal appears with the min violation message.
  2. Dismiss the modal (close button or backdrop click).
  3. Attempt to click the add-to-cart button.
- **expected_result:** The add-to-cart button remains visually disabled (reduced opacity, pointer-events disabled). Clicking it has no effect — the product is not added to cart. The buyer must change the quantity to a valid value before proceeding.
