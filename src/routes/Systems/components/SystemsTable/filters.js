import Workspace from './components/filters/Workspace';

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
  fetchItems: async () => {
    return;
  },
  modal: {
    title: 'All tags in Inventory',
    fetchItems: async () => {},
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

export default [displayName, statusFilter, dataCollector, rhcStatus];
