import { Plan, Subscription } from '@/types/enum';
import { IParamsApi } from '@/types/apis/params';
import { IResponseApi } from '@/types/apis/response';

export const InitShopInfo: IResponseApi.IShopInfo['data'] = {
  country: '',
  email: '',
  lastInstalledDate: '',
  shop: '',
  shopName: '',
  siteUrl: '',
};

export const InitZipcodeSettings: IParamsApi.IZipcodeSetting = {
  id: 0,
  shop: '',
  inputLabel: 'Check Shipping Availability',
  inputPlaceholder: 'Enter zipcode text',
  submitButton: 'Submit',
  submitButtonBackgroundColor: '#2c3e50',
  submitButtonTextColor: '#2D77E4',
  zipcodeAvailableText: 'Shipping available at',
  zipcodeNotAvailableText: 'Shipping unavailable at',
};

interface IDataSettingState extends IParamsApi.IUpdateGeneralSetting {
  id: number;
}
export const InitDataSettings: IDataSettingState = {
  id: 0,
  shop: '',
  plan: Plan.FREE,
  subscription: Subscription.Monthly,
  confirmationUrl: '',
  planUpdatedAt: 0,
  displayOnboarding: false,
};
