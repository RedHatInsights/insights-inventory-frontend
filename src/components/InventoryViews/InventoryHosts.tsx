import React, { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { InventoryBindableItem } from '../SystemsView/columns/inventory/columnDefinitions';
import SystemsView from '../SystemsView/SystemsView';
import { Actions } from './actions';
import { fetchHosts, HOSTS_QUERY_KEY } from './hostsQueryOptions';
import { useAnsibleWorkloadsSearchParam } from './hooks/useAnsibleWorkloadsSearchParam';
import { selectLegacyInventoryColumns } from './selectLegacyInventoryColumns';
import { selectLegacyInventoryFilters } from './selectLegacyInventoryFilters';
import { selectAnsibleWorkload } from './stampAnsibleWorkloadDefault';
import { VIEW_ID_URL_PARAM } from '../../api/inventoryViewsApi';

const InventoryHosts = () => {
  const { isReady, isAnsibleBundle } = useAnsibleWorkloadsSearchParam();
  const [searchParams, setSearchParams] = useSearchParams();
  const filtersSelector = useMemo(
    () =>
      isAnsibleBundle
        ? selectAnsibleWorkload(selectLegacyInventoryFilters)
        : selectLegacyInventoryFilters,
    [isAnsibleBundle],
  );

  // The stable table doesn't use view_id. Drop it whenever it shows up so a
  // leftover param from the preview (InventoryViews) view doesn't linger in the
  // URL after toggling preview off.
  useEffect(() => {
    if (searchParams.has(VIEW_ID_URL_PARAM)) {
      const next = new URLSearchParams(searchParams);
      next.delete(VIEW_ID_URL_PARAM);
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  if (!isReady) {
    return null;
  }

  return (
    <Actions<InventoryBindableItem>>
      {({ bulkActions, rowActions }) => (
        <SystemsView
          columns={selectLegacyInventoryColumns}
          filters={filtersSelector}
          queryKeyPrefix={HOSTS_QUERY_KEY}
          fetchData={fetchHosts}
          bulkActions={bulkActions}
          rowActions={rowActions}
        />
      )}
    </Actions>
  );
};

export default InventoryHosts;
