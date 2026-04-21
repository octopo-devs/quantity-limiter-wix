# Modal Quantity Limit Message — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use sp-subagent-driven-development (recommended) or sp-executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When `branding.displayType === POPUP`, show quantity limit violations as a modal overlay instead of an inline banner in the storefront.

**Architecture:** New `QuantityLimitModal` component rendered conditionally by `MainContainer`. The modal portals to `document.body` for full-viewport overlay. A `dismissedMessages` Set tracks which violation messages have been shown, so each violation type (min/max) only shows once per page visit. Resets when violations clear.

**Tech Stack:** React 18, styled-components v6, TypeScript. Storefront IIFE bundle — no external UI libraries.

**Spec:** `docs/features/storefront/US-001-modal-quantity-limit-message/specs/modal-quantity-limit-design.md`
**Test Cases:** `docs/features/storefront/US-001-modal-quantity-limit-message/TC-001-modal-quantity-limit-message.md`

---

## File Map

| Action | Path | Responsibility |
|--------|------|---------------|
| Modify | `storefront/src/shared/types/quantity-limit.types.ts` | Add `POPUP` to `DisplayType` enum |
| Create | `storefront/src/components/QuantityLimitModal/styled.ts` | Styled-components: Backdrop, ModalBox, WarningIconCircle, CloseButton, ContactLink |
| Create | `storefront/src/components/QuantityLimitModal/QuantityLimitModal.tsx` | Modal component: portal to body, branding styles, dismiss handlers, a11y |
| Modify | `storefront/src/components/MainContainer.tsx` | Branch on displayType, dismiss state management, conditional render |

All paths are relative to `quantity-limiter-backend/`.

---

### Task 1: Add POPUP to DisplayType enum

**Files:**
- Modify: `storefront/src/shared/types/quantity-limit.types.ts:53-55`

- [ ] **Step 1: Add POPUP value to DisplayType enum**

In `storefront/src/shared/types/quantity-limit.types.ts`, change:

```typescript
export enum DisplayType {
  INLINE = 'INLINE',
}
```

to:

```typescript
export enum DisplayType {
  INLINE = 'INLINE',
  POPUP = 'POPUP',
}
```

- [ ] **Step 2: Verify the build still compiles**

Run: `cd quantity-limiter-backend/storefront && pnpm build`
Expected: Build succeeds. No existing code references `DisplayType` beyond the type definition, so nothing breaks.

---

### Task 2: Create modal styled-components

**Files:**
- Create: `storefront/src/components/QuantityLimitModal/styled.ts`

**Reference:** Dashboard's `WarningModal` styles at `quantity-limiter-frontend/src/components/Preview/styled.ts` — `ModalContent` (padding 24px, border-radius 8px, branding props), `ModalWarningIcon` (48px red circle #ff4444).

- [ ] **Step 1: Create the styled-components file**

Create `storefront/src/components/QuantityLimitModal/styled.ts`:

```typescript
import styled from 'styled-components';

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999999;
`;

export const ModalBox = styled.div<{
  $backgroundColor: string;
  $textColor: string;
  $fontSize: number;
  $textAlign: string;
  $fontFamily: string;
}>`
  position: relative;
  max-width: 400px;
  width: 90%;
  padding: 24px;
  border-radius: 8px;
  background-color: ${(props) => props.$backgroundColor};
  color: ${(props) => props.$textColor};
  font-size: ${(props) => props.$fontSize}px;
  text-align: ${(props) => props.$textAlign};
  font-family: ${(props) => props.$fontFamily};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  max-height: 90vh;
  overflow-y: auto;
`;

export const WarningIconCircle = styled.div`
  width: 48px;
  height: 48px;
  background: #ff4444;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 4px;
  color: inherit;
  opacity: 0.7;

  &:hover {
    opacity: 1;
  }
`;

