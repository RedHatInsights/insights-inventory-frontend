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
import LastSeenFilter, { LastSeenFilterItem } from './LastSeenFilter';
import TagsFilter from './TagsFilter';
import OperatingSystemsFilter from './OperatingSystemsFilter';
import { ToolbarLabel } from '@patternfly/react-core';
import LastSeenFilterExtension from './LastSeenFilterExtension';
import useFeatureFlag from '../../../Utilities/useFeatureFlag';
import { useDataViewFiltersContext } from '../DataViewFiltersContext';
import { INITIAL_PAGE } from '../../InventoryViews/constants';
import type { Pagination } from '../SystemsView';

export interface InventoryFilters {
  hostname_or_id: string;
  status: ApiHostGetHostListStalenessEnum[];
  source: ApiHostGetHostListRegisteredWithEnum[];
  rhcStatus: string[];
  system_type: string[];
  workspace: string[];
  tags: string[];
  /** Selected OS minors as `${osName}:${major.minor}` (e.g. `RHEL:9.0`) */
  operating_system: string[];
  last_seen?: LastSeenFilterItem;
}

export const isToolbarLabel = (
  label: string | ToolbarLabel,
): label is ToolbarLabel => typeof label === 'object' && 'key' in label;

interface SystemsViewFiltersProps {
  pagination: Pagination;
}

export const SystemsViewFilters = ({ pagination }: SystemsViewFiltersProps) => {
  const { filters, onSetFilters } = useDataViewFiltersContext();
  const isHideRHCFilterFlagEnabled = useFeatureFlag('hbi.ui.hide_rhc_filter');

  return (
    <>
      {/* DataViewFilters is passing filter values to children implicitly */}
      <DataViewFilters
        onChange={(_, values) => {
          onSetFilters(values);
          pagination.onSetPage(undefined, INITIAL_PAGE);
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
              node: item.replace(':', ' '),
            })) ?? []
          }
          deleteLabel={(_category, label, value, onChange) => {
            const chipText = isToolbarLabel(label)
              ? String(label.node)
              : String(label);
            onChange?.(
              undefined,
              value?.filter((item) => item.replace(':', ' ') !== chipText),
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
          filterId="workspace"
          title="Workspace"
          placeholder="Filter by workspace"
          ouiaId="SystemsViewWorkspaceFilter"
          filterComponent={WorkspaceFilter}
          createLabel={(value, title) =>
            value?.map((item: string) => {
              return {
                key: title,
                node: item,
              };
            }) ?? []
          }
          deleteLabel={(_category, label, value, onChange) =>
            onChange?.(
              undefined,
              value?.filter(
                (item) => item !== (isToolbarLabel(label) ? label.node : label),
              ),
            )
          }
        />
        <DataViewCustomFilter
          filterId="last_seen"
          title="Last seen"
          placeholder="Filter by last seen"
          ouiaId="SystemsViewLastSeenFilter"
          filterComponent={LastSeenFilter}
          createLabel={(value, title) => {
            return value
              ? [
                  {
                    key: title,
                    node: value?.label,
                  },
                ]
              : [];
          }}
          deleteLabel={(_category, _label, _value, onChange) => {
            onChange?.(undefined, undefined);
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
      </DataViewFilters>
      <LastSeenFilterExtension
        value={filters?.last_seen}
        onChange={(event, value) => {
          onSetFilters({ ...filters, last_seen: value });
        }}
      />
    </>
  );
};

export default SystemsViewFilters;
