export interface IRuleContent {
  id: number;
  name: string;
  qlText: string;
  privacyPageText: string;
  privacyMore: string;
  cartPageLabelText: string;
  cartPageDateDisplay: string;
  soldOutCustomText: string;
}

export interface IAppearanceContent {
  timelineOrderStepTitle: string;
  timelineOrderStepDescription: string;
  timelineShipStepTitle: string;
  timelineShipStepDescription: string;
  timelineDeliveryStepTitle: string;
  timelineDeliveryStepDescription: string;
  inputLabel: string;
  inputPlaceholder: string;
  zipcodeAvailableText: string;
  zipcodeNotAvailableText: string;
  submitButton: string;
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
  shippingMethodLabel: string;
}

export interface ILanguageCheckoutRule {
  ruleId: number;
  messageText?: string;
}

export interface ICheckoutContent {
  productTimeLine?: string;
  thankYouAndOrderStatus?: string;
  checkoutRules: ILanguageCheckoutRule[];
}

export interface ILanguage {
  id: number;
  codeLanguage: ELanguage;
  nameLanguage: string;
  active: boolean;
  ruleContents: IRuleContent[];
  appearanceContent: IAppearanceContent;
  checkoutContent: ICheckoutContent;
}
