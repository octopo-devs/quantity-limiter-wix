import { ClassEnum } from '@nest/class.enum.ts';
import { DEFAULT_RULE_LOG } from '@nest/global.ts';
import { IWixPage, IWixProductData } from '@nest/wix.interface.ts';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';
import { callAppApi } from '~/apis/index.ts';
import { generateHmacKey } from '~/shared/utils/functions.ts';
import App from './App.tsx';
import { AppContextProvider } from './context/AppContext/AppContext.tsx';
import { CartContextProvider } from './context/CartContext/CartContext.tsx';
import { LanguageContextProvider } from './context/LanguageContext/LanguageContext.tsx';
import { QuantityLimitContextProvider } from './context/QuantityLimitContext/QuantityLimitContext.tsx';
import { ShopifyContextProvider } from './context/ShopifyContext/ShopifyContext.tsx';
import PreviewInEditor from '~/components/PreviewInEditor/index.tsx';
import { QuantityLimitStyled } from '~/styled/quantity-limit-styled.ts';

// ---------------------------------------------------------------------------
// Instance ID
// ---------------------------------------------------------------------------

const getInstanceId = (): string | null => {
  if ((window as any).__OL_INSTANCE_ID) return (window as any).__OL_INSTANCE_ID;
  const scriptElement = document.getElementById(import.meta.env.VITE_APP_ID_SCRIPT || 'quantity-limiter-script');
  return scriptElement?.getAttribute('data-instance-id') || null;
};

// ---------------------------------------------------------------------------
// App bootstrap
// ---------------------------------------------------------------------------

const initializeApp = async () => {
  const instanceId = getInstanceId();
  window.qlShop = instanceId;
  window.qlRuleLog = DEFAULT_RULE_LOG;

  const publicKey = await generateHmacKey(instanceId, import.meta.env.VITE_PUBLIC_API_HMAC_KEY);

  try {
    const isEditorMode = window.location.origin === 'https://static.parastorage.com';

    if (isEditorMode) {
      ReactDOM.createRoot(document.body!).render(
        <>
          <QuantityLimitStyled />
          <PreviewInEditor />
        </>,
      );
      return;
    }

    if (!publicKey) return;

    const res = await callAppApi('GET', 'GET_SHOP_METAFIELDS', {
      params: { shop: instanceId, key: publicKey },
    });
    const appMetafields = { ...res, publicKey };
    window.qlAppMetafields = appMetafields;

    const mountEl =
      document.querySelector(`.${ClassEnum.EDDBlock}`) ||
      document.getElementById('ol-storefront-root') ||
      document.getElementById(import.meta.env.VITE_APP_ID_SCRIPT || 'syntrack-quantity-limiter-script');

    if (!mountEl) {
      console.warn('Order limiter: No mount element found');
      return;
    }

    ReactDOM.createRoot(mountEl).render(
      <React.StrictMode>
        <StyleSheetManager shouldForwardProp={() => true}>
          <ShopifyContextProvider>
            <AppContextProvider metafields={appMetafields}>
              <CartContextProvider>
                <LanguageContextProvider>
                  <QuantityLimitContextProvider>
                    <App />
                  </QuantityLimitContextProvider>
                </LanguageContextProvider>
              </CartContextProvider>
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
// Wix analytics event handler
// ---------------------------------------------------------------------------

const isOverlayPage = (pageType: string) => pageType.includes('side_cart') || pageType.includes('popup');

const handleWixEvent = async (topic: string, data: IWixPage | IWixProductData) => {
  const instanceId = getInstanceId();
  const publicKey = await generateHmacKey(instanceId, import.meta.env.VITE_PUBLIC_API_HMAC_KEY);
  console.log('handle Wix event', topic, data);

  switch (topic) {
    case 'PageView': {
      const page = data as IWixPage;
      window.qlCurrentPage = page;

      // Detect session change (logout/login): if visitorId changed, clear stale cart
      if (page?.visitorId && window.qlVisitorId && page.visitorId !== window.qlVisitorId) {
        window.qlCartClear?.();
      }
      if (page?.visitorId) {
        window.qlVisitorId = page.visitorId;
      }

      // Don't clear product data for overlay pages (side cart, popups)
      if (!isOverlayPage(page?.pageTypeIdentifier || '')) {
        window.qlCurrentProduct = undefined;
        window.qlQuantityOnPage = undefined;
      }

      setTimeout(() => window.qlReInitApp?.(), 100);
      break;
    }

    case 'ViewContent': {
      const product = data as IWixProductData;
      if (product?.id && window.qlPrevProductId !== product.id) {
        window.qlPrevProductId = product.id;
        try {
          if (instanceId && publicKey) {
            const info = await callAppApi('GET', 'GET_CURRENT_PRODUCT_INFO', {
              params: { shop: instanceId, key: publicKey, productId: product.id },
            });
            window.qlCurrentCollectionIds = info?.collectionIds || [];
            window.qlCurrentRibbon = info?.ribbon || '';
            window.qlProductVariants = info?.variants || [];
          }
        } catch (error) {
          console.log('Quantity limiter: Get current product info error', error);
        }
      }
      window.qlCurrentProduct = product;
      break;
    }

    case 'CustomizeProduct':
      window.qlCurrentProduct = data as IWixProductData;
      window.qlReInitApp?.();
      break;

    case 'AddToCart':
    case 'addToCart':
      if ((data as any)?.cartId) {
        window.qlCartId = (data as any).cartId;
      }
      setTimeout(() => {
        window.qlCartRefresh?.();
        window.qlReInitApp?.();
      }, 500);
      break;

    case 'RemoveFromCart':
    case 'removeFromCart':
      setTimeout(() => {
        window.qlCartRefresh?.();
        window.qlReInitApp?.();
      }, 500);
      break;
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
    handleWixEvent(eventName, data);

    if (['PageView', 'ViewContent', 'CustomizeProduct'].includes(eventName)) {
      window.qlReInitApp?.();
    }
  });

  window.isEstRegistered = true;
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const boot = () => {
  initializeApp();
  if (window.location.origin !== 'https://static.parastorage.com') {
    registerListener();
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
