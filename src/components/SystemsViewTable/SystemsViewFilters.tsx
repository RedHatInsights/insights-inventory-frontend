import React from 'react';
import {
  DataViewCheckboxFilter,
  DataViewTextFilter,
} from '@patternfly/react-data-view';
import DataViewFilters from '@patternfly/react-data-view/dist/cjs/DataViewFilters';
import {
  ApiHostGetHostListRegisteredWithEnum,
  ApiHostGetHostListStalenessEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';

export interface InventoryFilters {
  name: string;
  status: ApiHostGetHostListStalenessEnum[];
  dataCollector: ApiHostGetHostListRegisteredWithEnum[];
  rhcStatus: string[];
  systemType: string[];
}
interface SystemsViewFiltersProps {
  filters: InventoryFilters;
  // eslint-disable-next-line no-unused-vars
  onSetFilters: (_: Partial<InventoryFilters>) => void;
}

export const SystemsViewFilters: React.FC<SystemsViewFiltersProps> = ({
  filters,
  onSetFilters,
}) => (
  <DataViewFilters
    onChange={(_, values) => onSetFilters(values)}
    values={filters}
  >
    <DataViewTextFilter
      filterId="name"
      title="Name"
      placeholder="Filter by name"
    />
    <DataViewCheckboxFilter
      filterId="status"
      title="Status"
      placeholder="Filter by status"
      options={[
        { label: 'Fresh', value: 'fresh' },
        { label: 'Stale', value: 'stale' },
        { label: 'Stale warning', value: 'stale_warning' },
      ]}
    />
    <DataViewCheckboxFilter
      filterId="dataCollector"
      title="Data Collector"
      placeholder="Filter by data collector"
      options={[
        {
          label: 'insights-client',
          value: 'puptoo',
        },
        {
          label: 'subscription-manager',
          value: 'rhsm-conduit',
        },
        { label: 'Satellite', value: 'satellite' },
        { label: 'Discovery', value: 'discovery' },
        { label: 'insights-client not connected', value: '!puptoo' },
      ]}
    />
    <DataViewCheckboxFilter
      filterId="rhcStatus"
      title="RHC status"
      placeholder="Filter by RHC status"
      options={[
        { label: 'Active', value: 'not_nil' },
        { label: 'Inactive', value: 'nil' },
      ]}
    />
    <DataViewCheckboxFilter
      filterId="systemType"
      title="System type"
      placeholder="Filter by system type"
      options={[
        { label: 'Package-based system', value: 'conventional' },
        { label: 'Image-based system', value: 'image' },
      ]}
    />
  </DataViewFilters>
);
