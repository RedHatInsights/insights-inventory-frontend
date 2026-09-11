import type { ISortBy } from '@patternfly/react-table';

export type SortDirection = ISortBy['direction'];

export type LastSeenCustomRange = {
  start?: string;
  end?: string;
} | null;

/** Toolbar UI bag. Keys match each filter's `filterId`. */
export type SystemsViewFilterState = Record<string, unknown>;

/** Table state passed into `fetchData`. See {@tutorial systems_view_fetch_data}. */
export type SystemsViewFetchParams<TFilterParams = unknown> = {
  page: number;
  perPage: number;
  sortBy: string | undefined;
  direction: SortDirection | undefined;
  /** Folded backend query from the `filters` selector. */
  filterParams: TFilterParams;
};

/** Minimum row shape SystemsView can render. */
export type SystemsViewItem = {
  id: string;
};

/** Page of rows `fetchData` must return. */
export type SystemsViewQueryData<TItem extends SystemsViewItem> = {
  results: TItem[];
  total: number;
  /** App names whose columns are permission-locked when Views RBAC is on. */
  deniedServices?: string[];
};
