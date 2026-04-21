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
  const [, setDismissCounter] = useState(0);

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
