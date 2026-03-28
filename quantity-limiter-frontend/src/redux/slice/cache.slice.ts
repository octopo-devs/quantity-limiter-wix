import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Define the initial state using that type
const initialState = {
  isCache: false,
  expired: new Date().getTime(),
};

export const cacheSlice = createSlice({
  name: 'cache',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    handleCache: (state, action: PayloadAction<boolean>) => {
      state.isCache = action.payload;
    },
    handleExpired: (state, action: PayloadAction<number>) => {
      state.expired = action.payload;
    },
  },
});

// Other code such as selectors can use the imported `RootState` type

export const isCacheSelector = createSelector(
  (state: RootState) => state.cache,
  (state) => state.isCache,
);
export const expiredSelector = createSelector(
  (state: RootState) => state.cache,
  (state) => state.expired,
);

export default cacheSlice;
