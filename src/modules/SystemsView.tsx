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

/**
 * Public federated contract. Internal-only props are not exposed.
 */
export type SystemsViewProps<
  TItem extends SystemsViewItem,
  TFilterParams = unknown,
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
   * Loads table rows. Receives pagination, sort, and folded `TFilterParams`.
   */
  fetchData: SystemsViewFetchData<TItem, TFilterParams>;
  /**
   * Selects columns from the shared catalog. Use a stable reference,
   * not an inline function.
   */
  columns: ColumnSelector<TItem>;
  /**
   * Selects filters from the shared catalog and maps them onto `TFilterParams`.
   * Use a stable reference, not an inline function.
   */
  filters: FilterSelector<TFilterParams>;
};

function SystemsView<TItem extends SystemsViewItem, TFilterParams = unknown>({
  queryClient,
  queryKeyPrefix,
  fetchData,
  columns,
  filters,
}: SystemsViewProps<TItem, TFilterParams>) {
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
