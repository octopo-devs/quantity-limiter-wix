// Test-only stub for @/redux/store. The real store module eagerly evaluates
// `configureStore(...)` (with redux-persist + RTK Query middleware) at import
// time — that work relies on `apiCaller.middleware`, which is jest.mock()ed
// out to a plain object in tests. Importing the real store from inside a test
// therefore crashes with "each middleware provided to configureStore must be
// a function".
//
// Tests wrap components with <Provider store={createTestStore()} />, so they
// only need the typed hooks from react-redux. We re-export untyped versions
// here; TypeScript `useAppSelector<RootState>` generics still compile via
// `isolatedModules: true` (ts-jest ignores the RootState mismatch because
// the stub's hooks are typed as `any`-compatible).
import type { TypedUseSelectorHook } from 'react-redux';
import { useDispatch, useSelector } from 'react-redux';
import type { TestRootState } from './createTestStore';

export type RootState = TestRootState;
export type AppDispatch = any;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Placeholder default export so `import store from '@/redux/store'` doesn't
// blow up in any code paths that still reference it. Real tests should use
// <Provider store={createTestStore()} /> instead.
const store: any = {};
export default store;
export const persistor: any = {};
