import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { DisplayType, TextAlign } from '@/types/enum';
import { ApiRequest } from '@/types/interface/request.interface';
import { RootState } from '../store';
import { Appearance } from '@/types/interface';

interface AppearanceState {
  current: Appearance | null;
  old: Appearance | null;
}

const defaultAppearance: Appearance = {
  displayType: DisplayType.INLINE,
  backgroundColor: '#FFD466',
  textColor: '#4A4A4A',
  fontFamily: '',
  textAlign: TextAlign.LEFT,
  fontSize: 14,
  customCss: '',
  shop: '',
  createdAt: '',
  updatedAt: '',
};

const initialState: AppearanceState = {
  current: { ...defaultAppearance },
  old: null,
};

const compareAppearance = (current: Appearance | null, old: Appearance | null): boolean => {
  if (!current) return false;
  if (!old) return false;
  return (
    current.displayType !== old?.displayType ||
    current.backgroundColor !== old?.backgroundColor ||
    current.textColor !== old?.textColor ||
    current.fontFamily !== old?.fontFamily ||
    current.textAlign !== old?.textAlign ||
    current.fontSize !== old?.fontSize ||
    current.customCss !== old?.customCss
  );
};

export const appearanceSlice = createSlice({
  name: 'appearance',
  initialState,
  reducers: {
    setAppearance: (state, action: PayloadAction<Appearance>) => {
      state.old = action.payload;
      state.current = {
        ...action.payload,
      };
    },
    updateAppearance: (state, action: PayloadAction<Partial<Appearance>>) => {
      state.current = { ...state.current, ...action.payload } as Appearance;
    },
    resetAppearance: (state) => {
      if (state.old) {
        state.current = {
          ...state.old,
        };
      } else {
        state.current = { ...defaultAppearance };
      }
    },
    clearAppearance: (state) => {
      state.current = { ...defaultAppearance };
      state.old = null;
    },
  },
});

export const { setAppearance, updateAppearance, resetAppearance, clearAppearance } = appearanceSlice.actions;

export const currentAppearanceSelector = createSelector(
  (state: RootState) => state.appearance.current,
  (current) => current,
);

export const oldAppearanceSelector = createSelector(
  (state: RootState) => state.appearance.old,
  (old) => old,
);

export const hasChangesSelector = createSelector(
  (state: RootState) => state.appearance.current,
  (state: RootState) => state.appearance.old,
  (current, old) => compareAppearance(current, old),
);

export const appearanceSelector = currentAppearanceSelector;

export default appearanceSlice;
