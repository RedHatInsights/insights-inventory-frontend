import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import {
  SystemsView as SystemsViewImpl,
  type SystemsViewFetchData,
} from '../components/SystemsView/SystemsView';
import type { ColumnSelector } from '../components/SystemsView/columns/resolveColumnSelector';
import type { FilterSelector } from '../components/SystemsView/filters/resolveFilterSelector';
import type { SystemsViewItem } from '../components/SystemsView/types';
import { useKesselMigrationFeatureFlag } from '../Utilities/hooks/useKesselMigrationFeatureFlag';
import { KESSEL_API_PATH } from '../constants';

export type { SystemsViewFetchData } from '../components/SystemsView/SystemsView';
export type {
  SystemsViewFetchParams,
  SystemsViewFilterState,
  SystemsViewItem,
  SystemsViewQueryData,
} from '../components/SystemsView/types';
export type { ColumnSelector };
export type { FilterSelector };
export type { FilterCatalog } from '../components/SystemsView/filters/catalog';
export { filterCatalog } from '../components/SystemsView/filters/catalog';
export { bindFilter as custom } from '../components/SystemsView/filters/bindFilter';
export type {
  BoundFilter,
  FilterBinding,
  FilterSpec,
} from '../components/SystemsView/filters/types';
export type { InventoryFilters } from '../components/SystemsView/filters/SystemsViewFilters';

/**
 * Public federated contract. Some internal props are not exposed.
 *
 * `queryClient` is optional. Pass the host client to share cache (and
 * `invalidateQueries`). Omit it for an isolated cache owned by this module.
 * Does not fall back to an ambient `QueryClientProvider`.
 * `baseQuery` is optional. Pass an object to share query params. It defaults to `{}`.
 */
export type SystemsViewProps<
  TItem extends SystemsViewItem,
  TQuery = unknown,
> = {
  queryClient?: QueryClient;
  queryKeyPrefix: string;
  fetchData: SystemsViewFetchData<TItem, TQuery>;
  columns: ColumnSelector<TItem>;
  /**
   * Selects which filters to show and how they map onto `TQuery`.
   */
  filters: FilterSelector<TQuery>;
  /**
   * Starting query for the `updateQuery` fold. Bindings only add filter fields.
   * Defaults to `{}`.
   */
  baseQuery?: TQuery;
};

function SystemsView<TItem extends SystemsViewItem, TQuery = unknown>({
  queryClient,
  queryKeyPrefix,
  fetchData,
  columns,
  filters,
  baseQuery,
}: SystemsViewProps<TItem, TQuery>) {
  const [internalQueryClient] = useState(
    () => queryClient ?? new QueryClient(),
  );
  const isKesselMigrationEnabled = useKesselMigrationFeatureFlag();

  const systemsView = (
    <SystemsViewImpl
      queryKeyPrefix={queryKeyPrefix}
      fetchData={fetchData}
      columns={columns}
      filters={filters}
      baseQuery={baseQuery}
    />
  );

  return (
    <QueryClientProvider client={queryClient ?? internalQueryClient}>
      <AccessCheck.Provider
        baseUrl={typeof window !== 'undefined' ? window.location.origin : ''}
        apiPath={KESSEL_API_PATH}
      >
        {isKesselMigrationEnabled ? (
          systemsView
        ) : (
          <RBACProvider appName="inventory" checkResourceDefinitions>
            {systemsView}
          </RBACProvider>
        )}
      </AccessCheck.Provider>
    </QueryClientProvider>
  );
}

export default SystemsView;
