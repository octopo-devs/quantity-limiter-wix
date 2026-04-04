import { useEffect, useRef } from 'react';
import { ClassEnum } from '~/shared/types/class.enum';

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

const ADD_TO_CART_SELECTORS = [
  ClassEnum.ButtonCartAdd,
  'button[data-hook="add-to-cart-button"]',
  '[data-hook="product-page-add-to-cart-button"]',
].join(', ');

const CHECKOUT_SELECTORS = [
  'button[data-hook*="checkout"]',
  'button[data-hook*="CheckoutButton"]',
  '[data-hook="cart-checkout-button"]',
  'a[data-hook*="checkout"]',
].join(', ');

const DISABLED_ATTR = 'data-ol-disabled';
const DISABLED_CLASS = 'ol-button-disabled';

interface ButtonControllerOptions {
  hasViolation: boolean;
  isCartPage: boolean;
}

/**
 * Disables add-to-cart / checkout buttons when quantity limits are violated.
 * Uses MutationObserver to handle Wix SPA re-renders.
 */
export function useButtonController({ hasViolation, isCartPage }: ButtonControllerOptions) {
  const disabledButtonsRef = useRef<Set<Element>>(new Set());

  const selector = isCartPage ? CHECKOUT_SELECTORS : ADD_TO_CART_SELECTORS;

  // Apply or remove disabled state on buttons
  useEffect(() => {
    const disableButton = (btn: Element) => {
      if (btn.hasAttribute(DISABLED_ATTR)) return;
      btn.setAttribute(DISABLED_ATTR, btn.getAttribute('disabled') || 'false');
      btn.setAttribute('disabled', 'true');
      btn.classList.add(DISABLED_CLASS);
      (btn as HTMLElement).style.opacity = '0.5';
      (btn as HTMLElement).style.pointerEvents = 'none';
      disabledButtonsRef.current.add(btn);
    };

    const enableAllButtons = () => {
      disabledButtonsRef.current.forEach((btn) => {
        const original = btn.getAttribute(DISABLED_ATTR);
        if (original === 'false') btn.removeAttribute('disabled');
        btn.removeAttribute(DISABLED_ATTR);
        btn.classList.remove(DISABLED_CLASS);
        (btn as HTMLElement).style.opacity = '';
        (btn as HTMLElement).style.pointerEvents = '';
      });
      disabledButtonsRef.current.clear();
    };

    if (hasViolation) {
      document.querySelectorAll(selector).forEach(disableButton);
    } else {
      enableAllButtons();
    }

    // Poll DOM for late-rendered limit messages (fallback for delayed React updates)
    const interval = setInterval(() => {
      const messageVisible = !!document.querySelector('.ot-quantity-limit__message');
      const buttonsDisabled = disabledButtonsRef.current.size > 0;

      if (messageVisible && !buttonsDisabled) {
        document.querySelectorAll(selector).forEach(disableButton);
      } else if (!messageVisible && buttonsDisabled) {
        enableAllButtons();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [hasViolation, selector]);

  // Watch for dynamically added buttons while violation is active
  useEffect(() => {
    if (!hasViolation) return;

    const observer = new MutationObserver(() => {
      document.querySelectorAll(selector).forEach((btn) => {
        if (btn.hasAttribute(DISABLED_ATTR)) return;
        btn.setAttribute(DISABLED_ATTR, btn.getAttribute('disabled') || 'false');
        btn.setAttribute('disabled', 'true');
        btn.classList.add(DISABLED_CLASS);
        (btn as HTMLElement).style.opacity = '0.5';
        (btn as HTMLElement).style.pointerEvents = 'none';
        disabledButtonsRef.current.add(btn);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [hasViolation, selector]);

  // Cleanup on unmount
  useEffect(() => {
    const ref = disabledButtonsRef;
    return () => {
      ref.current.forEach((btn) => {
        const original = btn.getAttribute(DISABLED_ATTR);
        if (original === 'false') btn.removeAttribute('disabled');
        btn.removeAttribute(DISABLED_ATTR);
        btn.classList.remove(DISABLED_CLASS);
        (btn as HTMLElement).style.opacity = '';
        (btn as HTMLElement).style.pointerEvents = '';
      });
      ref.current.clear();
    };
  }, []);
}
