import { IParamsApi } from '@/types/apis/params';
import { IResponseApi } from '@/types/apis/response';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { InitDataSettings, InitShopInfo } from './initialState';

export interface IDataSettingState extends IParamsApi.IUpdateGeneralSetting {
  id: number;
}
export interface ISettingsState {
  activeKey: string;
  shopInfo: IResponseApi.IShopInfo['data'];
  dataSettings: IDataSettingState;
  dataSettingsBackup: IDataSettingState;
  checkDataSetting: boolean;
  checkDeliveryMethodSetting: boolean;
  checkZipcodeSetting: boolean;
  locationInfo?: IResponseApi.ICheckIpLocation;
  modeLight?: boolean;
}

// Define the initial state using that type
const initialState: ISettingsState = {
  activeKey: 'generalSettings',
  shopInfo: InitShopInfo,
  dataSettings: InitDataSettings,
  dataSettingsBackup: InitDataSettings,
  checkDataSetting: false,
  checkDeliveryMethodSetting: false,
  checkZipcodeSetting: false,
  locationInfo: undefined,
  modeLight: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {
    handleActiveKey: (state, action: PayloadAction<string>) => {
      state.activeKey = action.payload;
    },
  },
});

// Other code such as selectors can use the imported `RootState` type
export const activeKeySelector = createSelector(
  (state: RootState) => state.settings,
  (state) => state.activeKey,
);

export const dataSettingsSelector = createSelector(
  (state: RootState) => state.settings,
  (state) => state.dataSettings,
);

export const dataSettingsBackupSelector = createSelector(
  (state: RootState) => state.settings,
  (state) => state.dataSettingsBackup,
);

export const shopInfoSelector = createSelector(
  (state: RootState) => state.settings,
  (state) => state.shopInfo,
);

export const locationInfoSelector = createSelector(
  (state: RootState) => state.settings,
  (state) => state.locationInfo,
);

export const modeLightSelector = createSelector(
  (state: RootState) => state.settings,
  (state) => state.modeLight,
);

export default settingsSlice;
