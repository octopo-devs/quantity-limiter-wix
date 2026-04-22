import React from 'react';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderCreateRule } from '@/testUtils/renderCreateRule';
import {
  NotificationTrigger,
  ProductSelectionType,
  RuleGroupProductConditionOperator,
  RuleGroupProductConditionType,
  RuleType,
} from '@/types/enum';

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

function findFormFieldRoot(labelMatcher: RegExp | string): HTMLElement {
  const label = screen.getByText(labelMatcher);
  const field = label.closest('[class*="FormField__root"]') as HTMLElement | null;
  if (!field) throw new Error(`FormField root not found for label: ${labelMatcher}`);
  return field;
}

async function selectDropdown(labelMatcher: RegExp | string, optionMatcher: RegExp | string) {
  const field = findFormFieldRoot(labelMatcher);
  const combobox = field.querySelector('[role="combobox"]') as HTMLElement;
  if (!combobox) throw new Error(`Combobox not found for label: ${labelMatcher}`);
  await userEvent.click(combobox);
  const option = await screen.findByText(optionMatcher);
  await userEvent.click(option);
}

async function selectNotificationTrigger(optionText: RegExp) {
  await selectDropdown(/^Notify About Limit When$/, optionText);
}

async function switchProductSelection(optionText: RegExp) {
  await selectDropdown(/^Product Selection Type$/, optionText);
}

async function openBrowseAndConfirm(
  picks: Array<{ productId: string; variantId?: string; name: string; variantTitle?: string; image?: string }>,
) {
  (window as any).__MOCK_PICK__ = picks;
  await userEvent.click(screen.getByRole('button', { name: /Browse/i }));
  await userEvent.click(screen.getByTestId('mock-modal-confirm'));
}

function getToggleCheckbox(labelText: string): HTMLElement {
  const field = findFormFieldRoot(labelText);
  const input = field.querySelector('input[type="checkbox"]');
  if (!input) throw new Error(`Toggle not found for label: ${labelText}`);
  return input as HTMLElement;
}

