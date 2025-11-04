import { fetchTags, getOsSelectOptions } from './filtersHelpers';
import { getOperatingSystems } from '../../../../api';

export const displayName = {
  type: 'text',
  label: 'Name',
  filterSerialiser: (_config, [value]) => ({
    hostnameOrId: value,
  }),
};

export const systemType = {
  label: 'System type',
  value: 'not_nil',
  type: 'checkbox',
  items: [
    { label: 'Package-based system', value: 'conventional' },
    { label: 'Image-based system', value: 'image' },
  ],
  filterSerialiser: (_config, values) => {
    const newValues = values
      .map((val) => (val === 'image' ? ['bootc', 'edge'] : val))
      .flat();
    return { systemType: newValues };
  },
};

export const operatingSystem = {
  label: 'Operating system',
  value: 'operating-system-filter',
  type: 'group',
  groups: async () => {
    try {
      const { results: osResults } = await getOperatingSystems({}, true);
      const osData = osResults.map((result) => result.value);

      return [
        ...getOsSelectOptions('CentOS Linux', osData),
        ...getOsSelectOptions('RHEL', osData),
      ];
    } catch {
      return [];
    }
  },
  filterSerialiser: (_config, values) => {
    const osFilters = Object.entries(values).map(([osName, versions]) => ({
      [osName]: { version: { eq: Object.keys(versions) } },
    }));

    return {
      filter: {
        system_profile: {
          operating_system: osFilters.reduce(
            (acc, obj) => ({ ...acc, ...obj }),
            {},
          ),
        },
      },
    };
  },
};

export const status = {
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

export const dataCollector = {
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

export const rhcStatus = {
  label: 'RHC status',
  type: 'checkbox',
  items: [
    { label: 'Active', value: 'not_nil' },
    { label: 'Inactive', value: 'nil' },
  ],
  filterSerialiser: (_config, values) => {
    return {
      filter: {
        system_profile: {
          rhc_client_id: values,
        },
      },
    };
  },
};

export const tags = {
  label: 'Tags',
  type: 'group',
  groups: async () => {
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
      [],
    );

    return filterGroups;
  },
  modal: {
    title: 'All tags in Inventory',
    groups: async () => {
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
  filterSerialiser: (_config, values) => {
    const tagsGroupedByNamespace = Object.entries(values).map(
      ([namespace, tagValues]) => {
        return [namespace, Object.keys(tagValues)];
      },
    );

    const tags = tagsGroupedByNamespace
      .map(([namespace, values]) => {
        return values.map((value) => `${namespace}/${value}`);
      })
      .flat();

    return { tags };
  },
};

export const lastSeen = {
  label: 'Last seen',
  value: 'last_seen',
  type: 'lastSeen',
  filterSerialiser: (_config, value) => {
    return { lastCheckInStart: value?.start, lastCheckInEnd: value?.end };
  },
};

export const workspace = {
  label: 'Workspace',
  type: 'workspace',
  filterSerialiser: (_config, values) => {
    return { groupName: values };
  },
};

/**
 *
 * Default set of filters to show when no set of filters or customisation is provided
 *
 */
export default [
  displayName,
  systemType,
  operatingSystem,
  dataCollector,
  rhcStatus,
  tags,
  lastSeen,
  workspace,
];
