import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { Ga4Event } from '@/types/enum';

interface IGa4Event {
  [Ga4Event.PricingPlanImpression]: boolean;
  [Ga4Event.ChoosePlan]: boolean;
  [Ga4Event.ChargeDone]: boolean;
  [Ga4Event.Uninstall]: boolean;
  [Ga4Event.SynctrackImpression]: boolean;
  [Ga4Event.SynctrackClick]: boolean;
  [Ga4Event.BlockifyImpression]: boolean;
  [Ga4Event.BlockifyClick]: boolean;
  [Ga4Event.OrderTrackingImpression]: boolean;
  [Ga4Event.OrderTrackingClick]: boolean;
  [Ga4Event.ReturnsImpression]: boolean;
  [Ga4Event.ReturnsClick]: boolean;
  [Ga4Event.ParetoClick]: boolean;
  [Ga4Event.ParetoImpression]: boolean;
}

interface SessionState {
  ga4Event: IGa4Event;
  banner: {
    isShowHolidayBanner: boolean;
    isVisibleBannerLimitInHome: boolean;
    isVisibleBannerLimitInTranslation: boolean;
    isVisibleBannerLimitInRuleConfig: boolean;
    isVisibleBannerLimitCheckout: boolean;
    isShowPopupTrialCampaign: boolean;
    isVisibleSetupChecklist: boolean;
    isShowBannerConditionRule: boolean;
    isShowBannerConditionCheckout: boolean;
  };
}

const initialState: SessionState = {
  ga4Event: {
    [Ga4Event.PricingPlanImpression]: false,
    [Ga4Event.ChoosePlan]: false,
    [Ga4Event.ChargeDone]: false,
    [Ga4Event.Uninstall]: false,
    [Ga4Event.SynctrackImpression]: false,
    [Ga4Event.SynctrackClick]: false,
    [Ga4Event.BlockifyImpression]: false,
    [Ga4Event.BlockifyClick]: false,
    [Ga4Event.OrderTrackingImpression]: false,
    [Ga4Event.OrderTrackingClick]: false,
    [Ga4Event.ReturnsImpression]: false,
    [Ga4Event.ReturnsClick]: false,
    [Ga4Event.ParetoClick]: false,
    [Ga4Event.ParetoImpression]: false,
  },

  banner: {
    isShowHolidayBanner: true,
    isVisibleBannerLimitInHome: true,
    isVisibleBannerLimitInTranslation: true,
    isVisibleBannerLimitInRuleConfig: true,
    isVisibleBannerLimitCheckout: true,
    isShowPopupTrialCampaign: true,
    isVisibleSetupChecklist: true,
    isShowBannerConditionRule: true,
    isShowBannerConditionCheckout: true,
  },
};

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    handleGa4Event: (state, action: PayloadAction<Ga4Event>) => {
      state.ga4Event[action.payload] = true;
    },
    handleBanner: (state, action: PayloadAction<{ key: keyof (typeof initialState)['banner']; value: boolean }>) => {
      state.banner[action.payload.key] = action.payload.value;
    },
  },
});

export const ga4EventSelector = createSelector(
  (state: RootState) => state.session,
  (state) => state.ga4Event,
);

export const isShowBannerSelector = createSelector(
  (state: RootState) => state.session,
  (state) => state.banner,
);

export default sessionSlice;
