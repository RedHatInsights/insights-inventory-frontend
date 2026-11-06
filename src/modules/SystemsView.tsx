import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import { SystemsView as SystemsViewImpl } from '../components/SystemsView/SystemsView';
import type { SystemsViewItem, SystemsViewProps } from './SystemsView.types';
import { useKesselMigrationFeatureFlag } from '../Utilities/hooks/useKesselMigrationFeatureFlag';
import { KESSEL_API_PATH } from '../constants';
import { useAllSystemsExportConfig } from '../services/exportService/useAllSystemsExportConfig';
import { resolveExportConfig } from '../services/exportService/resolveExportConfig';

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
  exportConfig,
}: SystemsViewProps<TItem, TFilterParams>) {
  const [internalQueryClient] = useState(
    () => queryClient ?? new QueryClient(),
  );
  const isKesselMigrationEnabled = useKesselMigrationFeatureFlag();
  // Legacy parity: a federated consumer may omit onExport from its export
  // config to export all systems through the inventory backend — the same
  // deal the Gen 1 InventoryTable offered via enableExport.
  const inventoryExport = useAllSystemsExportConfig<TItem>();

  if (
    process.env.NODE_ENV !== 'production' &&
    exportConfig &&
    ('onSelect' in exportConfig || 'extraItems' in exportConfig)
  ) {
    // The Gen 1 InventoryTable's exportConfig used onSelect/extraItems; this
    // contract uses onExport. Warn instead of silently substituting the
    // inventory all-systems export for a migrating (untyped JS) consumer.
    console.warn(
      'SystemsView exportConfig: the Gen 1 export config keys (onSelect, extraItems) are not supported — use onExport instead.',
    );
  }

  const systemsView = (
    <SystemsViewImpl
      queryKeyPrefix={queryKeyPrefix}
      fetchData={fetchData}
      columns={columns}
      filters={filters}
      bulkActions={bulkActions}
      rowActions={rowActions}
      showColumnManagement={false}
      exportConfig={
        exportConfig && resolveExportConfig(exportConfig, inventoryExport)
      }
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
