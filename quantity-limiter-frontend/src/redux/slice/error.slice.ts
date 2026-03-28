import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Define the initial state using that type
const initialState = {
  isDisabled: false,
};

export const errorSlice = createSlice({
  name: 'error',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    handleIsDisabled: (state, action: PayloadAction<boolean>) => {
      state.isDisabled = action.payload;
    },
  },
});

// Other code such as selectors can use the imported `RootState` type

export const isDisabledSelector = createSelector(
  (state: RootState) => state.error,
  (state) => state.isDisabled,
);

export default errorSlice;