function getBackButton(): HTMLElement {
  const btn = document.querySelector('[data-hook="page-header-backbutton"]');
  if (!btn) throw new Error('Back button not found');
  return btn as HTMLElement;
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

describe('TC-002 Product Limit Detail — HAPPY', () => {
  it('TC-002-H01: creates All Products rule with defaults', async () => {
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    const { store } = renderCreateRule();
    await chooseProductType();

    // Product Selection Type default = All Products — no products list, no group builder
    expect(screen.queryByText(/Browse/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Conjunction/i)).not.toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC01 All Products');
    await userEvent.type(
      screen.getByPlaceholderText(/Enter message for min quantity limit/i),
      'Minimum quantity required',
    );
    await userEvent.type(
      screen.getByPlaceholderText(/Enter message for max quantity limit/i),
      'Maximum quantity allowed',
    );

    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalledTimes(1));
    const payload = mockCreateMutationTrigger.mock.calls[0][0];
    expect(payload).toMatchObject({
      name: 'AC01 All Products',
      type: RuleType.PRODUCT,
      isActive: true,
      minQty: 1,
      maxQty: 10,
      notifyAboutLimitWhen: NotificationTrigger.LIMIT_REACHED,
      minQtyLimitMessage: 'Minimum quantity required',
      maxQtyLimitMessage: 'Maximum quantity allowed',
    });

    await waitFor(() => expect(mockToastShow).toHaveBeenCalledWith('Rule created successfully', false));
    await waitFor(() => expect(screen.getByTestId('rules-list-page')).toBeInTheDocument());

    // store.createRule should be reset after successful save+navigate
    expect(store.getState().createRule.name).toBeFalsy();
  }, 20000);

  it('TC-002-H06: notification trigger = Add to cart button clicked', async () => {
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    renderCreateRule();
    await chooseProductType();
    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC06 ATC');
    await selectNotificationTrigger(/Add to cart button clicked/i);

    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalled());
    expect(mockCreateMutationTrigger).toHaveBeenCalledWith(
      expect.objectContaining({ notifyAboutLimitWhen: NotificationTrigger.ADD_TO_CART_BUTTON_CLICKED }),
    );
  }, 20000);

  it('TC-002-H07: notification trigger = No notification', async () => {
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    renderCreateRule();
    await chooseProductType();
    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC07 No Notify');
    await selectNotificationTrigger(/No notification/i);

    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalled());
    expect(mockCreateMutationTrigger).toHaveBeenCalledWith(
      expect.objectContaining({ notifyAboutLimitWhen: NotificationTrigger.NO_NOTIFICATION }),
    );
  }, 20000);

  it('TC-002-H09: template variables in messages saved verbatim', async () => {
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    renderCreateRule();
    await chooseProductType();

    const minInput = screen.getByLabelText('Min Quantity') as HTMLInputElement;
    await userEvent.clear(minInput);
    await userEvent.type(minInput, '2');
    const maxInput = screen.getByLabelText('Max Quantity') as HTMLInputElement;
    await userEvent.clear(maxInput);
    await userEvent.type(maxInput, '5');

    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC09 Template Vars');
    fireEvent.change(screen.getByPlaceholderText(/Enter message for min quantity limit/i), {
      target: { value: 'Buy at least {{min_quantity}} units' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Enter message for max quantity limit/i), {
      target: { value: 'Maximum {{max_quantity}} per order' },
    });

    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalled());
    expect(mockCreateMutationTrigger).toHaveBeenCalledWith(
      expect.objectContaining({
        minQtyLimitMessage: 'Buy at least {{min_quantity}} units',
        maxQtyLimitMessage: 'Maximum {{max_quantity}} per order',
      }),
    );
  }, 20000);

  it('TC-002-H10: Active=OFF saves with isActive=false', async () => {
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    renderCreateRule();
    await chooseProductType();

    const activeToggle = getToggleCheckbox('Active');
    await userEvent.click(activeToggle);

    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC10 Inactive');
    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalled());
    expect(mockCreateMutationTrigger).toHaveBeenCalledWith(expect.objectContaining({ isActive: false }));
  }, 20000);

  it('TC-002-H11: Cancel discards and navigates to /rules', async () => {
    const { store } = renderCreateRule();
    await chooseProductType();
    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'Draft');

    await userEvent.click(screen.getByRole('button', { name: /^Cancel$/i }));

    await waitFor(() => expect(screen.getByTestId('rules-list-page')).toBeInTheDocument());
    expect(mockCreateMutationTrigger).not.toHaveBeenCalled();
    expect(mockToastShow).not.toHaveBeenCalled();
    expect(store.getState().createRule.name).toBeFalsy();
  }, 20000);

  it('TC-002-H12: back arrow behaves same as Cancel', async () => {
    const { store } = renderCreateRule();
    await chooseProductType();
    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'Draft');

    await userEvent.click(getBackButton());

    await waitFor(() => expect(screen.getByTestId('rules-list-page')).toBeInTheDocument());
    expect(mockCreateMutationTrigger).not.toHaveBeenCalled();
    expect(mockToastShow).not.toHaveBeenCalled();
    expect(store.getState().createRule.name).toBeFalsy();
  }, 20000);

  it('TC-002-H04: edits existing PRODUCT rule — Step 1 locked, Step 2 prefilled, saves updated maxQty', async () => {
    mockUpdateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-42' } }) });
    mockGetRuleByIdResult.data = {
      data: {
        id: 'rule-42',
        name: 'Existing Rule',
        type: RuleType.PRODUCT,
        isActive: true,
        minQty: 2,
        maxQty: 5,
        notifyAboutLimitWhen: NotificationTrigger.LIMIT_REACHED,
        showContactUsInNotification: false,
        minQtyLimitMessage: '',
        maxQtyLimitMessage: '',
        contactUsButtonText: '',
        contactUsMessage: '',
        ruleProduct: {
          conditionType: ProductSelectionType.SPECIFIC_PRODUCTS,
          productIds: [{ productId: 'p1' }, { productId: 'p2' }],
          groupProducts: [],
        },
      },
    };
    mockLazyWixProducts.mockImplementation(() => ({
      unwrap: () =>
        Promise.resolve({
          products: [
            { id: 'p1', name: 'Product One', media: {}, variants: [] },
            { id: 'p2', name: 'Product Two', media: {}, variants: [] },
          ],
        }),
    }));

    renderCreateRule({ initialEntry: '/rules/edit/rule-42' });

    expect(await screen.findByRole('heading', { name: /Edit limit/i })).toBeInTheDocument();

    await waitFor(() =>
      expect((screen.getByPlaceholderText(/Enter rule name/i) as HTMLInputElement).value).toBe('Existing Rule'),
    );
    const minInput = screen.getByLabelText('Min Quantity') as HTMLInputElement;
    const maxInput = screen.getByLabelText('Max Quantity') as HTMLInputElement;
    expect(minInput.value).toBe('2');
    expect(maxInput.value).toBe('5');

    // Step 1 header is present but body collapsed: Step 1 content only shows its
    // description text ("Limit quantity for ... rules") when expanded.
    await waitFor(() =>
      expect(screen.queryByText(/Limit quantity for product rules/i)).not.toBeInTheDocument(),
    );

    // Click Step 1 header — must NOT expand (type locked, drives code fix #2)
    const step1Header = screen.getByText(/Select target/i);
    await userEvent.click(step1Header);
    // Wait a tick, then verify Step 1 remains collapsed
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.queryByText(/Limit quantity for product rules/i)).not.toBeInTheDocument();

    await userEvent.clear(maxInput);
    await userEvent.type(maxInput, '7');
    await userEvent.click(screen.getByRole('button', { name: /^Save$/i }));

    await waitFor(() => expect(mockUpdateMutationTrigger).toHaveBeenCalled());
    expect(mockUpdateMutationTrigger).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'rule-42', maxQty: 7 }),
    );
    await waitFor(() => expect(mockToastShow).toHaveBeenCalledWith('Rule updated successfully', false));
  }, 30000);

  it('TC-002-H03: creates Group of Products rule with AND + 2 conditions', async () => {
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    renderCreateRule();
    await chooseProductType();
    await switchProductSelection(/^Group of Products$/);

    expect(screen.queryByRole('button', { name: /Browse/i })).not.toBeInTheDocument();
    expect(screen.getByText(/^Conjunction$/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Condition/i })).toBeInTheDocument();

    // Add condition #1 (defaults to Tag/Equals, value empty)
    await userEvent.click(screen.getByRole('button', { name: /Add Condition/i }));
    const firstValueInput = screen.getAllByPlaceholderText(/Enter value/i)[0] as HTMLInputElement;
    await userEvent.type(firstValueInput, 'sale');

    // Add condition #2
    await userEvent.click(screen.getByRole('button', { name: /Add Condition/i }));

    // Change row #2 type dropdown to "Name" (enum TITLE)
    const tagCombos = document.querySelectorAll('input[role="combobox"][value="Tag"]');
    expect(tagCombos.length).toBeGreaterThanOrEqual(2);
    await userEvent.click(tagCombos[1] as HTMLElement);
    await userEvent.click(await screen.findByText(/^Name$/));

    // Change row #2 operator dropdown to "Contains"
    const equalsCombos = document.querySelectorAll('input[role="combobox"][value="Equals"]');
    expect(equalsCombos.length).toBeGreaterThanOrEqual(2);
    await userEvent.click(equalsCombos[1] as HTMLElement);
    await userEvent.click(await screen.findByText(/^Contains$/));

    const valueInputs = screen.getAllByPlaceholderText(/Enter value/i) as HTMLInputElement[];
    await userEvent.type(valueInputs[1], 'T-Shirt');

    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC03 Group AND');
    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalled());
    const payload = mockCreateMutationTrigger.mock.calls[0][0];
    expect(payload.ruleProduct.conditionType).toBe(ProductSelectionType.GROUP_OF_PRODUCTS);
    expect(payload.ruleProduct.conjunction).toBe('AND');
    expect(payload.ruleProduct.groupProducts).toHaveLength(2);
    expect(payload.ruleProduct.groupProducts[0]).toMatchObject({
      type: RuleGroupProductConditionType.TAG,
      operator: RuleGroupProductConditionOperator.EQUALS,
      value: 'sale',
    });
    expect(payload.ruleProduct.groupProducts[1]).toMatchObject({
      type: RuleGroupProductConditionType.TITLE,
      operator: RuleGroupProductConditionOperator.CONTAINS,
      value: 'T-Shirt',
    });
  }, 30000);

  it('TC-002-H02: creates Specific Products rule, removes one product', async () => {
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    renderCreateRule();
    await chooseProductType();
    await switchProductSelection(/^Specific Products$/);

    await openBrowseAndConfirm([
      { productId: 'p1', name: 'Plain Product' },
      { productId: 'p2', variantId: 'v1', name: 'Variant Product', variantTitle: 'Size: M, Color: Red' },
    ]);

    expect(screen.getByText('Plain Product')).toBeInTheDocument();
    expect(screen.getByText('Variant Product')).toBeInTheDocument();
    expect(screen.getByText('Size: M, Color: Red')).toBeInTheDocument();

    // Find delete icon button within the plain product row (a horizontal Box)
    let row: HTMLElement | null = screen.getByText('Plain Product');
    while (row && row.getAttribute('class')?.indexOf('direction-10-horizontal') === -1) {
      row = row.parentElement;
    }
    const deleteBtn = row?.querySelector('button') as HTMLElement;
    await userEvent.click(deleteBtn);

    expect(screen.queryByText('Plain Product')).not.toBeInTheDocument();
    expect(screen.getByText('Variant Product')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC02 Specific');
    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalled());
    expect(mockCreateMutationTrigger).toHaveBeenCalledWith(
      expect.objectContaining({
        ruleProduct: expect.objectContaining({
          conditionType: ProductSelectionType.SPECIFIC_PRODUCTS,
          productIds: [{ productId: 'p2', variantId: 'v1' }],
        }),
      }),
    );
  }, 30000);

});

