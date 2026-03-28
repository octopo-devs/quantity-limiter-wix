import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface IPreviewState {
  selectedLanguage?: string;
  selectedCountry?: string;
  selectedFlag?: string;
}

const initialState: IPreviewState = {
  selectedLanguage: undefined,
};

export const previewSlice = createSlice({
  name: 'preview',
  initialState,
  reducers: {
    handleSetSelectedLanguage: (state, action: PayloadAction<string | undefined>) => {
      state.selectedLanguage = action.payload;
    },
    handleSetSelectedCountry: (state, action: PayloadAction<{ country?: string; flag?: string } | undefined>) => {
      if (!action.payload) {
        state.selectedCountry = undefined;
        state.selectedFlag = undefined;
      } else {
        const { country, flag } = action.payload;
        state.selectedCountry = country;
        state.selectedFlag = flag;
      }
    },
  },
});

export const selectedLanguageSelector = createSelector(
  (state: RootState) => state.preview.selectedLanguage,
  (state) => state,
);

export const selectedCountrySelector = createSelector(
  (state: RootState) => state.preview.selectedCountry,
  (state) => state,
);

export const selectedFlagSelector = createSelector(
  (state: RootState) => state.preview.selectedFlag,
  (state) => state,
);

export default previewSlice;
