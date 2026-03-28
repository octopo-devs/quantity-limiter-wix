import { createSelector, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initialState = {
  countPopup15DaysTrialNew: 0,
};

export const popupSlice = createSlice({
  name: 'popup',
  initialState,
  reducers: {
    handleCountPopup: (state) => {
      state.countPopup15DaysTrialNew += 1;
    },
  },
});

export const countPopupSelector = createSelector(
  (state: RootState) => state.popup,
  (state) => state.countPopup15DaysTrialNew,
);

export default popupSlice;
