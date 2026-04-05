import { useEffect, useRef } from 'react';

// Wix product page quantity input selectors
const QUANTITY_INPUT_SELECTORS = [
  'input[role="spinbutton"][aria-label="Quantity"]',
  'input[role="spinbutton"]',
  'input[data-hook*="number-input"]',
  'input[data-hook*="quantity"]',
  '[data-hook*="quantity-input"] input',
].join(', ');

// Wix increment/decrement button selectors
const QUANTITY_BUTTON_SELECTORS = [
  'button[data-hook="counter-plus-button"]',
  'button[data-hook="counter-minus-button"]',
  'button[aria-label="Increment"]',
  'button[aria-label="Decrement"]',
].join(', ');

/**
 * Monitors quantity input fields on Wix product pages.
 * Updates window.qlQuantityOnPage and triggers re-render on change.
 * Uses MutationObserver to handle Wix SPA navigation.
 */
export function useQuantityInputObserver() {
  const listenersRef = useRef<Map<Element, () => void>>(new Map());

  useEffect(() => {
    const readQuantity = (input: Element): number => {
      const parsed = parseInt((input as HTMLInputElement).value, 10);
      return isNaN(parsed) ? 1 : parsed;
    };

    const onQuantityChange = () => {
      const input = document.querySelector(QUANTITY_INPUT_SELECTORS);
      if (!input) return;

      const quantity = readQuantity(input);
      if (window.qlQuantityOnPage !== quantity) {
        window.qlQuantityOnPage = quantity;
        window.qlReInitApp?.();
      }
    };

    const attachListeners = () => {
      document.querySelectorAll(QUANTITY_INPUT_SELECTORS).forEach((input) => {
        if (listenersRef.current.has(input)) return;
        const handler = () => onQuantityChange();
        input.addEventListener('input', handler);
        input.addEventListener('change', handler);
        listenersRef.current.set(input, handler);
      });

      document.querySelectorAll(QUANTITY_BUTTON_SELECTORS).forEach((btn) => {
        if (listenersRef.current.has(btn)) return;
        const handler = () => setTimeout(onQuantityChange, 50);
        btn.addEventListener('click', handler);
        listenersRef.current.set(btn, handler);
      });

      // Read initial value
      const firstInput = document.querySelector(QUANTITY_INPUT_SELECTORS);
      if (firstInput) {
        const quantity = readQuantity(firstInput);
        if (window.qlQuantityOnPage !== quantity) {
          window.qlQuantityOnPage = quantity;
        }
      }
    };

    attachListeners();

    const observer = new MutationObserver(attachListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    const currentListeners = listenersRef.current;
    return () => {
      observer.disconnect();
      currentListeners.forEach((handler, el) => {
        el.removeEventListener('input', handler);
        el.removeEventListener('change', handler);
        el.removeEventListener('click', handler);
      });
      currentListeners.clear();
    };
  }, []);
}
