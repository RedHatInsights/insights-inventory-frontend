import { shouldWaitForFetchedView } from './shouldWaitForFetchedView';

describe('shouldWaitForFetchedView', () => {
  it('waits while a deep-linked view is still loading', () => {
    expect(
      shouldWaitForFetchedView({
        shouldFetch: true,
        isLoading: true,
        isError: false,
      }),
    ).toBe(true);
  });

  it('does not wait for a view already on the loaded page', () => {
    expect(
      shouldWaitForFetchedView({
        shouldFetch: false,
        isLoading: true,
        isError: false,
      }),
    ).toBe(false);
  });

  it('does not wait after the view has loaded or the fetch failed', () => {
    expect(
      shouldWaitForFetchedView({
        shouldFetch: true,
        isLoading: false,
        isError: false,
      }),
    ).toBe(false);
    expect(
      shouldWaitForFetchedView({
        shouldFetch: true,
        isLoading: false,
        isError: true,
      }),
    ).toBe(false);
  });
});
