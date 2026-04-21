# Modal Quantity Limit Message — Design Spec

**Story:** [US-001-modal-quantity-limit-message](../US-001-modal-quantity-limit-message.md)
**Test Cases:** [TC-001-modal-quantity-limit-message](../TC-001-modal-quantity-limit-message.md)
**Scope:** Storefront IIFE bundle only — zero backend or dashboard changes.

---

## Approach

New `QuantityLimitModal` component in the storefront with conditional rendering in `MainContainer`. When `branding.displayType === POPUP`, render the modal instead of inline Portals. The modal portals to `document.body` for proper full-viewport overlay behavior.

---

## Component Structure

```
MainContainer
├── useButtonController (unchanged)
├── useQuantityInputObserver (unchanged)
├── [INLINE mode] Portal → QuantityLimitMessage (existing, unchanged)
└── [POPUP mode]  QuantityLimitModal (new)
                  ├── Backdrop
                  ├── ModalWarningIcon (red circle + alert SVG)
                  ├── Message text (branding-styled)
                  ├── Contact Us section (conditional)
                  └── Close button (X)
```

---

## Modal Visual Design

Matches the dashboard's `WarningModal` preview component (`quantity-limiter-frontend/src/components/Preview/components/WarningModal/index.tsx`).

### Layout

- **Backdrop:** `position: fixed`, full viewport, `rgba(0,0,0,0.5)`, `z-index: 999999`
- **Modal box:** centered via flexbox, `max-width: 400px`, `padding: 24px`, `border-radius: 8px`
- **Warning icon:** 48px circle, `background: #ff4444`, centered white SVG alert icon (24px) — reuse the existing `WarningIcon` SVG from `QuantityLimitMessage` or create a larger StatusAlert-style icon
- **Message:** bold text, branding styles applied (backgroundColor, textColor, fontFamily, fontSize, textAlign)
- **Contact section:** conditional on `rule.showContactUsInNotification`, shows `contactUsMessage` with `contactUsButtonText` link styled `color: #4a90e2; text-decoration: underline`
- **Close button:** top-right corner of modal box, `✕` character or SVG, `position: absolute; top: 8px; right: 8px`

### Branding Application

The modal content area applies all merchant branding settings from `AppContext.branding`:

| Setting | CSS Property | Default |
|---------|-------------|---------|
| `backgroundColor` | `background-color` on modal box | `#FFD466` |
| `textColor` | `color` on modal box | `#4A4A4A` |
| `fontFamily` | `font-family` | `inherit` |
| `fontSize` | `font-size` | `14px` |
| `textAlign` | `text-align` | `left` |
| `customCss` | injected `<style>` tag | none |

---

## Modal Behavior

### Trigger (open)

The modal appears **once per violation type** — once for min limit, once for max limit (up to 2 times total per page visit). After a violation message is dismissed, the same message will not re-appear even if the buyer changes to another invalid quantity of the same type.

**Condition:** `hasViolation === true && result.text not in dismissedMessages`

- `hasViolation` and `results` come from the existing `useProductValidation` hook
- `dismissedMessages` is a `Set<string>` in `MainContainer`, initialized empty — tracks the violation message text strings that have been dismissed

### Dismiss (close)

Three dismiss methods:

1. **Close button (X):** click handler on the close button
2. **Backdrop click:** click handler on the backdrop (not the modal box itself — use `e.target === e.currentTarget`)
3. **Escape key:** `keydown` event listener on `document`, filtered to `key === 'Escape'`

**On dismiss:** add `result.text` to `dismissedMessages`. The modal won't show again for the same violation message. A different violation type (e.g., max after min was dismissed) will still trigger the modal because its message text is different.

### Different violation type

When the buyer changes quantity from a min violation to a max violation (or vice versa), the violation message text changes. Since the new message is not in `dismissedMessages`, the modal appears for the new violation type.

### Reset

When the buyer changes quantity to a **valid** value, `hasViolation` becomes false. Clear `dismissedMessages` so all violation types can show again if the buyer later picks an invalid quantity.

### Scroll lock

While the modal is open, set `document.body.style.overflow = 'hidden'` to prevent background scrolling. Restore the original value on close/unmount.

---

## Accessibility

- `role="dialog"` and `aria-modal="true"` on the modal box
- **Focus trap:** on mount, focus the close button. Tab cycles within the modal (close button, contact link if present). On unmount, restore focus to the previously focused element.
- **Escape key:** closes the modal (same as backdrop click)

---

## File Changes

### New files

