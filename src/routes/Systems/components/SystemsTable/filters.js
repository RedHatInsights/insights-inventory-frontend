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

export default [displayName, statusFilter];
