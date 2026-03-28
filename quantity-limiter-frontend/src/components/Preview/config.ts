import { interpolateMessage } from '@/helpers/string';
import { DisplayType, NotificationTrigger, TextAlign } from '@/types/enum';
import { ApiRequest } from '@/types/interface/request.interface';
import { AppearanceFormData } from '@/pages/Appearance/config';

export const DEFAULT_APPEARANCE: AppearanceFormData = {
  displayType: DisplayType.INLINE,
  backgroundColor: '#FFD466',
  textColor: '#4A4A4A',
  fontFamily: 'inherit',
  textAlign: TextAlign.LEFT,
  fontSize: 14,
  customCss: '',
};

export const DEFAULT_MAX_QUANTITY = 5;
export const DEFAULT_MIN_QUANTITY = 1;

export function getInitialQuantity(minQuantity: number, maxQuantity: number): number {
  return Math.max(minQuantity, Math.floor((minQuantity + maxQuantity) / 2));
}

export interface RuleConfig {
  maxQuantity: number;
  minQuantity: number;
  notifyAboutLimitWhen: NotificationTrigger;
  minQtyLimitMessage: string;
  maxQtyLimitMessage: string;
  contactUsMessage: string;
  contactUsButtonText: string;
  showContactUs: boolean;
}

export function getRuleConfig(rule?: Partial<ApiRequest.CreateRule>): RuleConfig {
  const maxQuantity = rule?.maxQty || DEFAULT_MAX_QUANTITY;
  const minQuantity = rule?.minQty || DEFAULT_MIN_QUANTITY;
  const notifyAboutLimitWhen = rule?.notifyAboutLimitWhen || NotificationTrigger.LIMIT_REACHED;
  const templateVars = { min_quantity: minQuantity, max_quantity: maxQuantity };
  const rawMinMessage = rule?.minQtyLimitMessage || 'Minimum quantity is {{min_quantity}}';
  const rawMaxMessage = rule?.maxQtyLimitMessage || 'Maximum quantity is {{max_quantity}}';
  const minQtyLimitMessage = interpolateMessage(rawMinMessage, templateVars);
  const maxQtyLimitMessage = interpolateMessage(rawMaxMessage, templateVars);
  const contactUsMessage = rule?.contactUsMessage || 'Please contact us if you want to buy in bulk';
  const contactUsButtonText = rule?.contactUsButtonText || 'Contact us';
  const showContactUs = rule?.showContactUsInNotification || false;

  return {
    maxQuantity,
    minQuantity,
    notifyAboutLimitWhen,
    minQtyLimitMessage,
    maxQtyLimitMessage,
    contactUsMessage,
    contactUsButtonText,
    showContactUs,
  };
}
