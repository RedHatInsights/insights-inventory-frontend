import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RBACProvider } from '@redhat-cloud-services/frontend-components/RBACProvider';
import { AccessCheck } from '@project-kessel/react-kessel-access-check';
import {
  SystemsView as SystemsViewImpl,
  type SystemsViewFetchData,
} from '../components/SystemsView/SystemsView';
import type { ColumnSelector } from '../components/SystemsView/columns/resolveColumnSelector';
import type { SystemsViewItem } from '../components/SystemsView/types';
import { useKesselMigrationFeatureFlag } from '../Utilities/hooks/useKesselMigrationFeatureFlag';
import { KESSEL_API_PATH } from '../constants';

export type { SystemsViewFetchData } from '../components/SystemsView/SystemsView';
export type {
  SystemsViewFetchParams,
  SystemsViewItem,
  SystemsViewQueryData,
} from '../components/SystemsView/types';
export type { ColumnSelector } from '../components/SystemsView/columns/resolveColumnSelector';
export type { InventoryFilters } from '../components/SystemsView/filters/SystemsViewFilters';

/**
 * Public federated contract. Some internal props are not exposed.
 *
 * `queryClient` is optional. Pass the host client to share cache (and
 * `invalidateQueries`). Omit it for an isolated cache owned by this module.
 * Does not fall back to an ambient `QueryClientProvider`.
 */
export type SystemsViewProps<TItem extends SystemsViewItem> = {
  queryClient?: QueryClient;
  queryKeyPrefix: string;
  fetchData: SystemsViewFetchData<TItem>;
  columns: ColumnSelector<TItem>;
};

function SystemsView<TItem extends SystemsViewItem>({
  queryClient,
  queryKeyPrefix,
  fetchData,
  columns,
}: SystemsViewProps<TItem>) {
  const [internalQueryClient] = useState(
    () => queryClient ?? new QueryClient(),
  );
  const isKesselMigrationEnabled = useKesselMigrationFeatureFlag();

  const systemsView = (
    <SystemsViewImpl
      queryKeyPrefix={queryKeyPrefix}
      fetchData={fetchData}
      columns={columns}
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
