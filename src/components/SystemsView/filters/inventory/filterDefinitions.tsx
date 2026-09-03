import React from 'react';
import WorkspaceFilter from './components/WorkspaceFilter';
import LastSeenFilter from './components/LastSeenFilter';
import TagsFilter from './components/TagsFilter';
import OperatingSystemsFilter from './components/OperatingSystemsFilter';
import { useDataViewFiltersContext } from '../../DataViewFiltersContext';
import {
  LAST_SEEN_OPTIONS,
  SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM,
  type LastSeenKey,
} from '../../constants';
import { WORKLOAD_FILTER_OPTIONS } from '../../utils/workloadsFilter';
import { formatOperatingSystemChipLabel } from '../../utils/operatingSystemSelectOptions';
import {
  HostGroupChipNode,
  useWorkspaceDisplayNames,
} from '../../hooks/useWorkspaceDisplayNames';
import { DEBOUNCE_TIMEOUT_MS } from '../../../../constants';
import {
  isToolbarLabel,
  type CheckboxFilterSpec,
  type CustomFilterSpec,
  type FilterSpec,
  type TextFilterSpec,
} from '../types';

const WorkspaceChip = ({ id }: { id: string }) => {
  const { filters } = useDataViewFiltersContext();
  const { names, isFetching, ids, pendingLabelFetchIds } =
    useWorkspaceDisplayNames(filters.group_id);

  return (
    <HostGroupChipNode
      id={id}
      names={names}
      isFetching={isFetching}
      ids={ids}
      pendingLabelFetchIds={pendingLabelFetchIds}
    />
  );
};

export const hostnameSpec: TextFilterSpec = {
  type: 'text',
  filterId: 'hostname_or_id',
  title: 'Name',
  chipTitle: 'Display name',
  placeholder: 'Filter by name',
  debounceMs: DEBOUNCE_TIMEOUT_MS,
};

export const statusSpec: CheckboxFilterSpec = {
  type: 'checkbox',
  filterId: 'status',
  title: 'Status',
  placeholder: 'Filter by status',
  options: [
    { label: 'Fresh', value: 'fresh' },
    { label: 'Stale', value: 'stale' },
    { label: 'Stale warning', value: 'stale_warning' },
  ],
};

export const operatingSystemSpec: CustomFilterSpec<string[]> = {
  type: 'custom',
  filterId: 'operating_system',
  title: 'Operating system',
  placeholder: 'Filter by operating system',
  ouiaId: 'SystemsViewOperatingSystemsFilter',
  filterComponent: OperatingSystemsFilter,
  createLabel: (value, title) =>
    value?.map((item) => ({
      key: title,
      node: formatOperatingSystemChipLabel(item),
    })) ?? [],
  deleteLabel: (_category, label, value, onChange) => {
    const chipText = isToolbarLabel(label) ? String(label.node) : String(label);
    onChange?.(
      undefined,
      value?.filter(
        (item) => formatOperatingSystemChipLabel(item) !== chipText,
      ),
    );
  },
};

export const sourceSpec: CheckboxFilterSpec = {
  type: 'checkbox',
  filterId: 'source',
  title: 'Data collector',
  placeholder: 'Filter by data collector',
  options: [
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
  ],
};

export const rhcStatusSpec: CheckboxFilterSpec = {
  type: 'checkbox',
  filterId: 'rhcStatus',
  title: 'RHC status',
  placeholder: 'Filter by RHC status',
  options: [
    { label: 'Active', value: 'not_nil' },
    { label: 'Inactive', value: 'nil' },
  ],
};

export const systemTypeSpec: CheckboxFilterSpec = {
  type: 'checkbox',
  filterId: 'system_type',
  title: 'System type',
  placeholder: 'Filter by system type',
  options: [
    { label: 'Package-based system', value: 'conventional' },
    { label: 'Image-based system', value: 'image' },
  ],
};

export const workspaceSpec: CustomFilterSpec<string[]> = {
  type: 'custom',
  filterId: SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM,
  title: 'Workspace',
  placeholder: 'Filter by workspace',
  ouiaId: 'SystemsViewWorkspaceFilter',
  filterComponent: WorkspaceFilter,
  createLabel: (value) =>
    value?.map((item) => ({
      key: item,
      node: <WorkspaceChip id={item} />,
    })) ?? [],
  deleteLabel: (_category, label, value, onChange) =>
    onChange?.(
      undefined,
      value?.filter((item) => {
        if (isToolbarLabel(label)) {
          return item !== label.key;
        }
        return item !== label;
      }),
    ),
};

export const lastSeenSpec: CustomFilterSpec<LastSeenKey | ''> = {
  type: 'custom',
  filterId: 'last_seen',
  title: 'Last seen',
  placeholder: 'Filter by last seen',
  ouiaId: 'SystemsViewLastSeenFilter',
  filterComponent: LastSeenFilter,
  createLabel: (value, title) => {
    const opt = value
      ? LAST_SEEN_OPTIONS.find((option) => option.key === value)
      : undefined;
    return opt
      ? [
          {
            key: title,
            node: opt.label,
          },
        ]
      : [];
  },
  deleteLabel: (_category, _label, _value, onChange) => {
    onChange?.(undefined, '');
  },
};

export const tagsSpec: CustomFilterSpec<string[]> = {
  type: 'custom',
  filterId: 'tags',
  title: 'Tags',
  placeholder: 'Filter by tags',
  ouiaId: 'SystemsViewTagsFilter',
  isMultiGroup: true,
  filterComponent: TagsFilter,
  createLabel: (tags) => {
    if (tags === undefined) return [];
    const categoryMap: Record<string, string[]> = {};

    for (const tag of tags) {
      const [category, label] = tag.split('/');
      if (category) {
        if (categoryMap[category]) {
          categoryMap[category].push(label);
        } else {
          categoryMap[category] = [label];
        }
      }
    }

    return Object.entries(categoryMap).map(([category, labels]) => ({
      category,
      labels,
    }));
  },
  deleteLabel: (category, label, value, onChange) => {
    onChange?.(
      undefined,
      value?.filter((item) => item !== `${category}/${label}`),
    );
  },
};

export const workloadsSpec: CheckboxFilterSpec = {
  type: 'checkbox',
  filterId: 'workloads',
  title: 'Workload',
  placeholder: 'Filter by workload',
  options: [...WORKLOAD_FILTER_OPTIONS],
};

/** Current inventory toolbar, in display order. */
export const inventoryFilterSpecs: readonly FilterSpec[] = [
  hostnameSpec,
  statusSpec,
  operatingSystemSpec,
  sourceSpec,
  rhcStatusSpec,
  systemTypeSpec,
  workspaceSpec,
  lastSeenSpec,
  tagsSpec,
  workloadsSpec,
];
