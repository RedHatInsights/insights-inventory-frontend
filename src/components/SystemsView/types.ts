import type { ISortBy } from '@patternfly/react-table';

export type SortDirection = ISortBy['direction'];

export type LastSeenCustomRange = {
  start?: string;
  end?: string;
} | null;

/** Toolbar filters keys match FilterSpec `filterId`. */
export type SystemsViewFilterState = Record<string, unknown>;

export type PaginationParams = {
  page: number;
  perPage: number;
};

export type SortingParams = {
  sortBy: string | undefined;
  direction: SortDirection | undefined;
};

export type ToQueryParams<TQueryParams> = (
  state: PaginationParams & SortingParams,
) => Partial<TQueryParams>;

export type SystemsViewItem = {
  id: string;
};

export type SystemsViewQueryData<TItem extends SystemsViewItem> = {
  results: TItem[];
  total: number;
  deniedServices?: string[];
};

export type SystemsViewFetchData<
  TItem extends SystemsViewItem,
  TQueryParams = unknown,
> = (params: TQueryParams) => Promise<SystemsViewQueryData<TItem>>;