describe('TC-002 Product Limit Detail — EDGE — Specific/Variant', () => {
  it('TC-002-E02: 50 products at cap saves successfully', async () => {
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    renderCreateRule();
    await chooseProductType();
    await switchProductSelection(/^Specific Products$/);

    const picks = Array.from({ length: 50 }, (_, i) => ({ productId: `p${i}`, name: `Product ${i}` }));
    await openBrowseAndConfirm(picks);

    expect(screen.getAllByText(/^Product \d+$/).length).toBe(50);

    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC_E02 Cap 50');
    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalled());
    const payload = mockCreateMutationTrigger.mock.calls[0][0];
    expect(payload.ruleProduct.productIds).toHaveLength(50);
  }, 30000);

  it('TC-002-E03: 20 conditions at cap saves successfully', async () => {
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    renderCreateRule();
    await chooseProductType();
    await switchProductSelection(/^Group of Products$/);

    for (let i = 0; i < 20; i++) {
      await userEvent.click(screen.getByRole('button', { name: /Add Condition/i }));
    }
    const valueInputs = screen.getAllByPlaceholderText(/Enter value/i) as HTMLInputElement[];
    expect(valueInputs).toHaveLength(20);
    for (let i = 0; i < 20; i++) {
      fireEvent.change(valueInputs[i], { target: { value: `val${i}` } });
    }

    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC_E03 Cap 20 Conditions');
    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalled());
    const payload = mockCreateMutationTrigger.mock.calls[0][0];
    expect(payload.ruleProduct.groupProducts).toHaveLength(20);
  }, 60000);

  it('TC-002-E07: variant-only pick shows variant title and saves variant ID', async () => {
    mockCreateMutationTrigger.mockReturnValue({ unwrap: () => Promise.resolve({ data: { id: 'rule-1' } }) });

    renderCreateRule();
    await chooseProductType();
    await switchProductSelection(/^Specific Products$/);

    await openBrowseAndConfirm([
      { productId: 'pX', variantId: 'vSM', name: 'Shirt', variantTitle: 'Size: M, Color: Red' },
    ]);

    expect(screen.getByText('Shirt')).toBeInTheDocument();
    expect(screen.getByText('Size: M, Color: Red')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC_E07 Variant Only');
    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() => expect(mockCreateMutationTrigger).toHaveBeenCalled());
    expect(mockCreateMutationTrigger).toHaveBeenCalledWith(
      expect.objectContaining({
        ruleProduct: expect.objectContaining({
          productIds: [{ productId: 'pX', variantId: 'vSM' }],
        }),
      }),
    );
  }, 20000);
});