export const ContactLink = styled.a`
  color: #4a90e2;
  text-decoration: underline;
  cursor: pointer;
`;
```

Note: Uses `$` prefix for transient props (styled-components v6 convention used in this project) to prevent DOM forwarding.

- [ ] **Step 2: Verify the build still compiles**

Run: `cd quantity-limiter-backend/storefront && pnpm build`
Expected: Build succeeds. File is created but not imported anywhere yet.

---

### Task 3: Create QuantityLimitModal component

**Files:**
- Create: `storefront/src/components/QuantityLimitModal/QuantityLimitModal.tsx`

**Dependencies:** Task 1 (DisplayType.POPUP), Task 2 (styled-components)

- [ ] **Step 1: Create the modal component**

Create `storefront/src/components/QuantityLimitModal/QuantityLimitModal.tsx`:

```typescript
import React, { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Branding, QuantityLimitResult } from '~/shared/types/quantity-limit.types';
import { replacePlaceholder } from '~/shared/utils/string';
import { Backdrop, CloseButton, ContactLink, ModalBox, WarningIconCircle } from './styled';

interface QuantityLimitModalProps {
  result: QuantityLimitResult;
  branding: Branding | undefined;
  onClose: () => void;
}

const AlertIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9v4m0 4h.01" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <path
      d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function QuantityLimitModal({ result, branding, onClose }: QuantityLimitModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  const backgroundColor = branding?.backgroundColor || '#FFD466';
  const textColor = branding?.textColor || '#4A4A4A';
  const fontSize = branding?.fontSize || 14;
  const textAlign = branding?.textAlign?.toLowerCase() || 'left';
  const fontFamily = branding?.fontFamily || 'inherit';

  // Focus trap + restore previous focus
  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();
    return () => {
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, []);

  // Escape key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Scroll lock
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  const { rule } = result;

  return createPortal(
    <Backdrop onClick={handleBackdropClick}>
      <ModalBox
        role="dialog"
        aria-modal="true"
        $backgroundColor={backgroundColor}
        $textColor={textColor}
        $fontSize={fontSize}
        $textAlign={textAlign}
        $fontFamily={fontFamily}
      >
        <CloseButton ref={closeButtonRef} onClick={onClose} aria-label="Close">
          ✕
        </CloseButton>
        <WarningIconCircle>
          <AlertIcon />
        </WarningIconCircle>
        <b>{result.text}</b>
        {rule.showContactUsInNotification && rule.contactUsMessage && (
          <div>
            {replacePlaceholder(
              rule.contactUsMessage,
              '{Button text}',
              <ContactLink href="#" target="_self" rel="noreferrer">
                {rule.contactUsButtonText || 'Contact Us'}
              </ContactLink>,
            )}
          </div>
        )}
        {branding?.customCss && <style>{branding.customCss}</style>}
      </ModalBox>
    </Backdrop>,
    document.body,
  );
}

export default QuantityLimitModal;
```

Key decisions in this code:
- `AlertIcon` is a simple triangle-alert SVG (white stroke on the red circle). It is intentionally different from the small inline `WarningIcon` in `QuantityLimitMessage.tsx` — the modal uses a larger, more prominent alert style matching the dashboard preview.
- `createPortal(... , document.body)` ensures the modal escapes any positioned parent container.
- `$` prefix on styled-component props prevents DOM forwarding (styled-components v6 convention).
- Focus management: saves `document.activeElement` on mount, focuses close button, restores on unmount.
- Escape key listener on `document` — cleaned up on unmount.
- Scroll lock via `overflow: hidden` on body — restores original value on unmount.
- Backdrop click uses `e.target === e.currentTarget` to avoid closing when clicking inside the modal box.
- Contact section reuses the same `replacePlaceholder` utility as the inline message.

- [ ] **Step 2: Verify the build compiles**

Run: `cd quantity-limiter-backend/storefront && pnpm build`
Expected: Build succeeds. Component is created but not rendered yet (no import from MainContainer).

---

### Task 4: Integrate modal into MainContainer

**Files:**
- Modify: `storefront/src/components/MainContainer.tsx`

**Dependencies:** Task 1, Task 2, Task 3

This is the main integration task. `MainContainer` gains dismiss state management and a conditional render branch.

- [ ] **Step 1: Update MainContainer with modal logic**

Replace the full contents of `storefront/src/components/MainContainer.tsx` with:

```typescript
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useAppContext from '../context/AppContext/useAppContext';
import { useProductValidation } from '../hooks/useProductValidation';
import { useButtonController } from '../hooks/useButtonController';
import { useQuantityInputObserver } from '../hooks/useQuantityInputObserver';
import { ClassEnum } from '../shared/types/class.enum';
import { DisplayType } from '../shared/types/quantity-limit.types';
import { RenderMethod } from '../shared/types/shared.enum';
import Portal from './Portal/Portal';
import QuantityLimitMessage from './QuantityLimitMessage/QuantityLimitMessage';
import QuantityLimitModal from './QuantityLimitModal/QuantityLimitModal';

