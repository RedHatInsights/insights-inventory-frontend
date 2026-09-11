import type { ISortBy } from '@patternfly/react-table';

export type SortDirection = ISortBy['direction'];

export type LastSeenCustomRange = {
  start?: string;
  end?: string;
} | null;

/** Toolbar filters keys match FilterSpec `filterId`. */
export type SystemsViewFilterState = Record<string, unknown>;

export type SystemsViewFetchParams<TFilterParams = unknown> = {
  page: number;
  perPage: number;
  sortBy: string | undefined;
  direction: SortDirection | undefined;
  filterParams: TFilterParams;
};

export type SystemsViewItem = {
  id: string;
};

export type SystemsViewQueryData<TItem extends SystemsViewItem> = {
  results: TItem[];
  total: number;
  deniedServices?: string[];
};
