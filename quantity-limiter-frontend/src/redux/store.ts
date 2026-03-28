import { config } from '@/config';
import appbarSlice from '@/redux/slice/appbar.slice';
import authSlice from '@/redux/slice/auth.slice';
import highlightPreviewSlice from '@/redux/slice/highlightPreview.slice';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import storageSession from 'redux-persist/lib/storage/session';
import { apiCaller } from './query';
import bannerSlice from './slice/banner.slice';
import cacheSlice from './slice/cache.slice';
import createRuleSlice from './slice/createRule.slice';
import appearanceSlice from './slice/appearance.slice';
import errorSlice from './slice/error.slice';
import loadingSlice from './slice/loading';
import navigateSlice from './slice/navigate';
import popupSlice from './slice/popup.slice';
import previewSlice from './slice/preview.slice';
import sessionSlice from './slice/session.slice';
import settingsSlice from './slice/settings.slice';
import toastSlice from './slice/toast.slice';

const toastPersistConfig = {
  key: 'toast',
  storage,
};
const bannerPersistConfig = {
  key: `${config.shop}-banner`,
  storage,
};
const settingsPersistConfig = {
  key: `${config.shop}-settings`,
  storage,
  whitelist: ['activeKey', 'rule', 'modeLight'],
};

const sessionPersistConfig = {
  key: 'session',
  storage: storageSession,
};

const persistRulesConfig = {
  key: 'rule',
  storage: storageSession,
};

const persistLanguageRuleConfig = {
  key: 'languageRule',
  storage,
};

const persistPopupConfig = {
  key: 'popup',
  storage,
};

const rootReducer = combineReducers({
  // Thêm Reducer tại đây. Sample : sample : sampleReducer
  toast: persistReducer(toastPersistConfig, toastSlice.reducer),
  loading: loadingSlice.reducer,
  banner: persistReducer(bannerPersistConfig, bannerSlice.reducer),
  error: errorSlice.reducer,
  navigate: navigateSlice.reducer,
  apiCaller: apiCaller.reducer,
  cache: cacheSlice.reducer,
  appbar: appbarSlice.reducer,
  session: persistReducer(sessionPersistConfig, sessionSlice.reducer),
  preview: previewSlice.reducer,
  highlightPreview: highlightPreviewSlice.reducer,
  auth: authSlice.reducer,
  settings: persistReducer(settingsPersistConfig, settingsSlice.reducer),
  popup: persistReducer(persistPopupConfig, popupSlice.reducer),
  createRule: createRuleSlice.reducer,
  appearance: appearanceSlice.reducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const customizeMiddleware = getDefaultMiddleware({
      serializableCheck: false,
    });
    return customizeMiddleware.concat(apiCaller.middleware);
  },
});

// setupListeners(store.dispatch)
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const persistor = persistStore(store);
export default store;
