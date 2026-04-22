import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import ProductRuleSetup from './index';
import { createTestStore } from '@/testUtils/createTestStore';
import { Conjunction, ProductSelectionType } from '@/types/enum';

jest.mock('@/components/SelectWixProductModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="mock-modal" /> : null),
}));

function renderWithStore(ui: React.ReactElement) {
  const store = createTestStore();
  return render(<Provider store={store}>{ui}</Provider>);
}

describe('ProductRuleSetup', () => {
  it('renders only the Product Selection Type dropdown when ALL_PRODUCTS', () => {
    renderWithStore(
      <ProductRuleSetup
        ruleProduct={{ conditionType: ProductSelectionType.ALL_PRODUCTS, productIds: [], groupProducts: [] }}
        onFieldChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/Product Selection Type/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Browse/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/^Conjunction$/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Add Condition/i })).not.toBeInTheDocument();
  });

  it('renders Products list and Browse button when SPECIFIC_PRODUCTS', () => {
    renderWithStore(
      <ProductRuleSetup
        ruleProduct={{ conditionType: ProductSelectionType.SPECIFIC_PRODUCTS, productIds: [], groupProducts: [] }}
        onFieldChange={jest.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: /Browse/i })).toBeInTheDocument();
    expect(screen.queryByText(/^Conjunction$/)).not.toBeInTheDocument();
  });

  it('renders Conjunction + Conditions builder when GROUP_OF_PRODUCTS; Products field absent', () => {
    renderWithStore(
      <ProductRuleSetup
        ruleProduct={{
          conditionType: ProductSelectionType.GROUP_OF_PRODUCTS,
          productIds: [],
          groupProducts: [],
          conjunction: Conjunction.AND,
        }}
        onFieldChange={jest.fn()}
      />,
    );
    expect(screen.getByText(/^Conjunction$/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Condition/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Browse/i })).not.toBeInTheDocument();
  });

  it('does NOT render Sell Product in Multiples when SHOW_MULTIPLES_FEATURE=false', () => {
    renderWithStore(
      <ProductRuleSetup
        ruleProduct={{ conditionType: ProductSelectionType.ALL_PRODUCTS, productIds: [], groupProducts: [] }}
        onFieldChange={jest.fn()}
      />,
    );
    expect(screen.queryByText(/Sell Product in Multiples/i)).not.toBeInTheDocument();
  });
});
