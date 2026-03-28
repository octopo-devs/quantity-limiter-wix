import { useState, useEffect, MutableRefObject } from 'react';

function useOnScreen(ref: MutableRefObject<Element | null>, rootMargin = '0px'): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const currentElement = ref?.current;

    if (currentElement) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio === 1) {
              setIsVisible(true);
            } else {
              setIsVisible(false);
            }
          });
        },
        {
          rootMargin,
          threshold: 1.0,
        },
      );

      observer.observe(currentElement);

      return () => {
        observer.unobserve(currentElement);
      };
    }
  }, [ref, rootMargin]);

  return isVisible;
}

export default useOnScreen;
