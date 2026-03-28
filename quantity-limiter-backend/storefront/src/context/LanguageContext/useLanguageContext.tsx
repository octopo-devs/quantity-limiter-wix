import { useContext } from 'react';
import LanguageContext from './LanguageContext';

const useLanguageContext = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguageContext must be used within a LanguageContextProvider');
  return context;
};

export default useLanguageContext;
