import type { ISortBy } from '@patternfly/react-table';

export type SortDirection = ISortBy['direction'];

export type LastSeenCustomRange = {
  start?: string;
  end?: string;
} | null;

export type SystemsViewFetchParams<
  TFilters extends Record<string, unknown> = Record<string, unknown>,
> = {
  page: number;
  perPage: number;
  sortBy: string | undefined;
  direction: SortDirection | undefined;
  filters: TFilters;
  lastSeenCustomRange: LastSeenCustomRange;
};
