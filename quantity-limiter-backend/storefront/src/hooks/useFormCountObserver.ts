import { useEffect, useState } from 'react';
import { ClassEnum } from '../shared/types/class.enum';

export const useFormCountObserver = () => {
  const [currentForms, setCurrentForms] = useState<HTMLElement[]>([]);

  useEffect(() => {
    let currentForms: HTMLElement[] = Array.from(document.querySelectorAll(`${ClassEnum.ButtonCartAdd}`));

    // Create mutation observer
    const observer = new MutationObserver(() => {
      currentForms = Array.from(document.querySelectorAll(`${ClassEnum.ButtonCartAdd}`));
      setCurrentForms(currentForms);
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return currentForms;
};
