import { ClassEnum } from '@nest/class.enum.ts';
import { IWixPage, IWixProductData } from '@nest/wix.interface.ts';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';
import { callAppApi } from '~/apis/index.ts';
import { generateHmacKey } from '~/shared/utils/functions.ts';
import App from './App.tsx';
import { AppContextProvider } from './context/AppContext/AppContext.tsx';
import { LanguageContextProvider } from './context/LanguageContext/LanguageContext.tsx';
import { ShopifyContextProvider } from './context/ShopifyContext/ShopifyContext.tsx';
import { getInstanceId, handleWixEvent } from './helpers.ts';

// ---------------------------------------------------------------------------
// App bootstrap
// ---------------------------------------------------------------------------

const mountApp = async () => {
  const instanceId = getInstanceId();
  window.qlShop = instanceId;

  const publicKey = await generateHmacKey(instanceId, import.meta.env.VITE_PUBLIC_API_HMAC_KEY);

  try {
    if (!publicKey) return;

    const res = await callAppApi('GET', 'GET_SHOP_METAFIELDS', {
      params: { shop: instanceId, key: publicKey },
    });
    const appMetafields = { ...res, publicKey };
    window.qlAppMetafields = appMetafields;

    const mountEl =
      document.querySelector(`.${ClassEnum.DefaultBlock}`) ||
      document.getElementById('ol-storefront-root') ||
      document.getElementById(import.meta.env.VITE_APP_ID_SCRIPT || 'quantity-limiter-script');

    if (!mountEl) {
      console.warn('Order limiter: No mount element found');
      return;
    }

    ReactDOM.createRoot(mountEl).render(
      <React.StrictMode>
        <StyleSheetManager shouldForwardProp={() => true}>
          <ShopifyContextProvider>
            <AppContextProvider metafields={appMetafields}>
              <LanguageContextProvider>
                <App />
              </LanguageContextProvider>
            </AppContextProvider>
          </ShopifyContextProvider>
        </StyleSheetManager>
      </React.StrictMode>,
    );
  } catch (error) {
    console.log('Get shop metafield failed', error);
  }
};

// ---------------------------------------------------------------------------
// Register Wix analytics listener
// ---------------------------------------------------------------------------

const registerListener = () => {
  if (window.isEstRegistered) return;
  if (!window.wixDevelopersAnalytics) return;

  const appId = import.meta.env.VITE_APP_ID_SCRIPT || 'quantity-limiter';

  window.wixDevelopersAnalytics.register(appId, (eventName, data) => {
    handleWixEvent(eventName, data as IWixPage | IWixProductData);
  });

  window.isEstRegistered = true;
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const bootstrap = () => {
  if (!window.qlProducts) window.qlProducts = new Map();
  registerListener();
  mountApp();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
