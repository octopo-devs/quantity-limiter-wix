import { useContext } from 'react';
import QuantityLimitContext from './QuantityLimitContext';

const useQuantityLimitContext = () => {
  const context = useContext(QuantityLimitContext);
  if (!context) throw new Error('useQuantityLimitContext must be used within QuantityLimitContextProvider');
  return context;
};

export default useQuantityLimitContext;