describe('TC-002 Product Limit Detail — ERROR', () => {
  it('TC-002-R05: update API failure shows toast, stays on page', async () => {
    mockUpdateMutationTrigger.mockReturnValue({ unwrap: () => Promise.reject(new Error('500')) });
    mockGetRuleByIdResult.data = {
      data: {
        id: 'rule-77',
        name: 'Existing',
        type: RuleType.PRODUCT,
        isActive: true,
        minQty: 1,
        maxQty: 5,
        notifyAboutLimitWhen: NotificationTrigger.LIMIT_REACHED,
        showContactUsInNotification: false,
        minQtyLimitMessage: '',
        maxQtyLimitMessage: '',
        contactUsButtonText: '',
        contactUsMessage: '',
        ruleProduct: { conditionType: ProductSelectionType.ALL_PRODUCTS, productIds: [], groupProducts: [] },
      },
    };

    renderCreateRule({ initialEntry: '/rules/edit/rule-77' });

    const maxInput = (await screen.findByLabelText('Max Quantity')) as HTMLInputElement;
    await waitFor(() => expect(maxInput.value).toBe('5'));
    await userEvent.clear(maxInput);
    await userEvent.type(maxInput, '8');

    await userEvent.click(screen.getByRole('button', { name: /^Save$/i }));

    await waitFor(() => expect(mockToastShow).toHaveBeenCalledWith('Failed to update rule', true));
    expect(screen.queryByTestId('rules-list-page')).not.toBeInTheDocument();
  }, 20000);

  it('TC-002-R03: Specific Products with zero products shows toast, blocks submit', async () => {
    renderCreateRule();
    await chooseProductType();
    await switchProductSelection(/^Specific Products$/);

    await userEvent.type(screen.getByPlaceholderText(/Enter rule name/i), 'AC_R03 Empty Specific');
    await userEvent.click(screen.getByRole('button', { name: /Create Limit/i }));

    await waitFor(() =>
      expect(mockToastShow).toHaveBeenCalledWith('Please select at least one product', true),
    );
    expect(mockCreateMutationTrigger).not.toHaveBeenCalled();
    expect(screen.queryByTestId('rules-list-page')).not.toBeInTheDocument();
  }, 20000);
});
