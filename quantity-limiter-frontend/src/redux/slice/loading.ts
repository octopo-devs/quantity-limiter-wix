import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initialState = {
  isLoadingGeneralSettings: false,
  isFetchingGeneralSettings: false,
  isLoading: true,
};

export const loadingSlice = createSlice({
  name: 'loading',
  initialState,
  reducers: {
    handleIsLoadingGeneralSettings: (state, action: PayloadAction<boolean>) => {
      state.isLoadingGeneralSettings = action.payload;
      state.isLoading = action.payload;
    },
    handleIsFetchingGeneralSettings: (state, action: PayloadAction<boolean>) => {
      state.isLoadingGeneralSettings = action.payload;
    },
  },
});

export const isLoadingGeneralSettingsSelector = createSelector(
  (state: RootState) => state.loading,
  (state) => state.isLoadingGeneralSettings,
);
export const isLoadingSelector = createSelector(
  (state: RootState) => state.loading,
  (state) => state.isLoading,
);
export const isFetchingGeneralSettingsSelector = createSelector(
  (state: RootState) => state.loading,
  (state) => state.isFetchingGeneralSettings,
);

export default loadingSlice;
