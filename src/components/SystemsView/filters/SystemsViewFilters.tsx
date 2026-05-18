import React from 'react';
import { DataViewCheckboxFilter } from '@patternfly/react-data-view';
import DataViewFilters from '@patternfly/react-data-view/dist/cjs/DataViewFilters';
import {
  ApiHostGetHostListRegisteredWithEnum,
  ApiHostGetHostListStalenessEnum,
} from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { DataViewCustomFilter } from './DataViewCustomFilter';
import WorkspaceFilter from './WorkspaceFilter';
import DataViewTextFilterWithChipTitle from './DataViewTextFilterWithChipTitle';
import LastSeenFilter from './LastSeenFilter';
import TagsFilter from './TagsFilter';
import OperatingSystemsFilter from './OperatingSystemsFilter';
import { ToolbarLabel } from '@patternfly/react-core';
import LastSeenFilterExtension from './LastSeenFilterExtension';
import useFeatureFlag from '../../../Utilities/useFeatureFlag';
import { useDataViewFiltersContext } from '../DataViewFiltersContext';
import {
  LAST_SEEN_OPTIONS,
  SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM,
  type LastSeenKey,
} from '../constants';
import { WORKLOAD_FILTER_OPTIONS } from '../utils/workloadsFilter';
import { formatOperatingSystemChipLabel } from '../utils/operatingSystemSelectOptions';
import {
  HostGroupChipNode,
  useWorkspaceDisplayNames,
} from '../hooks/useWorkspaceDisplayNames';

export interface InventoryFilters {
  hostname_or_id: string;
  status: ApiHostGetHostListStalenessEnum[];
  source: ApiHostGetHostListRegisteredWithEnum[];
  rhcStatus: string[];
  system_type: string[];
  group_id: string[];
  tags: string[];
  operating_system: string[];
  workloads: string[];
  last_seen: LastSeenKey | '';
}

export const isToolbarLabel = (
  label: string | ToolbarLabel,
): label is ToolbarLabel => typeof label === 'object' && 'key' in label;

export const SystemsViewFilters = () => {
  const { filters, onSetFilters } = useDataViewFiltersContext();
  const { names, isFetching, ids, pendingLabelFetchIds } =
    useWorkspaceDisplayNames(filters.group_id);
  const isHideRHCFilterFlagEnabled = useFeatureFlag('hbi.ui.hide_rhc_filter');

  return (
    <>
      {/* DataViewFilters is passing filter values to children implicitly */}
      <DataViewFilters
        onChange={(_, values) => {
          onSetFilters(values);
        }}
        values={filters}
      >
        <DataViewTextFilterWithChipTitle
          filterId="hostname_or_id"
          title="Name"
          chipTitle="Display name"
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
        <DataViewCustomFilter
          filterId="operating_system"
          title="Operating system"
          placeholder="Filter by operating system"
          ouiaId="SystemsViewOperatingSystemsFilter"
          filterComponent={OperatingSystemsFilter}
          createLabel={(value, title) =>
            value?.map((item: string) => ({
              key: title,
              node: formatOperatingSystemChipLabel(item),
            })) ?? []
          }
          deleteLabel={(_category, label, value, onChange) => {
            const chipText = isToolbarLabel(label)
              ? String(label.node)
              : String(label);
            onChange?.(
              undefined,
              value?.filter(
                (item) => formatOperatingSystemChipLabel(item) !== chipText,
              ),
            );
          }}
        />
        <DataViewCheckboxFilter
          filterId="source"
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
        {!isHideRHCFilterFlagEnabled && (
          <DataViewCheckboxFilter
            filterId="rhcStatus"
            title="RHC status"
            placeholder="Filter by RHC status"
            options={[
              { label: 'Active', value: 'not_nil' },
              { label: 'Inactive', value: 'nil' },
            ]}
          />
        )}
        <DataViewCheckboxFilter
          filterId="system_type"
          title="System type"
          placeholder="Filter by system type"
          options={[
            { label: 'Package-based system', value: 'conventional' },
            { label: 'Image-based system', value: 'image' },
          ]}
        />
        <DataViewCustomFilter
          filterId={SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM}
          title="Workspace"
          placeholder="Filter by workspace"
          ouiaId="SystemsViewWorkspaceFilter"
          filterComponent={WorkspaceFilter}
          createLabel={(value, title) =>
            value?.map((item: string) => ({
              key: item,
              node: (
                <HostGroupChipNode
                  id={item}
                  names={names}
                  isFetching={isFetching}
                  ids={ids}
                  pendingLabelFetchIds={pendingLabelFetchIds}
                />
              ),
            })) ?? []
          }
          deleteLabel={(_category, label, value, onChange) =>
            onChange?.(
              undefined,
              value?.filter((item) => {
                if (isToolbarLabel(label)) {
                  return item !== label.key;
                }
                return item !== label;
              }),
            )
          }
        />
        <DataViewCustomFilter<LastSeenKey | ''>
          filterId="last_seen"
          title="Last seen"
          placeholder="Filter by last seen"
          ouiaId="SystemsViewLastSeenFilter"
          filterComponent={LastSeenFilter}
          createLabel={(value, title) => {
            const opt = value
              ? LAST_SEEN_OPTIONS.find((o) => o.key === value)
              : undefined;
            return opt
              ? [
                  {
                    key: title,
                    node: opt.label,
                  },
                ]
              : [];
          }}
          deleteLabel={(_category, _label, _value, onChange) => {
            onChange?.(undefined, '');
          }}
        />
        <DataViewCustomFilter
          filterId="tags"
          title="Tags"
          placeholder="Filter by tags"
          ouiaId="SystemsViewTagsFilter"
          filterComponent={TagsFilter}
          onChange={(_, values) => {
            onSetFilters({ ...filters, tags: values });
          }}
          createLabel={(tags) => {
            if (tags === undefined) return [];
            const categoryMap: Record<string, string[]> = {};

            for (let tag of tags) {
              const [category, label] = tag.split('/');
              if (category) {
                if (categoryMap[category]) {
                  categoryMap[category].push(label);
                } else {
                  categoryMap[category] = [label];
                }
              }
            }

            const result = Object.entries(categoryMap).map(
              ([category, labels]) => ({
                category,
                labels,
              }),
            );

            return result;
          }}
          deleteLabel={(category, label, value, onChange) => {
            const labelStr = isToolbarLabel(label) ? String(label.node) : label;
            onChange?.(
              undefined,
              value?.filter((item) => item !== `${category}/${label}`),
            );
          }}
          isMultiGroup={true}
        />
        <DataViewCheckboxFilter
          filterId="workloads"
          title="Workload"
          placeholder="Filter by workload"
          options={[...WORKLOAD_FILTER_OPTIONS]}
        />
      </DataViewFilters>
      <LastSeenFilterExtension />
    </>
  );
};

export default SystemsViewFilters;
