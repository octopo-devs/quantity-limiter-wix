jest.mock('@/redux/query', () => ({
  apiCaller: {
    useCreateRuleMutation: () => [jest.fn(), { isLoading: false }],
    useUpdateRuleMutation: () => [jest.fn(), { isLoading: false }],
    useGetRuleByIdQuery: () => ({ data: undefined, isLoading: false, isFetching: false, isError: false }),
    useGetAppearanceQuery: () => ({ data: undefined, isLoading: false, isFetching: false, isError: false }),
    useLazyGetWixProductsQuery: () => [jest.fn(), { isLoading: false, data: undefined, isFetching: false }],
    useLazyGetCollectionsQuery: () => [jest.fn(), { isLoading: false, data: undefined, isFetching: false }],
  },
}));

jest.mock('@/hooks/useToast', () => ({
  __esModule: true,
  default: () => ({ show: jest.fn() }),
}));

jest.mock('@/components/Preview', () => ({
  __esModule: true,
  default: () => <div data-testid="preview" />,
}));

jest.mock('@/components/SelectWixProductModal', () => ({
  __esModule: true,
  default: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div data-testid="mock-modal" /> : null),
}));

import { renderCreateRule } from './renderCreateRule';

describe('renderCreateRule smoke', () => {
  it('renders without crashing', () => {
    const { getByText } = renderCreateRule();
    expect(getByText('Create new limit')).toBeInTheDocument();
  });
});
