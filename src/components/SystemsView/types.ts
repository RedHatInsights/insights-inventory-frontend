import type { ISortBy } from '@patternfly/react-table';

export type SortDirection = ISortBy['direction'];

/**
 * Service a column or filter belongs to. Shared vocabulary: columns use it to
 * attribute a cell to its backend, filters to head their group in the
 * attribute dropdown.
 */
export type ConsumerAppName =
  | 'advisor'
  | 'compliance'
  | 'inventory'
  | 'malware'
  | 'content'
  | 'remediations'
  | 'vulnerability'
  | 'tag';

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

export type SystemsViewFetchData<
  TItem extends SystemsViewItem,
  TFilterParams = unknown,
> = (
  params: SystemsViewFetchParams<TFilterParams>,
) => Promise<SystemsViewQueryData<TItem>>;
