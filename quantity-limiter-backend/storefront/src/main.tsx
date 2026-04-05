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

// ---------------------------------------------------------------------------
// Instance ID
// ---------------------------------------------------------------------------

const getInstanceId = (): string | null => {
  if (window.__OL_INSTANCE_ID) return window.__OL_INSTANCE_ID;
  const scriptElement = document.getElementById(import.meta.env.VITE_APP_ID_SCRIPT || 'quantity-limiter-script');
  return scriptElement?.getAttribute('data-instance-id') || null;
};

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

      if (page?.visitorId) {
        window.qlVisitorId = page.visitorId;
      }

      // Don't clear product data for overlay pages (side cart, popups)
      if (!isOverlayPage(page?.pageTypeIdentifier || '')) {
        window.qlCurrentProduct = undefined;
      }

      setTimeout(() => window.qlTriggerRerender?.(), 100);
      break;
    }

    case 'ViewContent': {
      const product = data as IWixProductData;

      // Cache static product data in qlProducts (fetch from API only once per product)
      if (product?.id && !window.qlProducts.has(product.id)) {
        const productData = {
          id: product.id,
          name: product.name || '',
          price: product.price || 0,
          weight: product.weight,
          sku: product.sku,
          collections: [] as string[],
          variants: product.variants || [],
          ribbon: '',
        };

        try {
          if (instanceId && publicKey) {
            const info = await callAppApi('GET', 'GET_CURRENT_PRODUCT_INFO', {
              params: { shop: instanceId, key: publicKey, productId: product.id },
            });
            productData.collections = info?.collectionIds || [];
            productData.ribbon = info?.ribbon || '';
            productData.variants = info?.variants || productData.variants;
          }
        } catch (error) {
          console.log('Quantity limiter: Get current product info error', error);
        }

        window.qlProducts.set(product.id, productData);
      }

      window.qlCurrentProduct = {
        id: product.id,
        quantity: 1,
        selectedVariantId: product.variantId,
      };
      break;
    }

    case 'CustomizeProduct': {
      const product = data as IWixProductData;
      window.qlCurrentProduct = {
        id: product.id,
        quantity: window.qlCurrentProduct?.quantity || 1,
        selectedVariantId: product.variantId,
      };
      window.qlTriggerRerender?.();
      break;
    }
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
