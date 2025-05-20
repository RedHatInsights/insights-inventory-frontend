import { createContext } from 'react';

export const TEXT_FILTER = 'hostname_or_id';
export const TEXTUAL_CHIP = 'textual';
export const TAG_CHIP = 'tags';
export const STALE_CHIP = 'staleness';
export const REGISTERED_CHIP = 'registered_with';
export const OS_CHIP = 'operating_system';
export const RHCD_FILTER_KEY = 'rhc_client_id';
export const UPDATE_METHOD_KEY = 'system_update_method';
export const SYSTEM_TYPE_KEY = 'system_type';
export const LAST_SEEN_CHIP = 'last_seen';
export const HOST_GROUP_CHIP = 'group_name'; // use the same naming as for the back end parameter
//REPORTERS
export const REPORTER_PUPTOO = 'puptoo';
export const REPORTER_RHSM_CONDUIT = 'rhsm-conduit';
export const REPORTER_RHSM_PROFILE_BRIDGE = 'rhsm-system-profile-bridge';
//APP NAMES
export const APP_NAME_VULNERABILITY = 'vulnerabilities';
export const APP_NAME_ADVISOR = 'advisor';
export const APP_NAME_PATCH = 'patch';

export const INVENTORY_TOTAL_FETCH_URL_SERVER = '/api/inventory/v1/hosts';
export const INVENTORY_TOTAL_FETCH_EDGE_PARAMS =
  '?filter[system_profile][host_type]=edge&page=1&per_page=1';
export const INVENTORY_TOTAL_FETCH_CONVENTIONAL_PARAMS = '?page=1&per_page=1';
export const INVENTORY_FETCH_BOOTC_PARAMS =
  '?filter[system_profile][bootc_status][booted][image_digest][is]';
export const INVENTORY_FETCH_BOOTC = `${INVENTORY_FETCH_BOOTC_PARAMS}=not_nil`;
export const INVENTORY_FETCH_NON_BOOTC = `${INVENTORY_FETCH_BOOTC_PARAMS}=nil`;
export const INVENTORY_TOTAL_FETCH_BOOTC_PARAMS = `${INVENTORY_FETCH_BOOTC}&per_page=1`;
export const INVENTORY_FILTER_NO_HOST_TYPE =
  'filter[system_profile][host_type]=nil';
