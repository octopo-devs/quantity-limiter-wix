import { useEffect, useRef } from 'react';
import { ClassEnum } from '~/shared/types/class.enum';

const ADD_TO_CART_SELECTORS = [
  ClassEnum.ButtonCartAdd,
  'button[data-hook="add-to-cart-button"]',
  '[data-hook="product-page-add-to-cart-button"]',
].join(', ');

const DISABLED_ATTR = 'data-ol-disabled';
const DISABLED_CLASS = 'ol-button-disabled';

interface ButtonControllerOptions {
  hasViolation: boolean;
}

/**
 * Disables add-to-cart buttons when quantity limits are violated.
 * Uses MutationObserver to handle Wix SPA re-renders.
 */
export function useButtonController({ hasViolation }: ButtonControllerOptions) {
  const disabledButtonsRef = useRef<Set<Element>>(new Set());

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
      document.querySelectorAll(ADD_TO_CART_SELECTORS).forEach(disableButton);
    } else {
      enableAllButtons();
    }

    const interval = setInterval(() => {
      const buttonsDisabled = disabledButtonsRef.current.size > 0;

      if (hasViolation && !buttonsDisabled) {
        document.querySelectorAll(ADD_TO_CART_SELECTORS).forEach(disableButton);
      } else if (!hasViolation && buttonsDisabled) {
        enableAllButtons();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [hasViolation]);

  useEffect(() => {
    if (!hasViolation) return;

    const observer = new MutationObserver(() => {
      document.querySelectorAll(ADD_TO_CART_SELECTORS).forEach((btn) => {
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
  }, [hasViolation]);

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
