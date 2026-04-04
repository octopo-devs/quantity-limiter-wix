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
import { LanguageContextProvider } from './context/LanguageContext/LanguageContext.tsx';
import { QuantityLimitContextProvider } from './context/QuantityLimitContext/QuantityLimitContext.tsx';
import { ShopifyContextProvider } from './context/ShopifyContext/ShopifyContext.tsx';
import PreviewInEditor from '~/components/PreviewInEditor/index.tsx';
import { QuantityLimitStyled } from '~/styled/quantity-limit-styled.ts';

const getInstanceId = (): string | null => {
  // Prefer embedded-script param (Wix CLI), fallback to script tag attribute (legacy)
  if ((window as any).__OL_INSTANCE_ID) return (window as any).__OL_INSTANCE_ID;
  const scriptElement = document.getElementById(import.meta.env.VITE_APP_ID_SCRIPT || 'quantity-limiter-script');
  return scriptElement?.getAttribute('data-instance-id') || null;
};

const initializeApp = async () => {
  const instanceId = getInstanceId();
  window.estimatedShop = instanceId;
  window.estimatedRuleLog = DEFAULT_RULE_LOG;

  const publicKey = await generateHmacKey(instanceId, import.meta.env.VITE_PUBLIC_API_HMAC_KEY);

  try {
    const isEditorMode = window.location.origin === 'https://static.parastorage.com';

    if (isEditorMode) {
      const root = ReactDOM.createRoot(document.body!);
      root.render(
        <>
          <QuantityLimitStyled />
          <PreviewInEditor />
        </>,
      );
    } else if (publicKey) {
      const res = await callAppApi('GET', 'GET_SHOP_METAFIELDS', {
        params: {
          shop: instanceId,
          key: publicKey,
        },
      });
      const appMetafields = { ...res, publicKey };
      window.estimatedAppMetafields = appMetafields;
      const mountEl =
        document.querySelector(`.${ClassEnum.EDDBlock}`) ||
        document.getElementById('ol-storefront-root') ||
        document.getElementById(import.meta.env.VITE_APP_ID_SCRIPT || 'syntrack-quantity-limiter-script');
      if (!mountEl) {
        console.warn('Quantity limiter: No mount element found');
        return;
      }
      const root = ReactDOM.createRoot(mountEl);
      if (appMetafields) {
        root.render(
          <React.StrictMode>
            <StyleSheetManager shouldForwardProp={() => true}>
              <ShopifyContextProvider>
                <AppContextProvider metafields={window.estimatedAppMetafields}>
                  <LanguageContextProvider>
                    <QuantityLimitContextProvider>
                      <App />
                    </QuantityLimitContextProvider>
                  </LanguageContextProvider>
                </AppContextProvider>
              </ShopifyContextProvider>
            </StyleSheetManager>
          </React.StrictMode>,
        );
      } else console.log('Quantity limiter: Metafields not found');
    }
  } catch (error) {
    console.log('Get shop metafield failed', error);
  }
};

const handleSaveWixData = async (topic: string, data: IWixPage | IWixProductData) => {
  const instanceId = getInstanceId();
  console.log('handleSaveWixData', topic, data);

  const publicKey = await generateHmacKey(instanceId, import.meta.env.VITE_PUBLIC_API_HMAC_KEY);
  switch (topic) {
    case 'PageView':
      window.estimatedCurrentPage = data as IWixPage;
      window.estimatedCurrentProduct = undefined;
      setTimeout(() => {
        window.estimatedReInitApp?.();
      }, 100);
      break;
    case 'ViewContent':
    case 'CustomizeProduct':
      if ((data as IWixProductData)?.id && window.estimatedPrevProductId !== (data as IWixProductData)?.id) {
        window.estimatedPrevProductId = (data as IWixProductData)?.id;
        try {
          if (instanceId && publicKey) {
            const productInfo = await callAppApi('GET', 'GET_CURRENT_PRODUCT_INFO', {
              params: {
                shop: instanceId,
                key: publicKey,
                productId: (data as IWixProductData)?.id,
              },
            });

            window.estimatedCurrentCollectionIds = productInfo?.collectionIds || [];
            window.estimatedCurrentRibbon = productInfo?.ribbon || '';
            window.estimatedProductVariants = productInfo?.variants || [];
          }
        } catch (error) {
          console.log('Quantity limiter: Get current product info error', error);
        }
      }
      window.estimatedCurrentProduct = data as IWixProductData;
      break;
    default:
      break;
  }
};

const registerListener = () => {
  if (window.isEstRegistered === true) return;
  if (Object.prototype.hasOwnProperty.call(window, 'wixDevelopersAnalytics')) {
    window.wixDevelopersAnalytics.register('PageView', (topic: string, data: IWixPage | IWixProductData) => {
      handleSaveWixData(topic, data);
      window.estimatedReInitApp?.();
    });
    window.isEstRegistered = true;
  }
};

const handleInitApp = () => {
  initializeApp();

  const isEditorMode = window.location.origin === 'https://static.parastorage.com';
  if (!isEditorMode) registerListener();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => handleInitApp());
} else {
  console.log('init app');
  handleInitApp();
}
