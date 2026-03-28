import highlightPreviewSlice from '@/redux/slice/highlightPreview.slice';
import RenderRouter from '@/routes';
import { Toast, ToastContainer } from '@wix/design-system';
import '@wix/design-system/styles.global.css';
import 'moment/min/locales';
import { memo, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { config } from './config';
import { PATH } from './constants/path';
import { convertNullToString } from './helpers';
import { stringify } from './helpers/string';
import { apiCaller } from './redux/query';
import loadingSlice from './redux/slice/loading';
import toastSlice, { toastSelector } from './redux/slice/toast.slice';

function App() {
  const dispatch = useDispatch();
  const dataSettings = apiCaller.useGeneralSettingsQuery();
  const getShopInfo = apiCaller.useGetShopInfoQuery();
  const navigate = useNavigate();
  const toast = useSelector(toastSelector);

  useEffect(() => {
    if (getShopInfo.data && getShopInfo.data.data) {
      // dispatch(settingsSlice.actions.handleShopInfo(getShopInfo.data.data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringify(getShopInfo.data)]);

  const shop = useMemo(() => {
    config.shop = getShopInfo?.data?.data?.shop || '';
    return getShopInfo?.data?.data?.shop;
  }, [getShopInfo?.data?.data?.shop]);

  useEffect(() => {
    if (config && config.role !== 'admin' && shop) {
      const timer = setTimeout(() => {
        const crisp = document.createElement('script');
        crisp.setAttribute('src', `${process.env.REACT_APP_API_END_POINT}public/script/plugin.js?shop=${shop}`);
        crisp.setAttribute('id', 'estimated-wix-crisp');
        crisp.appendChild(document.createTextNode(``));
        document.body.appendChild(crisp);
      }, 3500);
      return () => {
        clearTimeout(timer);
      };
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop]);

  useEffect(() => {
    dispatch(loadingSlice.actions.handleIsLoadingGeneralSettings(dataSettings.isLoading));
    dispatch(loadingSlice.actions.handleIsFetchingGeneralSettings(dataSettings.isFetching));
  }, [dataSettings.isFetching, dataSettings.isLoading, dispatch]);

  useEffect(() => {
    if (dataSettings.data) {
      const data = convertNullToString({
        ...dataSettings.data.data,
      });

      if (data.displayOnboarding) {
        navigate(PATH.WELCOME);
      }
      config.shop = dataSettings.data.data.shop;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(dataSettings.data), JSON.stringify(dispatch), JSON.stringify(navigate)]);

  useEffect(() => {
    document.addEventListener('click', () => {
      dispatch(highlightPreviewSlice.actions.handleClearHighlightItem());
    });
    return () => {
      document.removeEventListener('click', () => {
        dispatch(highlightPreviewSlice.actions.handleClearHighlightItem());
      });
    };
  }, [dispatch]);

  return (
    <>
      <RenderRouter />
      {toast.isOpen && (
        <ToastContainer>
          <Toast
            key={toast.content}
            role={toast.error ? 'alert' : 'status'}
            dismissible
            id="toast-id"
            className={`toast-message ${toast.error ? 'toast-message-error' : 'toast-message-success'}`}
            onDismiss={() => dispatch(toastSlice.actions.hideToast())}
          >
            {toast.content}
          </Toast>
        </ToastContainer>
      )}
    </>
  );
}

export default memo(App);
