import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import { SystemsView as SystemsViewImpl } from '../components/SystemsView/SystemsView';
import type { SystemsViewItem, SystemsViewProps } from './SystemsView.types';
import { useKesselMigrationFeatureFlag } from '../Utilities/hooks/useKesselMigrationFeatureFlag';
import { KESSEL_API_PATH } from '../constants';

export type {
  ActionHelpers,
  ActionSpec,
  BoundFilter,
  BulkAction,
  ColumnSelector,
  FilterBinding,
  FilterCatalog,
  FilterSelector,
  FilterSpec,
  RowAction,
  SystemsViewFetchData,
  SystemsViewFetchParams,
  SystemsViewFilterState,
  SystemsViewItem,
  SystemsViewProps,
  SystemsViewQueryData,
} from './SystemsView.types';
export { filterCatalog } from '../components/SystemsView/filters/catalog';
export { bindFilter as custom } from '../components/SystemsView/filters/bindFilter';

function SystemsView<TItem extends SystemsViewItem, TFilterParams = unknown>({
  queryClient,
  queryKeyPrefix,
  fetchData,
  columns,
  filters,
  bulkActions,
  rowActions,
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
      bulkActions={bulkActions}
      rowActions={rowActions}
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
