import { PayloadAction, createSlice } from '@reduxjs/toolkit';

interface IState {
  expiredTime: number;
  isLoading: boolean;
}

// Define the initial state using that type
const initialState: IState = {
  expiredTime: Date.now() - 1000,
  isLoading: false,
};

export const authSlice = createSlice({
  name: 'auth',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    handleToken: (state, action: PayloadAction<IState>) => {
      state.expiredTime = action.payload.expiredTime;
      state.isLoading = action.payload.isLoading;
    },
    handleLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export default authSlice;
