/**
 * A deep-linked view that is not on the loaded views page has to resolve
 * before the table mounts. Otherwise the table starts on the fallback columns,
 * and a later merge keeps that visibility instead of the saved view's.
 * A refetch of a view that is already loaded must not unmount the table.
 */
export const shouldWaitForFetchedView = ({
  shouldFetch,
  isLoading,
  isError,
}: {
  shouldFetch: boolean;
  isLoading: boolean;
  isError: boolean;
}): boolean => shouldFetch && isLoading && !isError;
