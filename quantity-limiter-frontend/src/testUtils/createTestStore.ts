import { combineReducers, configureStore } from '@reduxjs/toolkit';
import appbarSlice from '@/redux/slice/appbar.slice';
import authSlice from '@/redux/slice/auth.slice';
import bannerSlice from '@/redux/slice/banner.slice';
import cacheSlice from '@/redux/slice/cache.slice';
import createRuleSlice from '@/redux/slice/createRule.slice';
import appearanceSlice from '@/redux/slice/appearance.slice';
import errorSlice from '@/redux/slice/error.slice';
import highlightPreviewSlice from '@/redux/slice/highlightPreview.slice';
import loadingSlice from '@/redux/slice/loading';
import navigateSlice from '@/redux/slice/navigate';
import popupSlice from '@/redux/slice/popup.slice';
import previewSlice from '@/redux/slice/preview.slice';
import sessionSlice from '@/redux/slice/session.slice';
import settingsSlice from '@/redux/slice/settings.slice';
import toastSlice from '@/redux/slice/toast.slice';

const rootReducer = combineReducers({
  toast: toastSlice.reducer,
  loading: loadingSlice.reducer,
  banner: bannerSlice.reducer,
  error: errorSlice.reducer,
  navigate: navigateSlice.reducer,
  cache: cacheSlice.reducer,
  appbar: appbarSlice.reducer,
  session: sessionSlice.reducer,
  preview: previewSlice.reducer,
  highlightPreview: highlightPreviewSlice.reducer,
  auth: authSlice.reducer,
  settings: settingsSlice.reducer,
  popup: popupSlice.reducer,
  createRule: createRuleSlice.reducer,
  appearance: appearanceSlice.reducer,
});

export type TestRootState = ReturnType<typeof rootReducer>;

export function createTestStore(preloadedState?: Partial<TestRootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState: preloadedState as any,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
  });
}

export type TestStore = ReturnType<typeof createTestStore>;
