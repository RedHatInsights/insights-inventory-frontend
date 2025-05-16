import Workspace from './components/filters/Workspace';
import { fetchTags } from '../../helpers';

export const CUSTOM_FILTER_TYPES = {
  workspace: {
    Component: Workspace,
    chips: (value) => [value],
    selectValue: (value) => [value, true],
    deselectValue: () => [undefined, true],
  },
};

const displayName = {
  type: 'text',
  label: 'Name',
  filterSerialiser: (_config, [value]) => ({
    hostnameOrId: value,
    displayName: value,
  }),
};

const statusFilter = {
  label: 'Status',
  type: 'checkbox',
  items: [
    { label: 'Fresh', value: 'fresh' },
    { label: 'Stale', value: 'stale' },
    { label: 'Stale warning', value: 'stale_warning' },
  ],
  filterSerialiser: (_config, values) => ({
    staleness: values,
  }),
};

const dataCollector = {
  label: 'Data collector',
  type: 'checkbox',
  items: [
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
  filterSerialiser: (_config, values) => ({
    registeredWith: values,
  }),
};

const rhcStatus = {
  label: 'RHC status',
  type: 'checkbox',
  items: [
    { label: 'Active', value: 'not_nil' },
    { label: 'Inactive', value: 'nil' },
  ],
};

const tags = {
  label: 'Tags',
  type: 'group',
  groups: async (...args) => {
    const { results: tags } = await fetchTags();
    const tagsInGroups = tags.reduce((groups, { tag }) => {
      return {
        ...groups,
        [tag.namespace]: [...(groups[tag.namespace] || []), tag],
      };
    }, {});
    const filterGroups = Object.entries(tagsInGroups).reduce(
      (filter, [group, tags]) => {
        return [
          ...filter,
          {
            label: group,
            value: group,
            items: tags.map(({ key, value }) => ({
              label: `${key}=${value}`,
              value: `${key}=${value}`,
            })),
          },
        ];
      },
      []
    );

    return filterGroups;
  },
  modal: {
    title: 'All tags in Inventory',
    groups: async (...args) => {
      const tags = await fetchTags();

      return tags;
    },
    table: {
      columns: [
        {
          key: 'name',
          sortable: 'display_name',
          title: 'Name',
        },
      ],
    },
  },
};

export default [displayName, statusFilter, tags, dataCollector, rhcStatus];