#### `storefront/src/components/QuantityLimitModal/QuantityLimitModal.tsx`

The modal component. Props:

```typescript
interface QuantityLimitModalProps {
  result: QuantityLimitResult;  // violation result (text + rule)
  branding: Branding | undefined;
  onClose: () => void;
}
```

- Renders via `createPortal` to `document.body`
- Backdrop + modal box with branding styles
- Warning icon (red circle + alert SVG)
- Message text from `result.text`
- Conditional contact section from `result.rule`
- Close button
- Escape key listener (useEffect)
- Focus trap (useEffect)
- Scroll lock (useEffect — set `overflow: hidden` on mount, restore on unmount)

#### `storefront/src/components/QuantityLimitModal/styled.ts`

Styled-components for the modal:

- `Backdrop` — fixed overlay, rgba backdrop, flexbox centering
- `ModalBox` — branding-styled content area (accepts backgroundColor, textColor, fontSize, textAlign, fontFamily as props)
- `WarningIconCircle` — 48px red circle with centered icon
- `CloseButton` — absolute positioned top-right
- `ContactLink` — styled anchor, `color: #4a90e2`

### Modified files

#### `storefront/src/components/MainContainer.tsx`

Changes:

1. Import `QuantityLimitModal`, `DisplayType`, and `useAppContext` branding
2. Read `branding` from `useAppContext()`
3. Add state: `dismissedMessages: Set<string>` (initialized empty) via `useRef` (Set doesn't need re-render tracking — modal visibility is derived)
4. Get the first violation result from `useProductValidation().results`
5. Compute `isModalOpen = hasViolation && branding?.displayType === DisplayType.POPUP && result?.text && !dismissedMessages.has(result.text)`
6. Add `handleModalClose` callback: adds `result.text` to `dismissedMessages`, triggers re-render via a counter state
7. Add effect: when `hasViolation` becomes false, clear `dismissedMessages` (reset for next violation cycle)
8. Conditional render:
   - If `displayType === POPUP`: render `QuantityLimitModal` when `isModalOpen` (no Portal/DOM positioning needed), skip the Portal-based inline rendering
   - If `displayType === INLINE` or undefined: keep existing Portal rendering (unchanged)

Note: `useButtonController` still runs in both modes — the add-to-cart button is disabled regardless of display type.

#### `storefront/src/shared/types/quantity-limit.types.ts`

Add `POPUP` to the `DisplayType` enum:

```typescript
export enum DisplayType {
  INLINE = 'INLINE',
  POPUP = 'POPUP',
}
```

### Unchanged files

- **Backend** — `DisplayType.POPUP` already exists in branding entity, DTO, and enum. Branding data already served via `/public-endpoint/shop-metafield`.
- **Frontend dashboard** — Inline/Popup toggle already exists in Appearance page (`quantity-limiter-frontend/src/pages/Appearance/index.tsx` lines 147-167).
- **`QuantityLimitMessage.tsx`** — stays as-is, handles INLINE rendering only.
- **`Portal.tsx`** — unchanged, used only for INLINE mode.
- **`AppContext.tsx`** — already exposes `branding` in context, no changes needed.

---

## TC Coverage Matrix

| TC ID | Covered By |
|-------|-----------|
| H01 — Modal on min violation | Trigger logic + QuantityLimitModal rendering with min message |
| H02 — Modal on max violation | Same trigger logic, different message text from rule |
| H03 — Contact Us shown | Conditional contact section in QuantityLimitModal |
| H04 — Branding applied | ModalBox styled-component accepts branding props |
| H05 — Dismiss via close button | CloseButton onClick → onClose → dismissedForQty |
| H06 — Dismiss via backdrop | Backdrop onClick (target check) → onClose |
| H07 — Dismiss via Escape | keydown listener → onClose |
| H08 — Does NOT re-appear for same violation type | dismissedMessages Set tracks dismissed message texts, same type stays dismissed |
| H09 — Button enabled on valid qty | useButtonController unchanged, dismissedMessages cleared |
| H09b — Modal appears for different violation type | dismissedMessages only contains min message, max message not in set → modal shows |
| H10 — Inline shows banner | displayType branch in MainContainer |
| E01 — Toggle valid/invalid, modal resets after valid qty | dismissedMessages cleared on valid qty, min modal re-appears on next invalid |
| E02 — No Contact Us section | Conditional render in QuantityLimitModal |
| E03 — Large font (72px) | ModalBox constrains with max-width + overflow handling |
| R01 — Cannot bypass via dismiss | useButtonController independent of modal state |
