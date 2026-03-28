import { useState, useEffect, useRef, MutableRefObject } from 'react';

function useImpress(): { isImpressed: boolean; elementRef: MutableRefObject<HTMLDivElement | null> } {
  const [isImpressed, setIsImpressed] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsImpressed(true);
          observer.disconnect();
        }
      },
      { threshold: 1.0 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return { isImpressed, elementRef };
}

export default useImpress;
