import { useWorkspaceGroupsInfiniteQuery } from '../../../filters/useWorkspaceGroupsInfiniteQuery';

export { useWorkspaceGroupsInfiniteQuery };

export function makePage(results, { page = 1, perPage = 50, total } = {}) {
  const resolvedTotal = total ?? results.length;
  return {
    results,
    page,
    per_page: perPage,
    total: resolvedTotal,
  };
}

export function mockGroupsInfiniteQuery(overrides = {}) {
  const fetchNextPage = jest.fn().mockResolvedValue(undefined);
  const {
    pages = [makePage([{ id: 'w1', name: 'Workspace 1', host_count: 3 }])],
    isPending = false,
    isFetching = false,
    hasNextPage = false,
    ...rest
  } = overrides;

  useWorkspaceGroupsInfiniteQuery.mockReturnValue({
    data: isPending
      ? undefined
      : { pages, pageParams: pages.map((_, i) => i + 1) },
    fetchNextPage,
    hasNextPage,
    isFetching,
    isPending,
    ...rest,
  });

  return { fetchNextPage };
}
