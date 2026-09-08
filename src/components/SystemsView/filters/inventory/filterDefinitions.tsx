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
  type LastSeenSelectValue,
  type TextFilterSpec,
} from '../types';

const WorkspaceChip = ({ id }: { id: string }) => {
  const { filters } = useDataViewFiltersContext();
  const groupId = filters[SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM];
  const { names, isFetching, ids, pendingLabelFetchIds } =
    useWorkspaceDisplayNames(
      Array.isArray(groupId) ? (groupId as string[]) : undefined,
    );

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

export const hostnameSpec = {
  type: 'text',
  filterId: 'hostname_or_id' as const,
  title: 'Name',
  defaultValue: '',
  chipTitle: 'Display name',
  placeholder: 'Filter by name',
  debounceMs: DEBOUNCE_TIMEOUT_MS,
} satisfies TextFilterSpec;

export const statusSpec = {
  type: 'checkbox',
  filterId: 'status' as const,
  title: 'Status',
  defaultValue: [],
  placeholder: 'Filter by status',
  options: [
    { label: 'Fresh', value: 'fresh' },
    { label: 'Stale', value: 'stale' },
    { label: 'Stale warning', value: 'stale_warning' },
  ],
} satisfies CheckboxFilterSpec;

export const operatingSystemSpec = {
  type: 'custom',
  filterId: 'operating_system' as const,
  title: 'Operating system',
  defaultValue: [],
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
} satisfies CustomFilterSpec<string[]>;

export const sourceSpec = {
  type: 'checkbox',
  filterId: 'source' as const,
  title: 'Data collector',
  defaultValue: [],
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
} satisfies CheckboxFilterSpec;

export const rhcStatusSpec = {
  type: 'checkbox',
  filterId: 'rhcStatus' as const,
  title: 'RHC status',
  defaultValue: [],
  placeholder: 'Filter by RHC status',
  options: [
    { label: 'Active', value: 'not_nil' },
    { label: 'Inactive', value: 'nil' },
  ],
} satisfies CheckboxFilterSpec;

export const systemTypeSpec = {
  type: 'checkbox',
  filterId: 'system_type' as const,
  title: 'System type',
  defaultValue: [],
  placeholder: 'Filter by system type',
  options: [
    { label: 'Package-based system', value: 'conventional' },
    { label: 'Image-based system', value: 'image' },
  ],
} satisfies CheckboxFilterSpec;

export const workspaceSpec = {
  type: 'custom',
  filterId: SYSTEMS_VIEW_WORKSPACE_FILTER_PARAM,
  title: 'Workspace',
  defaultValue: [],
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
} satisfies CustomFilterSpec<string[]>;

export const lastSeenSpec = {
  type: 'custom',
  filterId: 'last_seen' as const,
  title: 'Last seen',
  defaultValue: '',
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
  getValue: (filters, ctx): LastSeenSelectValue => ({
    key:
      typeof filters.last_seen === 'string'
        ? (filters.last_seen as LastSeenKey | '')
        : '',
    range: ctx.lastSeenCustomRange,
  }),
} satisfies CustomFilterSpec<LastSeenKey | ''>;

export const tagsSpec = {
  type: 'custom',
  filterId: 'tags' as const,
  title: 'Tags',
  defaultValue: [],
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
} satisfies CustomFilterSpec<string[]>;

export const workloadsSpec = {
  type: 'checkbox',
  filterId: 'workloads' as const,
  title: 'Workload',
  defaultValue: [],
  placeholder: 'Filter by workload',
  options: [...WORKLOAD_FILTER_OPTIONS],
} satisfies CheckboxFilterSpec;

/** Current inventory toolbar, in display order. `filterId as const` keeps keys inferable. */
export const inventoryFilterSpecs = [
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
] as const satisfies readonly FilterSpec[];
