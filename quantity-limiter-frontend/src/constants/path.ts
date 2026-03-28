import { config } from '@/config';

const search = window.location.search.substring(1);
const convertPathname = (pathname: string) => {
  return {
    pathname: `${pathname ? `/${pathname}` : ''}`,
    search: `?${search}`,
  };
};

export const PATH = {
  DEFAULT: convertPathname('home'),
  RULES: convertPathname('rules'),
  CREATE_RULE: convertPathname('rules/create'),
  APPEARANCE: convertPathname('appearance'),
  ANALYTICS: convertPathname('analytics'),
  TRANSLATION: convertPathname('translation'),
  GENERAL_SETTINGS: convertPathname('general-settings'),
  GEOLOCATION_VALIDITY: convertPathname('general-settings/geolocation-validity'),
  DISPLAY_POSITION: convertPathname('general-settings/display-position'),
  PRICING_PLAN: convertPathname('pricing-plan'),
  WELCOME: convertPathname('onboarding'),
  RULE_SETUP: convertPathname('settings/rule'),
  EDIT_RULE: convertPathname('rules/edit/:id'),
  FEEDBACK: convertPathname('feedback'),
  CHECKOUT_EXTENSION: convertPathname('checkout-extension'),
  CREATE_CHECKOUT_EXTENSION: convertPathname('checkout-extension/create'),
  EDIT_CHECKOUT_EXTENSION: convertPathname('checkout-extension/edit/:id'),
  EDIT_CHECKOUT_APPEARANCE: convertPathname('checkout-extension/edit-appearance'),
  EDIT_CHECKOUT_PRODUCT_LINE_ITEMS: convertPathname('checkout-extension/edit-line-items'),
};

export const EMBEDDED_LINK = `https://admin.shopify.com/store/${
  config.shop ? config.shop.replace('.myshopify.com', '') : ''
}/themes/current/editor?context=apps`;

export const USER_GUIDE_LINK = {
  DATE_SETUP: 'https://help.omegatheme.com/en/article/create-estimate-rules-a-complete-guide-1awpd5z/',
  GUIDE_LINK: 'https://help.omegatheme.com/en/category/synctrack-estimated-delivery-date-1cr9tnj/',
  RULE_SETUP: 'https://help.omegatheme.com/en/article/create-estimate-rules-a-complete-guide-1awpd5z/',
  CHECKOUT_RULE_SETUP: 'https://help.omegatheme.com/en/article/dynamic-delivery-date-checkout-extension-1x2fqy9/',
};
