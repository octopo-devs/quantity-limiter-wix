import { config } from '@/config';
import { IParamsApi } from '@/types/apis/params';
import { IResponseApi } from '@/types/apis/response';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ApiRequest } from '../../types/interface/request.interface';
import { ApiResponse } from '../../types/interface/response.interface';
import { ReduxTags } from '@/types/enum';

const { instance, shop } = config;

const convertParams = (input?: any) => {
  return {
    ...input,
    shop,
  };
};

export const apiCaller = createApi({
  reducerPath: 'apiCaller',
  refetchOnMountOrArgChange: 30,
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_END_POINT,
    prepareHeaders: async (headers) => {
      headers.set('Authorization', `${instance ? instance : config.urlParams ? config.urlParams : ''}`);
      headers.set('ngrok-skip-browser-warning', 'ngrok');

      return headers;
    },
  }),
  tagTypes: [
    'generalSetting',
    'shippingSetting',
    'shippingMethod',
    'shippingRule',
    'zipcodeSetting',
    'zipcodeRule',
    'zipcodeSpecificRule',
    'countryRule',
    'countryRuleSpecific',
    'brand',
    'countRules',
    'shop-discount',
    'checkoutRule',
    'checkoutAppearance',
    'shopCheckoutShippingMethod',
    'ruleConditionDetail',
    'languageRules',
    ReduxTags.APPEARANCE,
    ReduxTags.RULES,
  ],
  // get data settings
  endpoints: (builder) => ({
    getRuleById: builder.query<ApiResponse.GetRule, string>({
      query: (id) => {
        return {
          url: `rules/${id}`,
          method: 'GET',
          params: convertParams(),
        };
      },
    }),
    getRules: builder.query<ApiResponse.GetRules, ApiRequest.GetRulesQuery>({
      query: (input) => {
        return {
          url: 'rules',
          method: 'GET',
          params: convertParams(input),
        };
      },
      providesTags: [ReduxTags.RULES],
    }),
    updateRule: builder.mutation<IResponseApi.ICommon, ApiRequest.UpdateRule>({
      query: (input) => {
        const { id, ...rest } = input;
        return {
          url: `rules/${id}`,
          method: 'PUT',
          params: convertParams(),
          body: convertParams(rest),
        };
      },
      invalidatesTags: [ReduxTags.RULES],
    }),
    deleteRule: builder.mutation<IResponseApi.ICommon, string>({
      query: (id) => {
        return {
          url: `rules/${id}`,
          method: 'DELETE',
          params: convertParams(),
        };
      },
      invalidatesTags: [ReduxTags.RULES],
    }),
    createRule: builder.mutation<IResponseApi.ICommon, ApiRequest.CreateRule>({
      query: (input) => {
        return {
          url: 'rules',
          method: 'POST',
          body: convertParams(input),
        };
      },
      invalidatesTags: [ReduxTags.RULES],
    }),
    generalSettings: builder.query<IResponseApi.IGeneralSettings, void>({
      query: () => {
        return {
          url: 'shop/general-settings',
          method: 'GET',
          params: convertParams(),
        };
      },
      providesTags: ['generalSetting'],
    }),
    updateGeneralSetting: builder.mutation<IResponseApi.ICommon, IParamsApi.IUpdateGeneralSetting>({
      query: (input) => {
        return {
          url: 'shop/general-settings/update',
          method: 'PUT',
          body: convertParams(input),
        };
      },
      invalidatesTags: ['generalSetting', 'countRules'],
    }),
    getShopInfo: builder.query<IResponseApi.IShopInfo, void>({
      query: () => {
        return {
          url: 'shop/info',
          method: 'GET',
          params: convertParams(),
        };
      },
    }),
    getEmbeddedAppStatus: builder.query<IResponseApi.IEmbeddedAppStatus, void>({
      query: () => {
        return {
          url: 'shop/embedded-app-status',
          method: 'GET',
          params: convertParams(),
        };
      },
    }),
    updateOnboarding: builder.mutation<IResponseApi.ICommon, IParamsApi.IUpdateOnboarding>({
      query: (input) => {
        return {
          url: 'shop/onboarding/update',
          method: 'PUT',
          body: convertParams(input),
        };
      },
    }),

    getProducts: builder.query<IResponseApi.IGetProducts, IParamsApi.ICommon>({
      query: (input) => {
        return {
          url: 'attributes/products',
          method: 'GET',
          params: convertParams(input),
        };
      },
    }),
    getWixProducts: builder.query<ApiResponse.GetWixProducts, ApiRequest.GetWixProductsQuery>({
      query: (input) => {
        return {
          url: 'wix/products',
          method: 'GET',
          params: convertParams(input),
        };
      },
    }),
    getCollections: builder.query<IResponseApi.IGetCollections, IParamsApi.ICommon>({
      query: (input) => {
        return {
          url: 'attributes/collections',
          method: 'GET',
          params: convertParams(input),
        };
      },
    }),
    getWixCollections: builder.query<ApiResponse.GetWixCollections, ApiRequest.GetWixCollectionsQuery>({
      query: (input) => {
        return {
          url: 'wix/collections',
          method: 'GET',
          params: convertParams(input),
        };
      },
    }),

    syncProductAndCollection: builder.mutation<IResponseApi.ICommon, void>({
      query: () => {
        return {
          url: 'attributes/sync',
          method: 'POST',
          body: convertParams(),
        };
      },
    }),

    getShopifyLanguage: builder.query<IResponseApi.IGetShopifyLanguages, void>({
      query: () => {
        return {
          url: 'attributes/sync-language',
          method: 'GET',
          params: convertParams(),
        };
      },
    }),

    getListPricing: builder.query<IResponseApi.IGetAppPricing, void>({
      query: () => {
        return {
          url: '/app-pricing',
          method: 'GET',
          params: convertParams(),
        };
      },
    }),
    addDiscountCode: builder.mutation<IResponseApi.IGetAppPricing, { discountCode: string }>({
      query: (data) => {
        return {
          url: '/app-pricing/apply-code',
          method: 'PUT',
          body: convertParams(data),
        };
      },
      invalidatesTags: ['shop-discount'],
    }),
    getUrlUpdatePlan: builder.mutation<IResponseApi.IGetUrlUpdatePlan, IParamsApi.IUpdatePlan>({
      query: (input) => {
        return {
          url: '/shop/charge',
          method: 'GET',
          params: convertParams(input),
        };
      },
      invalidatesTags: [
        'generalSetting',
        'shippingMethod',
        'shippingRule',
        'zipcodeSpecificRule',
        'zipcodeRule',
        'countryRuleSpecific',
        'countryRule',
        'countRules',
        'checkoutRule',
      ],
    }),
    sendGA4Event: builder.mutation<IResponseApi.ICommon, IParamsApi.ISendGA4Event>({
      query: (input) => {
        return {
          url: '/analytics/analytic/ga-4/event',
          method: 'POST',
          body: convertParams(input),
        };
      },
    }),

    getShopDiscount: builder.query<IResponseApi.IShopDiscountRes, void>({
      query: () => {
        return {
          url: '/app-pricing/shop-discount',
          method: 'GET',
          params: convertParams(),
        };
      },
      providesTags: [{ type: 'shop-discount' }],
    }),

    removeShopDiscount: builder.mutation<IResponseApi.ICommon, void>({
      query: () => {
        return {
          url: '/app-pricing/remove-discount',
          method: 'DELETE',
          params: convertParams(),
        };
      },
      invalidatesTags: ['shop-discount'],
    }),

    getCannyToken: builder.query<IParamsApi.ICannyResponse, void>({
      query: () => {
        return {
          url: '/shop/canny-token',
          method: 'GET',
          params: convertParams(),
        };
      },
    }),

    getRuleConditionDetail: builder.query<IResponseApi.IGetConditionDetail, number>({
      query: (id) => {
        return {
          url: '/rule/detail',
          method: 'GET',
          params: convertParams({ id }),
        };
      },
      providesTags: [{ type: 'ruleConditionDetail' }],
    }),

    sendEventCustomerIo: builder.mutation<IResponseApi.ICommon, { event: string }>({
      query: (data) => {
        return {
          url: '/customer-io/send-event',
          method: 'POST',
          body: convertParams(data),
        };
      },
    }),

    // redirectUpdateShopScope: builder.mutation<
    //   IResponseApi.IRedirectUpdateShopScope,
    //   IParamsApi.IRedirectUpdateShopScope
    // >({
    //   query: (input) => {
    //     return {
    //       url: '/shop/redirect-update-shop-scope',
    //       method: 'POST',
    //       params: convertParams(input),
    //     };
    //   },
    // }),

    getProductTags: builder.query<IResponseApi.IGetProductTags, IParamsApi.ICommon>({
      query: (input) => {
        return {
          url: 'attributes/tags',
          method: 'GET',
          params: convertParams(input),
        };
      },
    }),

    getProductSKUs: builder.query<IResponseApi.IGetProductSKUs, IParamsApi.ICommon>({
      query: (input) => {
        return {
          url: 'attributes/skus',
          method: 'GET',
          params: convertParams(input),
        };
      },
    }),

    getProductMetafield: builder.query<IResponseApi.IGetProductMetafield, IParamsApi.ICommon>({
      query: (input) => {
        return {
          url: '/attributes/metafieldsAllProducts',
          method: 'GET',
          params: convertParams(input),
        };
      },
    }),

    getVariantMetafield: builder.query<IResponseApi.IGetProductMetafield, IParamsApi.ICommon>({
      query: (input) => {
        return {
          url: '/attributes/metafieldsAllVariants',
          method: 'GET',
          params: convertParams(input),
        };
      },
    }),

    getAppearance: builder.query<ApiResponse.GetAppearance, void>({
      query: () => {
        return {
          url: 'branding',
          method: 'GET',
          params: convertParams(),
        };
      },
      providesTags: [ReduxTags.APPEARANCE],
    }),
    updateAppearance: builder.mutation<ApiResponse.GetAppearance, ApiRequest.UpdateAppearance>({
      query: (input) => {
        return {
          url: 'branding',
          method: 'PUT',
          body: convertParams(input),
          params: convertParams(),
        };
      },
      invalidatesTags: [ReduxTags.APPEARANCE],
    }),
  }),
});
