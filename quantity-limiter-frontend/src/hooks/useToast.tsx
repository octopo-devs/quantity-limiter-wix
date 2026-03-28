import { config, WixClient } from '@/config';
import toastSlice, { toastSelector } from '@/redux/slice/toast.slice';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const useHandleToastNotEmbedded = () => {
  const dispatch = useDispatch();
  const toast = useSelector(toastSelector);
  const show = (content: string, isError?: boolean) => {
    if (!content) return;
    if (config.embedded) {
      WixClient.dashboard.showToast({
        message: content,
        type: isError ? 'error' : 'success',
      });
    } else {
      dispatch(
        toastSlice.actions.handleToast({
          content,
          isOpen: true,
          error: isError ?? false,
        }),
      );
    }
  };

  useEffect(() => {
    if (toast.isOpen) {
      const timer = setTimeout(() => {
        dispatch(toastSlice.actions.hideToast());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.isOpen, dispatch]);

  return {
    show,
  };
};

export default useHandleToastNotEmbedded;
