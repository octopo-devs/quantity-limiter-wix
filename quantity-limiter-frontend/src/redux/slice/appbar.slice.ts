import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface IAppbarState {
  isClickedDiscard: boolean;
  isShowContextualBar: boolean;
}

const initialState: IAppbarState = {
  isClickedDiscard: false,
  isShowContextualBar: false,
};

export const appbarSlice = createSlice({
  name: 'appbar',
  initialState,
  reducers: {
    handleUpdateDiscardState: (state, action: PayloadAction<{ isClickedDiscard: boolean }>) => {
      state.isClickedDiscard = action.payload.isClickedDiscard;
    },
    handleUpdateContextualBarState: (state, action: PayloadAction<{ isShowContextualBar: boolean }>) => {
      state.isShowContextualBar = action.payload.isShowContextualBar;
    },
  },
});

export const clickedDiscardSelector = createSelector(
  (state: RootState) => state.appbar.isClickedDiscard,
  (state) => state,
);

export const isShowContextualBarSelector = createSelector(
  (state: RootState) => state.appbar.isShowContextualBar,
  (state) => state,
);

export default appbarSlice;
