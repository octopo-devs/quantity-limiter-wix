import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import useAppContext from '../context/AppContext/useAppContext';
import useShopifyContext from '../context/ShopifyContext/useShopifyContext';
import { useProductValidation } from '../hooks/useProductValidation';
import { useButtonController } from '../hooks/useButtonController';
import { useQuantityInputObserver } from '../hooks/useQuantityInputObserver';
import { ClassEnum } from '../shared/types/class.enum';
import { RenderMethod } from '../shared/types/shared.enum';
import Portal from './Portal/Portal';
import QuantityLimitMessage from './QuantityLimitMessage/QuantityLimitMessage';

const ADD_TO_CART_SELECTORS = [
  ClassEnum.ButtonCartAdd,
  'button[data-hook="add-to-cart-button"]',
  '[data-hook="product-page-add-to-cart-button"]',
].join(', ');

const MARK_PREFIX = 'quantity-limiter-proceed';

function MainContainer() {
  const { positionClass, shopGeneral } = useAppContext();
  const { currentProduct } = useShopifyContext();
  const { hasViolation } = useProductValidation();
  const { Main } = ClassEnum;
  const [triggerValue, setTriggerValue] = useState(0);

  useEffect(() => {
    window.qlTriggerRerender = () => setTriggerValue((prev) => prev + 1);
  }, []);

  // Mark add-to-cart buttons with current product+variant on each rerender
  useEffect(() => {
    if (!currentProduct?.id) return;

    const variantId = currentProduct.selectedVariantId || '';
    const markClass = `${MARK_PREFIX}-${currentProduct.id}-${variantId}`;

    document.querySelectorAll(ADD_TO_CART_SELECTORS).forEach((btn) => {
      // Skip if already marked with this exact combo
      if (btn.classList.contains(markClass)) return;

      // Remove stale marks
      btn.classList.forEach((cls) => {
        if (cls.startsWith(MARK_PREFIX)) btn.classList.remove(cls);
      });

      btn.classList.add(markClass);
    });
  }, [currentProduct, triggerValue]);

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

  if (!mainDoms.length) {
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
      {mainDoms.map((dom, index) => (
        <Portal key={index} component={<QuantityLimitMessage />} dom={dom} />
      ))}
    </>
  );
}

export default memo(MainContainer);