function MainContainer() {
  const { positionClass, shopGeneral, branding } = useAppContext();
  const { hasViolation, results } = useProductValidation();
  const { Main } = ClassEnum;
  const [triggerValue, setTriggerValue] = useState(0);

  // --- Modal dismiss state ---
  const dismissedMessagesRef = useRef<Set<string>>(new Set());
  const [dismissCounter, setDismissCounter] = useState(0);

  // Get the first violation result (same logic as QuantityLimitMessage)
  const firstResult = useMemo(() => {
    const entries = Object.entries(results);
    if (!entries.length) return null;
    const [, result] = entries[0];
    return result?.text ? result : null;
  }, [results]);

  // Reset dismissed messages when violations clear
  useEffect(() => {
    if (!hasViolation) {
      dismissedMessagesRef.current.clear();
    }
  }, [hasViolation]);

  const isPopupMode = branding?.displayType === DisplayType.POPUP;

  const isModalOpen =
    isPopupMode &&
    hasViolation &&
    !!firstResult?.text &&
    !dismissedMessagesRef.current.has(firstResult.text);

  const handleModalClose = useCallback(() => {
    if (firstResult?.text) {
      dismissedMessagesRef.current.add(firstResult.text);
      setDismissCounter((prev) => prev + 1); // trigger re-render
    }
  }, [firstResult?.text]);
  // --- End modal dismiss state ---

  useEffect(() => {
    window.qlTriggerRerender = () => setTriggerValue((prev) => prev + 1);
  }, []);

  // Disable add-to-cart buttons when limits violated
  useButtonController({ hasViolation });

  // Phase 3: Monitor quantity input changes
  useQuantityInputObserver();

  const mainDoms: Element[] = useMemo(() => {
    return Array.from(document.querySelectorAll(`.${Main}`));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Main, triggerValue]);

  const createAndInsertMainDiv = useCallback(
    (position: Element, renderMethod?: RenderMethod) => {
      const mainDiv = document.createElement('div');
      mainDiv.className = Main;
      mainDoms.push(mainDiv);

      switch (renderMethod) {
        case RenderMethod.After:
          position.after(mainDiv);
          break;
        case RenderMethod.Before:
          position.before(mainDiv);
          break;
        case RenderMethod.Prepend:
          position.prepend(mainDiv);
          break;
        default:
          position.append(mainDiv);
      }
    },
    [Main, mainDoms],
  );

  const getPositionDoms = useCallback(
    (selector: string) =>
      (selector?.endsWith(':first')
        ? [document.querySelector(selector.replace(/:first$/, ''))]
        : Array.from(document.querySelectorAll(selector))
      ).filter((item) => !!item),
    [],
  );

  // Only create inline mount points when NOT in popup mode
  if (!isPopupMode && !mainDoms.length) {
    let positions = getPositionDoms(positionClass);

    // Fallback: if no custom position found, insert before the add-to-cart button
    if (!positions.length) {
      positions = getPositionDoms(ClassEnum.ButtonCartAdd);
    }

    const renderMethod = (shopGeneral?.render_method as RenderMethod) || RenderMethod.Before;
    positions.forEach((position) => {
      createAndInsertMainDiv(position, renderMethod);
    });
  }

  return (
    <>
      {isPopupMode ? (
        <>
          {isModalOpen && firstResult && (
            <QuantityLimitModal result={firstResult} branding={branding} onClose={handleModalClose} />
          )}
        </>
      ) : (
        <>
          {mainDoms.map((dom, index) => (
            <Portal key={index} component={<QuantityLimitMessage />} dom={dom} />
          ))}
        </>
      )}
    </>
  );
}

