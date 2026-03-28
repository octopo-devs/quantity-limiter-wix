import { createSelector, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';

interface INavigateState {
  pathname: undefined | string;
  search: undefined | string;
  state?: any;
}

// Define the initial state using that type
const initialState: INavigateState = {
  pathname: undefined,
  search: undefined,
};

export const navigateSlice = createSlice({
  name: 'navigate',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    handleNavigate: (state, action: PayloadAction<INavigateState>) => {
      state.pathname = action.payload.pathname;
      state.search = action.payload.search;
      state.state = action.payload.state;
    },
  },
});

// Other code such as selectors can use the imported `RootState` type
export const navigateSelector = createSelector(
  (state: RootState) => state.navigate,
  (state) => state,
);

export default navigateSlice;
