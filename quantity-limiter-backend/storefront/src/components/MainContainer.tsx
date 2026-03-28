import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import useAppContext from '../context/AppContext/useAppContext';
import { ClassEnum } from '../shared/types/class.enum';
import { RenderMethod } from '../shared/types/shared.enum';
import Portal from './Portal/Portal';
import QuantityLimitMessage from './QuantityLimitMessage/QuantityLimitMessage';

function MainContainer() {
  const { positionClass, shopGeneral } = useAppContext();
  const { Main } = ClassEnum;
  const [triggerValue, setTriggerValue] = useState(0);

  useEffect(() => {
    window.estimatedReInitApp = () => setTriggerValue((prev) => prev + 1);
  }, []);

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
    const buttons = getPositionDoms(positionClass);
    buttons.forEach((position) => {
      createAndInsertMainDiv(position, shopGeneral?.render_method as RenderMethod);
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
