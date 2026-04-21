import React from 'react';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderCreateRule } from '@/testUtils/renderCreateRule';
import { NotificationTrigger, ProductSelectionType, RuleType } from '@/types/enum';

const mockCreateMutationTrigger = jest.fn();
const mockUpdateMutationTrigger = jest.fn();
const mockGetRuleByIdResult = { data: undefined as any, isLoading: false, isFetching: false, isError: false };
const mockGetAppearanceResult = { data: undefined as any, isLoading: false, isFetching: false, isError: false };
const mockLazyWixProducts = jest.fn(() => ({ unwrap: () => Promise.resolve({ products: [] }) }));
const mockLazyCollections = jest.fn(() => ({ unwrap: () => Promise.resolve({ data: [] }) }));
const mockToastShow = jest.fn();

jest.mock('@/redux/query', () => ({
  apiCaller: {
    useCreateRuleMutation: () => [mockCreateMutationTrigger, { isLoading: false }],
    useUpdateRuleMutation: () => [mockUpdateMutationTrigger, { isLoading: false }],
    useGetRuleByIdQuery: (_id: string, _opts: any) => mockGetRuleByIdResult,
    useGetAppearanceQuery: () => mockGetAppearanceResult,
    useLazyGetWixProductsQuery: () => [mockLazyWixProducts, { isLoading: false, data: undefined, isFetching: false }],
    useLazyGetCollectionsQuery: () => [mockLazyCollections, { isLoading: false, data: undefined, isFetching: false }],
  },
}));

jest.mock('@/hooks/useToast', () => ({
  __esModule: true,
  default: () => ({ show: mockToastShow }),
}));

jest.mock('@/components/Preview', () => ({
  __esModule: true,
  default: (props: any) => (
    <div data-testid="preview">{JSON.stringify({ rule: props.rule, formData: props.formData })}</div>
  ),
}));

jest.mock('@/components/SelectWixProductModal', () => ({
  __esModule: true,
  default: ({ isOpen, onSelect, onClose }: any) =>
    isOpen ? (
      <div data-testid="mock-modal">
        <button
          type="button"
          data-testid="mock-modal-confirm"
          onClick={() => {
            const picks = (window as any).__MOCK_PICK__ ?? [];
            onSelect(picks);
            onClose();
          }}
        >
          Confirm
        </button>
        <button type="button" data-testid="mock-modal-cancel" onClick={() => onClose()}>
          Cancel
        </button>
      </div>
    ) : null,
}));

beforeEach(() => {
  mockCreateMutationTrigger.mockReset();
  mockUpdateMutationTrigger.mockReset();
  mockLazyWixProducts.mockReset();
  mockLazyCollections.mockReset();
  mockToastShow.mockReset();
  mockGetRuleByIdResult.data = undefined;
  mockGetRuleByIdResult.isLoading = false;
  mockGetAppearanceResult.data = undefined;
  mockLazyWixProducts.mockImplementation(() => ({ unwrap: () => Promise.resolve({ products: [] }) }));
  mockLazyCollections.mockImplementation(() => ({ unwrap: () => Promise.resolve({ data: [] }) }));
  (window as any).__MOCK_PICK__ = [];
});

async function chooseProductType() {
  const productCard = await screen.findByText(/Product limit/i);
  await userEvent.click(productCard);
}

async function selectDropdown(labelMatcher: RegExp | string, optionMatcher: RegExp | string) {
  const field = screen.getByText(labelMatcher).closest('div, label');
  const trigger = within(field as HTMLElement).getByRole('button');
  await userEvent.click(trigger);
  const option = await screen.findByRole('menuitem', { name: optionMatcher });
  await userEvent.click(option);
}

describe('TC-002 Product Limit Detail — EDGE', () => {
  it('TC-002-E06: creates and reloads rule with minQty=0 / maxQty=0', async () => {
    // Case A — create with 0/0
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    const { unmount } = renderCreateRule();
    await chooseProductType();

    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC_E06 Zero Quantity');

    const minInput = screen.getByLabelText('Min Quantity') as HTMLInputElement;
    await userEvent.clear(minInput);
    await userEvent.type(minInput, '0');
    const maxInput = screen.getByLabelText('Max Quantity') as HTMLInputElement;
    await userEvent.clear(maxInput);
    await userEvent.type(maxInput, '0');

    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalledTimes(1));
    expect(mockCreateMutationTrigger).toHaveBeenCalledWith(
      expect.objectContaining({ minQty: 0, maxQty: 0, name: 'AC_E06 Zero Quantity' }),
    );

    unmount();

    // Case B — edit a rule with 0/0 shows "0" / "0" on reload (fails without the ?? fix)
    mockGetRuleByIdResult.data = {
      data: {
        id: 'rule-1',
        name: 'AC_E06 Zero Quantity',
        type: RuleType.PRODUCT,
        isActive: true,
        minQty: 0,
        maxQty: 0,
        notifyAboutLimitWhen: NotificationTrigger.LIMIT_REACHED,
        showContactUsInNotification: false,
        minQtyLimitMessage: '',
        maxQtyLimitMessage: '',
        contactUsButtonText: '',
        contactUsMessage: '',
        ruleProduct: { conditionType: ProductSelectionType.ALL_PRODUCTS, productIds: [], groupProducts: [] },
      },
    };

    renderCreateRule({ initialEntry: '/rules/edit/rule-1' });

    await waitFor(() => {
      const minEdit = screen.getByLabelText('Min Quantity') as HTMLInputElement;
      const maxEdit = screen.getByLabelText('Max Quantity') as HTMLInputElement;
      expect(minEdit.value).toBe('0');
      expect(maxEdit.value).toBe('0');
    });
  });
});
