import { ClassEnum } from '@nest/class.enum.ts';
import { IWixPage, IWixProductData } from '@nest/wix.interface.ts';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { StyleSheetManager } from 'styled-components';
import { callAppApi } from '~/apis/index.ts';
import { QlProductData } from '~/shared/types/global.ts';
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
// Shared product fetch + cache
// ---------------------------------------------------------------------------

const fetchAndCacheProduct = async (productId: string, eventData?: Partial<QlProductData>) => {
  console.log(window.qlProducts);

  if (window.qlProducts.has(productId)) return;

  const instanceId = getInstanceId();
  const publicKey = await generateHmacKey(instanceId, import.meta.env.VITE_PUBLIC_API_HMAC_KEY);

  const productData: QlProductData = {
    id: productId,
    name: eventData?.name || '',
    price: eventData?.price || 0,
    weight: eventData?.weight,
    sku: eventData?.sku,
    collections: [],
    variants: eventData?.variants || [],
    ribbon: '',
  };

  try {
    if (instanceId && publicKey) {
      const info = await callAppApi('GET', 'GET_CURRENT_PRODUCT_INFO', {
        params: { shop: instanceId, key: publicKey, productId },
      });
      productData.collections = info?.collectionIds || [];
      productData.ribbon = info?.ribbon || '';
      productData.variants = info?.variants || productData.variants;
    }
  } catch (error) {
    console.log('Quantity limiter: Get current product info error', error);
  }

  window.qlProducts.set(productId, productData);
};

// ---------------------------------------------------------------------------
// Wix analytics event handler
// ---------------------------------------------------------------------------

const isOverlayPage = (pageType: string) => pageType && (pageType.includes('side_cart') || pageType.includes('popup'));

const handleWixEvent = async (topic: string, data: IWixPage | IWixProductData) => {
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

      if (product?.id) {
        await fetchAndCacheProduct(product.id, {
          name: product.name || '',
          price: product.price || 0,
          weight: product.weight,
          sku: product.sku,
          variants: product.variants || [],
        });
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
// DOM product scanner (fallback for missed Wix events on first load)
// ---------------------------------------------------------------------------

const scanProducts = async () => {
  // Detect product from DOM if not yet set by Wix events
  const productEl = document.querySelector('[product-id]');
  const productId = productEl?.getAttribute('product-id') || window.qlCurrentProduct?.id;
  if (!productId) return;

  // Fetch and cache product data if not already in Map
  await fetchAndCacheProduct(productId);

  // Set current product if not set or different product
  if (!window.qlCurrentProduct || window.qlCurrentProduct.id !== productId) {
    window.qlCurrentProduct = { id: productId, quantity: 1 };
  }

  window.qlTriggerRerender?.();
};

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const bootstrap = () => {
  if (!window.qlProducts) window.qlProducts = new Map();
  registerListener();
  mountApp();

  // Start product scanner interval
  scanProducts();
  setInterval(scanProducts, 1000);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}
