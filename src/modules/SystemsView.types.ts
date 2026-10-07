/**
 * Public SystemsView type contract. Types only — no default component,
 * and no `filterCatalog` / `bindFilter` values (Scalprum will not give
 * those to consumers).
 */
import type { QueryClient } from '@tanstack/react-query';
import type {
  SystemsViewFetchData,
  SystemsViewItem,
  ToQueryParams,
} from '../components/SystemsView/types';
import type { ColumnSelector } from '../components/SystemsView/columns/resolveColumnSelector';
import type { FilterSelector } from '../components/SystemsView/filters/resolveFilterSelector';
import type {
  BulkAction,
  RowAction,
} from '../components/SystemsView/actions/types';

export type {
  PaginationParams,
  SortingParams,
  SystemsViewFetchData,
  SystemsViewFilterState,
  SystemsViewItem,
  SystemsViewQueryData,
  ToQueryParams,
} from '../components/SystemsView/types';

export type { ColumnSelector } from '../components/SystemsView/columns/resolveColumnSelector';
export type { ColumnCatalog } from '../components/SystemsView/columns/catalog';
export type {
  Column,
  ColumnBinding,
  ColumnSpec,
  ConsumerAppName,
} from '../components/SystemsView/columns/types';
export type { DisplayNameValue } from '../components/SystemsView/columns/inventory/cells/DisplayName';
export type { WorkspaceValue } from '../components/SystemsView/columns/inventory/cells/Workspace';
export type { TagsValue } from '../components/SystemsView/columns/inventory/cells/Tags';
export type { OperatingSystemValue } from '../components/SystemsView/columns/inventory/cells/OperatingSystem';
export type { LastSeenValue } from '../components/SystemsView/columns/inventory/cells/LastSeen';
export type { StatusTimestamps } from '../components/SystemsView/columns/inventory/cells/Status';
export type { CreatedValue } from '../components/SystemsView/columns/inventory/cells/Created';

export type { FilterSelector } from '../components/SystemsView/filters/resolveFilterSelector';
export type { FilterCatalog } from '../components/SystemsView/filters/catalog';
export type {
  BoundFilter,
  FilterBinding,
  FilterSpec,
  LastSeenSelectValue,
} from '../components/SystemsView/filters/types';

export type {
  ActionHelpers,
  ActionSeparator,
  ActionSpec,
  BulkAction,
  RowAction,
} from '../components/SystemsView/actions/types';

/**
 * Public federated contract. Internal-only props are not exposed.
 */
export type SystemsViewProps<
  TItem extends SystemsViewItem,
  TQueryParams = unknown,
> = {
  /**
   * Host `QueryClient` to share cache and `invalidateQueries`.
   * Omit to use an isolated client owned by this module.
   * Does not fall back to an ambient `QueryClientProvider`.
   */
  queryClient?: QueryClient;
  /**
   * Stable query-key prefix (e.g. `'hosts'`). Used to key fetches
   * and to invalidate after mutations.
   */
  queryKeyPrefix: string;
  /**
   * Loads table rows. Receives the view's query params.
   */
  fetchData: SystemsViewFetchData<TItem, TQueryParams>;
  /**
   * Selects columns from the shared catalog. Use a stable reference,
   * not an inline function.
   */
  columns: ColumnSelector<TItem>;
  /**
   * Selects filters from the shared catalog and maps them onto `TQueryParams`.
   * Use a stable reference, not an inline function.
   */
  filters: FilterSelector<TQueryParams>;
  /**
   * Maps pagination and sort onto `TQueryParams`.
   * Use a stable reference, not an inline function.
   */
  toQueryParams: ToQueryParams<TQueryParams>;
  /**
   * Toolbar bulk actions. Use a stable reference, not an inline array.
   */
  bulkActions?: readonly BulkAction<TItem>[];
  /**
   * Per-row kebab actions. Use a stable reference, not an inline array.
   */
  rowActions?: readonly RowAction<TItem>[];
};
