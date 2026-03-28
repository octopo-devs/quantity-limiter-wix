import React, { useRef } from 'react';
import { createPortal } from 'react-dom';

interface IPortalProps extends React.HTMLProps<HTMLElement> {
  component: JSX.Element;
  dom: HTMLElement | Element;
  replaceContent?: boolean;
}

function Portal({ component, dom, replaceContent = false }: IPortalProps) {
  const hasMounted = useRef(false);
  if (!dom) return null;
  if (replaceContent && !hasMounted.current) {
    dom.innerHTML = '';
    hasMounted.current = true;
  }
  return createPortal(component, dom);
}

export default Portal;
