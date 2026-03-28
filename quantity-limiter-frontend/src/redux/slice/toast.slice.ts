import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { IToast } from '@/types/components/toast';

const toast: IToast = {
  hasAction: undefined,
  error: false,
  content: '',
  isOpen: false,
  contentAction: 'undo',
};

const initialState = {
  toast,
};

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    handleToast: (state, action: PayloadAction<IToast>) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast.isOpen = false;
    },
  },
});

export const toastSelector = createSelector(
  (state: RootState) => state.toast,
  (state) => state.toast,
);

export default toastSlice;
