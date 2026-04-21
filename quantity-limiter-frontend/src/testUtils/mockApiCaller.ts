export interface MockMutationResult {
  unwrap: () => Promise<any>;
}

export interface MockMutationTriggerState {
  isLoading: boolean;
}

export type MockMutationTrigger = jest.Mock<MockMutationResult, [any]>;

export function makeMutationHook(
  trigger: MockMutationTrigger,
  state: MockMutationTriggerState = { isLoading: false },
) {
  return () => [trigger, state] as const;
}

export function makeQueryHook<T>(data: T, opts: { isLoading?: boolean } = {}) {
  return () => ({ data, isLoading: opts.isLoading ?? false, isFetching: false, isError: false });
}

export function makeLazyQueryHook(trigger: jest.Mock) {
  return () => [trigger, { isLoading: false, data: undefined, isFetching: false }] as const;
}

export const resolvingUnwrap = (payload: any = { data: { id: 'rule-1' } }): MockMutationResult => ({
  unwrap: () => Promise.resolve(payload),
});

export const rejectingUnwrap = (err: any = new Error('api error')): MockMutationResult => ({
  unwrap: () => Promise.reject(err),
});

export const pendingUnwrap = (): { result: MockMutationResult; resolve: (v?: any) => void; reject: (v?: any) => void } => {
  let resolve: (v?: any) => void = () => {};
  let reject: (v?: any) => void = () => {};
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { result: { unwrap: () => promise }, resolve, reject };
};