export default memo(MainContainer);
```

Key changes from the original:
1. **New imports:** `QuantityLimitModal`, `DisplayType`, `useRef`
2. **`branding` destructured** from `useAppContext()` (was already available via `shopGeneral` but now used directly)
3. **`results` destructured** from `useProductValidation()` (previously only `hasViolation` was used here)
4. **`dismissedMessagesRef`** — a `useRef<Set<string>>` that tracks dismissed violation message texts. Using `useRef` because the Set itself doesn't need to trigger re-renders — the `dismissCounter` state handles that.
5. **`dismissCounter`** — a simple counter state that forces a re-render when a message is dismissed (since mutating the Set inside a ref doesn't trigger re-render on its own).
6. **`firstResult`** — extracts the first violation result, same logic as `QuantityLimitMessage` line 34.
7. **Reset effect** — clears `dismissedMessages` when `hasViolation` becomes false.
8. **`isModalOpen`** — derived: popup mode + has violation + result text not in dismissed set.
9. **`handleModalClose`** — adds current result text to dismissed set + bumps counter.
10. **Conditional render** — popup mode renders `QuantityLimitModal`, inline mode keeps existing Portal flow.
11. **Inline mount point creation** — guarded by `!isPopupMode` to skip creating DOM elements when in popup mode.

- [ ] **Step 2: Build the storefront bundle**

Run: `cd quantity-limiter-backend/storefront && pnpm build`
Expected: Build succeeds with no TypeScript errors.

- [ ] **Step 3: Verify lint passes**

Run: `cd quantity-limiter-backend/storefront && pnpm lint`
Expected: No lint errors. If any appear (e.g., unused `dismissCounter`), fix them.

---

### Task 5: Build verification and manual smoke test

**Files:** None (verification only)

- [ ] **Step 1: Full build of storefront**

Run: `cd quantity-limiter-backend/storefront && pnpm build`
Expected: Build succeeds. Output at `../extensions/quantity-limiter/assets/quantity-limiter.min.js` is updated.

- [ ] **Step 2: Verify output bundle exists**

Run: `ls -la quantity-limiter-backend/extensions/quantity-limiter/assets/quantity-limiter.min.*`
Expected: Both `.js` and `.css` files exist with recent timestamps.

- [ ] **Step 3: Verify lint across storefront**

Run: `cd quantity-limiter-backend/storefront && pnpm lint`
Expected: No errors.

- [ ] **Step 4: Verify the backend still builds (no breaking type changes)**

Run: `cd quantity-limiter-backend && pnpm build`
Expected: Build succeeds. The backend has its own `DisplayType` enum that already includes `POPUP`, so no conflict.

- [ ] **Step 5: Manual smoke test checklist**

Start the dev environment:
1. `cd quantity-limiter-frontend && pnpm dev` (port 3000)
2. `cd quantity-limiter-backend && pnpm start:dev` (port 4000)
3. `cd quantity-limiter-backend/storefront && pnpm build:watch`
4. Start cloudflared tunnel

Then test:

**TC H01/H02 — Modal appears:** Go to Appearance settings, select "Popup" display type, save. Visit a storefront product page with a min qty rule. Set quantity below minimum. Verify modal appears with red warning icon, message, backdrop.

**TC H05/H06/H07 — Dismiss methods:** Close via X button, via backdrop click, via Escape key. Verify each closes the modal.

**TC H08 — Same violation type doesn't re-show:** After dismissing, change to another invalid quantity of the same type. Verify modal does NOT re-appear.

**TC H09b — Different violation type shows:** After dismissing a min violation, set quantity above max. Verify a new modal appears with the max message.

**TC H10 — Inline mode unchanged:** Switch display type to "Inline". Verify inline banner still works, no modal.

**TC R01 — Button stays disabled:** After dismissing modal, verify add-to-cart button is still disabled.
