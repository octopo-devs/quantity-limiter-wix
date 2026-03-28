import { useEffect, useState } from 'react';

type ClassChangeCallback = (newClasses: string[]) => void;

function useClassNameChange(selector: string, callback: ClassChangeCallback) {
  const [element, setElement] = useState<Element | null>(null);

  useEffect(() => {
    const targetElement = document.querySelector(selector);
    console.log('🚀 ~ useEffect ~ targetElement:', targetElement);
    if (targetElement) {
      setElement(targetElement);
    }
  }, [selector]);

  useEffect(() => {
    if (!element) return;

    let previousClasses = Array.from(element.classList);

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const newClasses = Array.from(element.classList);

          if (JSON.stringify(newClasses) !== JSON.stringify(previousClasses)) {
            callback(newClasses);
            previousClasses = newClasses;
          }
        }
      });
    });

    observer.observe(element, { attributes: true, attributeFilter: ['class'] });

    return () => {
      observer.disconnect();
    };
  }, [element, callback]);
}

export default useClassNameChange;
