import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Define the initial state using that type
const initialState = {
  isVisibleRecommendApps: true,
  isVisibleDateAndTime: true,
  embeddedBanner: true,
  isVisibleBannerShiprocketPro: true,
  isVisibleBannerShiprocket: true,
  isVisibleBannerCheckoutExt: true,
  isVisibleBannerSetupAppearance: true,
  isVisibleBannerGeneralSettings: true,
  isVisibleWhatIsNewSection: true,
  isVisibleBannerInfoInNewRule: true,
  isVisiblePromotions: true,
  isVisibleBannerInfoInTranslation: true,
  isVisibleBannerLimitAnalyticForStandard: true,
  isVisibleBannerReviewSetup: true,
};

export const bannerSlice = createSlice({
  name: `commonSetting`,
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    handleVisibleBanner: (
      state,
      action: PayloadAction<{
        key: keyof typeof initialState;
        value: boolean;
      }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
  },
});

// Other code such as selectors can use the imported `RootState` type
export const isVisibleRecommendAppsSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleRecommendApps,
);

export const isVisibleDateAndTimeSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleDateAndTime,
);

export const embeddedBannerSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.embeddedBanner,
);

export const isVisibleBannerShiprocketProSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleBannerShiprocketPro,
);

export const isVisibleBannerShiprocketSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleBannerShiprocket,
);

export const isVisibleBannerCheckoutExtSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleBannerCheckoutExt,
);

export const isVisibleBannerSetupAppearanceSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleBannerSetupAppearance,
);

export const isVisibleBannerGeneralSettingsSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleBannerGeneralSettings,
);

export const isVisibleWhatIsNewSectionSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleWhatIsNewSection,
);

export const isVisibleBannerInfoInNewRuleSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleBannerInfoInNewRule,
);

export const isVisiblePromotionsSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisiblePromotions,
);

export const isVisibleBannerInfoInTranslationSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleBannerInfoInTranslation,
);

export const isVisibleBannerLimitAnalyticForStandardSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleBannerLimitAnalyticForStandard,
);

export const isVisibleBannerReviewSetupSelector = createSelector(
  (state: RootState) => state.banner,
  (state) => state.isVisibleBannerReviewSetup,
);

export default bannerSlice;
