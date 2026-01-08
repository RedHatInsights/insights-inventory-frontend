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
import { DataViewCustomFilter } from './DataViewCustomFilter';
import WorkspaceFilter from './WorkspaceFilter';
import LastSeenFilter, { LastSeenFilterItem } from './LastSeenFilter';
import { ToolbarLabel } from '@patternfly/react-core';
import LastSeenFilterExtension from './LastSeenFilterExtension';

export interface InventoryFilters {
  name: string;
  status: ApiHostGetHostListStalenessEnum[];
  dataCollector: ApiHostGetHostListRegisteredWithEnum[];
  rhcStatus: string[];
  systemType: string[];
  workspace: string[];
  lastSeen?: LastSeenFilterItem;
}
interface SystemsViewFiltersProps {
  filters: InventoryFilters;
  onSetFilters: (_: Partial<InventoryFilters>) => void;
}

export const isToolbarLabel = (
  label: string | ToolbarLabel,
): label is ToolbarLabel => typeof label === 'object' && 'key' in label;

export const SystemsViewFilters: React.FC<SystemsViewFiltersProps> = ({
  filters,
  onSetFilters,
}) => (
  <>
    <DataViewFilters
      onChange={(_, values) => {
        onSetFilters(values);
      }}
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
      <DataViewCustomFilter
        filterId="workspace"
        title="Workspace"
        placeholder="Filter by workspace"
        ouiaId="SystemsViewWorkspaceFilter"
        filterComponent={WorkspaceFilter}
        createLabels={(value, title) =>
          value?.map((item: string) => {
            return {
              key: title,
              node: item,
            };
          }) ?? []
        }
        deleteLabel={(label, value, onChange) =>
          onChange?.(
            undefined,
            value?.filter(
              (item) => item !== (isToolbarLabel(label) ? label.node : label),
            ),
          )
        }
      />
      <DataViewCustomFilter
        filterId="lastSeen"
        title="Last seen"
        placeholder="Filter by last seen"
        ouiaId="SystemsViewLastSeenFilter"
        filterComponent={LastSeenFilter}
        createLabels={(value, title) => {
          return value
            ? [
                {
                  key: title,
                  node: value?.label,
                },
              ]
            : [];
        }}
        deleteLabel={(_label, _value, onChange) => {
          onChange?.(undefined, undefined);
        }}
      />
    </DataViewFilters>
    <LastSeenFilterExtension
      value={filters?.lastSeen}
      onChange={(event, value) => {
        onSetFilters({ ...filters, lastSeen: value });
      }}
    />
  </>
);

export default SystemsViewFilters;