export function subtractDate(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

export const staleness = [
  { label: 'Fresh', value: 'fresh' },
  { label: 'Stale', value: 'stale' },
  { label: 'Stale warning', value: 'stale_warning' },
];

export const currentDate = new Date().toISOString();
export const lastSeenFilterItems = [
  {
    value: 'last24',
    label: 'Within the last 24 hours',
  },
  {
    value: '24more',
    label: 'More than 1 day ago',
  },
  {
    value: '7more',
    label: 'More than 7 days ago',
  },
  {
    value: '15more',
    label: 'More than 15 days ago',
  },
  {
    value: '30more',
    label: 'More than 30 days ago',
  },
  {
    value: 'custom',
    label: 'Custom',
  },
];
export const lastSeenDefaults = {
  last24: {
    updatedStart: subtractDate(1),
    updatedEnd: currentDate,
  },
  '24more': {
    updatedEnd: subtractDate(1),
  },
  '7more': {
    updatedEnd: subtractDate(7),
  },
  '15more': {
    updatedEnd: subtractDate(15),
  },
  '30more': {
    updatedEnd: subtractDate(30),
  },
  custom: {},
};
export const registered = [
  {
    label: 'insights-client',
    value: 'puptoo',
    idName: 'Insights Client ID',
    idValue: 'insights_id',
  },
  {
    label: 'subscription-manager',
    value: 'rhsm-conduit',
    idName: 'Subscription Manager ID',
    idValue: 'subscription_manager_id',
  },
  { label: 'Satellite', value: 'satellite' },
  { label: 'Discovery', value: 'discovery' },
  { label: 'insights-client not connected', value: '!puptoo' },
];
export const InventoryContext = createContext({});

export const rhcdOptions = [
  { label: 'Active', value: 'not_nil' },
  { label: 'Inactive', value: 'nil' },
];

const initUpdateMethodOptions = [
  { label: 'yum', value: 'yum' },
  { label: 'dnf', value: 'dnf' },
  { label: 'rpm-ostree', value: 'rpm-ostree' },
];

export const updateMethodOptions = initUpdateMethodOptions;

export const systemTypeOptions = [
  {
    label: 'Package mode',
    value: 'nil',
  },
  {
    label: 'Image mode',
    value: 'not_nil',
  },
];

export function filterToGroup(filter = [], valuesKey = 'values') {
  return filter.reduce(
    (accGroup, group) => ({
      ...accGroup,
      [group.key]: group[valuesKey].reduce(
        (acc, curr) => ({
          ...acc,
          [curr.key]: {
            isSelected: true,
            group: curr.group,
            item: {
              meta: {
                tag: {
                  key: curr.tagKey,
                  value: curr.value,
                },
              },
            },
          },
        }),
        {},
      ),
    }),
    {},
  );
}

export const arrayToSelection = (selected) =>
  selected.reduce(
    (acc, { cells: [key, value, namespace] }) => ({
      ...acc,
      [namespace]: {
        ...acc[namespace?.title || namespace],
        [`${key?.title || key}=${value?.title || value}`]: {
          isSelected: true,
          group: {
            value: namespace?.title || namespace,
            label: namespace?.title || namespace,
          },
          item: {
            tagKey: key?.title || key,
            tagValue: value?.title || value,
            value: `${key?.title || key}=${value?.title || value}`,
            id: `${key?.title || key}-${value?.title || value}`,
            meta: {
              tag: { key: key?.title || key, value: value?.title || value },
            },
          },
        },
      },
    }),
    {},
  );

export function reduceFilters(filters = []) {
  return filters.reduce(
    (acc, oneFilter) => {
      if (oneFilter.value === TEXT_FILTER) {
        return { ...acc, textFilter: oneFilter.filter };
      } else if ('tagFilters' in oneFilter) {
        return {
          ...acc,
          tagFilters: filterToGroup(oneFilter.tagFilters),
        };
      }

      const foundKey = [
        'staleFilter',
        'registeredWithFilter',
        'osFilter',
        'rhcdFilter',
        'updateMethodFilter',
        'lastSeenFilter',
        'hostGroupFilter',
        '',
        'systemTypeFilter',
      ].find((item) => Object.keys(oneFilter).includes(item));

      return {
        ...acc,
        ...(foundKey && { [foundKey]: oneFilter[foundKey] }),
      };
    },
    {
      textFilter: '',
      tagFilters: {},
    },
  );
}

export const reloadWrapper = (event, callback) => {
  event.payload.then((data) => {
    callback();
    return data;
  });

  return event;
};

export const isEmpty = (check) => !check || check?.length === 0;

export const generateFilter = (
  status,
  source,
  tagsFilter,
  filterbyName,
  operatingSystem,
  rhcdFilter,
  updateMethodFilter,
  hostGroupFilter,
  lastSeenFilter,
  systemTypeFilter,
) =>
  [
    !isEmpty(status) && {
      staleFilter: Array.isArray(status) ? status : [status],
    },
    !isEmpty(tagsFilter) && {
      tagFilters: Array.isArray(tagsFilter) ? tagsFilter : [tagsFilter],
    },
    !isEmpty(source) && {
      registeredWithFilter: Array.isArray(source) ? source : [source],
    },
    !isEmpty(filterbyName) && {
      value: 'hostname_or_id',
      filter: Array.isArray(filterbyName) ? filterbyName[0] : filterbyName,
    },
    (!isEmpty(status) || !isEmpty(tagsFilter) || !isEmpty(filterbyName)) &&
      isEmpty(source) && {
        registeredWithFilter: [],
      },
    (!isEmpty(source) || !isEmpty(tagsFilter) || !isEmpty(filterbyName)) &&
      isEmpty(status) && {
        staleFilter: [],
      },
    !isEmpty(operatingSystem) &&
      Object.keys(operatingSystem).length && {
        osFilter: operatingSystem,
      },
    !isEmpty(rhcdFilter) && {
      rhcdFilter: Array.isArray(rhcdFilter) ? rhcdFilter : [rhcdFilter],
    },
    !isEmpty(lastSeenFilter) && {
      lastSeenFilter: Array.isArray(lastSeenFilter)
        ? { mark: lastSeenFilter[0], ...lastSeenDefaults[lastSeenFilter[0]] }
        : [lastSeenFilter],
    },
    !isEmpty(updateMethodFilter) && {
      updateMethodFilter: Array.isArray(updateMethodFilter)
        ? updateMethodFilter
        : [updateMethodFilter],
    },
    !isEmpty(hostGroupFilter) && {
      hostGroupFilter: Array.isArray(hostGroupFilter)
        ? hostGroupFilter
        : [hostGroupFilter],
    },
    !isEmpty(systemTypeFilter) && {
      systemTypeFilter: Array.isArray(systemTypeFilter)
        ? systemTypeFilter
        : [systemTypeFilter],
    },
  ].filter(Boolean);

export const allStaleFilters = ['fresh', 'stale', 'stale_warning'];

export const hybridInventoryTabKeys = {
  conventional: {
    key: 'conventional',
    url: '',
  },
  immutable: {
    key: 'immutable',
    url: '/manage-edge-inventory',
  },
};
