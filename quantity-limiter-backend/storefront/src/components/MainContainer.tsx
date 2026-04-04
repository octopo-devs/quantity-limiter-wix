import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import useAppContext from '../context/AppContext/useAppContext';
import useQuantityLimitContext from '../context/QuantityLimitContext/useQuantityLimitContext';
import useShopifyContext from '../context/ShopifyContext/useShopifyContext';
import { useButtonController } from '../hooks/useButtonController';
import { useQuantityInputObserver } from '../hooks/useQuantityInputObserver';
import { ClassEnum } from '../shared/types/class.enum';
import { RenderMethod } from '../shared/types/shared.enum';
import Portal from './Portal/Portal';
import QuantityLimitMessage from './QuantityLimitMessage/QuantityLimitMessage';

function MainContainer() {
  const { positionClass, shopGeneral } = useAppContext();
  const { hasViolation } = useQuantityLimitContext();
  const { currentPage } = useShopifyContext();
  const { Main } = ClassEnum;
  const [triggerValue, setTriggerValue] = useState(0);

  const isCartPage = useMemo(() => {
    return currentPage?.toLowerCase().includes('cart') || false;
  }, [currentPage]);

  useEffect(() => {
    window.estimatedReInitApp = () => setTriggerValue((prev) => prev + 1);
  }, []);

  // Phase 2: Disable buttons when limits violated
  useButtonController({ hasViolation, isCartPage });

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
