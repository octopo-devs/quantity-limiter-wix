import type { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, RenderOptions } from '@testing-library/react';
import CreateRule from '@/pages/Rules/components/CreateRule';
import { createTestStore, TestStore, TestRootState } from './createTestStore';

interface RenderCreateRuleOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntry?: string;
  preloadedState?: Partial<TestRootState>;
  store?: TestStore;
}

export function renderCreateRule(options: RenderCreateRuleOptions = {}) {
  const { initialEntry = '/rules/create', preloadedState, store = createTestStore(preloadedState), ...rest } = options;

  const ui: ReactElement = (
    <Provider store={store}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route path="/rules/create" element={<CreateRule />} />
          <Route path="/rules/edit/:id" element={<CreateRule />} />
          <Route path="/rules" element={<div data-testid="rules-list-page" />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );

  const utils = render(ui, rest);
  return { store, ...utils };
}
