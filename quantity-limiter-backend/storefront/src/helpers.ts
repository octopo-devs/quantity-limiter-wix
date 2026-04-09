import { IWixPage, IWixProductData, IWixProductPageLoaded } from '@nest/wix.interface.ts';
import { callAppApi } from '~/apis/index.ts';
import { QlProductData } from '~/shared/types/global.ts';
import { generateHmacKey } from '~/shared/utils/functions.ts';

// ---------------------------------------------------------------------------
// Instance ID
// ---------------------------------------------------------------------------

export const getInstanceId = (): string | null => {
  if (window.__OL_INSTANCE_ID) return window.__OL_INSTANCE_ID;
  const scriptElement = document.getElementById(import.meta.env.VITE_APP_ID_SCRIPT || 'quantity-limiter-script');
  return scriptElement?.getAttribute('data-instance-id') || null;
};

// ---------------------------------------------------------------------------
// Wix analytics event handler
// ---------------------------------------------------------------------------

const isOverlayPage = (pageType: string) => pageType.includes('side_cart') || pageType.includes('popup');

const fetchAndCacheProduct = async (productId: string) => {
  if (window.qlProducts.has(productId)) return window.qlProducts.get(productId) as QlProductData;

  const instanceId = getInstanceId();
  const publicKey = await generateHmacKey(instanceId, import.meta.env.VITE_PUBLIC_API_HMAC_KEY);

  const productData: QlProductData = {
    id: productId,
    name: '',
    price: 0,
    weight: undefined,
    sku: undefined,
    collections: [],
    variants: [],
    ribbon: '',
  };

  try {
    if (instanceId && publicKey) {
      const info = await callAppApi('GET', 'GET_CURRENT_PRODUCT_INFO', {
        params: { shop: instanceId, key: publicKey, productId },
      });
      productData.collections = info?.collectionIds || [];
      productData.ribbon = info?.ribbon || '';
      productData.variants = info?.variants || [];
    }
  } catch (error) {
    console.log('Quantity limiter: Get current product info error', error);
  }

  window.qlProducts.set(productId, productData);
  return productData;
};

export const handleWixEvent = async (topic: string, data: IWixPage | IWixProductData | IWixProductPageLoaded) => {
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

      break;
    }

    case 'ViewContent': {
      const product = data as IWixProductData;

      if (product?.id) {
        const productData = await fetchAndCacheProduct(product.id);
        window.qlCurrentProduct = {
          id: product.id,
          quantity: 1,
          selectedVariantId:
            product.variantId || productData.variants.length === 1 ? productData.variants[0].id : undefined,
        };
        window.qlTriggerRerender?.();
      }

      break;
    }

    case 'productPageLoaded': {
      const product = data as IWixProductPageLoaded;
      const productData = await fetchAndCacheProduct(product.productId);
      window.qlCurrentProduct = {
        id: product.productId,
        quantity: 1,
        selectedVariantId: productData.variants.length === 1 ? productData.variants[0].id : undefined,
      };
      window.qlTriggerRerender?.();
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
