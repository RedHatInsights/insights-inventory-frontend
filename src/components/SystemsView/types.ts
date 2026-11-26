import type { ISortBy } from '@patternfly/react-table';
import type { Column } from './columns/types';

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

export type SettledColumn = Omit<Column, 'getValue' | 'renderCell'>;

/**
 * Optional callbacks in order to get notified about events
 */
export type SystemsViewEvents<TItem extends SystemsViewItem> = {
  /** Called when the user applies a column configuration. */
  onColumnsChange?: (columns: readonly Column<TItem>[]) => void;
  /** Called when the custom last-seen range changes. */
  onLastSeenCustomRangeChange?: (range: LastSeenCustomRange) => void;
  /**
   * Called once on mount, and again when the column configuration changes
   * (order, membership, or visibility). The argument is a copy of the
   * column data, without render functions.
   */
  onColumnsSettled?: (columns: readonly SettledColumn[]) => void;
  /**
   * Called once filters have hydrated on this mount, and again when the
   * debounced toolbar filters change. The argument is a read-only copy.
   */
  onFiltersSettled?: (filters: Readonly<SystemsViewFilterState>) => void;
};
