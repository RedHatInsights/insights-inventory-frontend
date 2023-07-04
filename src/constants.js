import PropTypes from 'prop-types';
import {
  HOST_GROUP_CHIP,
  RHCD_FILTER_KEY,
  UPDATE_METHOD_KEY,
} from './Utilities/constants';

export const tagsMapper = (acc, curr) => {
  let [namespace, keyValue] = curr.split('/');
  if (!keyValue) {
    keyValue = namespace;
    namespace = null;
  }

  const [key, value = null] = keyValue.split('=');
  const currTagKey = acc.findIndex(({ category }) => category === namespace);
  const currTag = acc[currTagKey] || {
    category: namespace,
    key: namespace,
    type: 'tags',
    values: [],
  };
  currTag.values.push({
    name: `${key}${value ? `=${value}` : ''}`,
    key: `${key}${value ? `=${value}` : ''}`,
    tagKey: key,
    value,
    group: {
      label: namespace,
      value: namespace,
      type: 'checkbox',
    },
  });
  if (!acc[currTagKey]) {
    acc.push(currTag);
  }

  return acc;
};

export const prepareRows = (rows = [], pagination = {}) =>
  rows.slice(
    (pagination.page - 1) * pagination.perPage,
    pagination.page * pagination.perPage
  );

export const isDate = (date) => {
  return !(isNaN(date) && isNaN(Date.parse(date)));
};

export const filterRows = (rows = [], activeFilters = {}) =>
  rows.filter(
    (row) =>
      Object.values(activeFilters).length === 0 ||
      Object.values(activeFilters).every((filter) => {
        const rowValue =
          row[filter.key] && (row[filter.key].sortValue || row[filter.key]);
        return (
          rowValue &&
          (Array.isArray(filter.value)
            ? filter.value.includes(rowValue)
            : rowValue
                .toLocaleLowerCase()
                .indexOf(filter.value.toLocaleLowerCase()) !== -1)
        );
      })
  );

export const generateFilters = (
  cells = [],
  filters = [],
  activeFilters = {},
  onChange = () => undefined
) =>
  filters.map((filter, key) => {
    const activeKey = filter.index || key;
    const activeLabel =
      cells[activeKey] && (cells[activeKey].title || cells[activeKey]);
    return {
      value: String(activeKey),
      label: activeLabel,
      type: filter.type || 'text',
      filterValues: {
        id: filter.id || `${activeLabel}-${activeKey}`,
        onChange: (_e, newFilter) =>
          onChange(activeKey, newFilter, activeLabel),
        value: activeFilters[activeKey] && activeFilters[activeKey].value,
        ...(filter.options && { items: filter.options }),
      },
    };
  });

export const onDeleteFilter = (
  deleted = {},
  deleteAll = false,
  activeFilters = {}
) => {
  if (deleteAll) {
    return {};
  } else {
    const { [deleted.key]: workingItem, ...filtersRest } = activeFilters;
    const newValue =
      workingItem &&
      Array.isArray(workingItem.value) &&
      workingItem.value.filter(
        (item) => !deleted.chips.find(({ name }) => name === item)
      );
    const newFilter =
      workingItem &&
      Array.isArray(workingItem.value) &&
      newValue &&
      newValue.length > 0
        ? {
            [deleted.key]: {
              ...workingItem,
              value: newValue,
            },
          }
        : {};
    return {
      ...filtersRest,
      ...newFilter,
    };
  }
};

export const extraShape = PropTypes.shape({
  title: PropTypes.node,
  value: PropTypes.node,
  singular: PropTypes.node,
  plural: PropTypes.node,
  onClick: PropTypes.func,
});

export const INVENTORY_WRITE_PERMISSIONS = [
  'inventory:*:*',
  'inventory:hosts:write',
  'inventory:*:write',
];

export const getSearchParams = () => {
  const searchParams = new URLSearchParams(location.search);
  const status = searchParams.getAll('status');
  const source = searchParams.getAll('source');
  const filterbyName = searchParams.getAll('hostname_or_id');
  const tagsFilter = searchParams
    .getAll('tags')?.[0]
    ?.split?.(',')
    .reduce?.(tagsMapper, []);
  const operatingSystem = searchParams.getAll('operating_system');
  const rhcdFilter = searchParams.getAll(RHCD_FILTER_KEY);
  const updateMethodFilter = searchParams.getAll(UPDATE_METHOD_KEY);
  const hostGroupFilter = searchParams.getAll(HOST_GROUP_CHIP);
  const page = searchParams.getAll('page');
  const perPage = searchParams.getAll('per_page');
  const lastSeenFilter = searchParams.getAll('last_seen');
  return {
    status,
    source,
    tagsFilter,
    filterbyName,
    operatingSystem,
    rhcdFilter,
    updateMethodFilter,
    lastSeenFilter,
    page,
    perPage,
    hostGroupFilter,
  };
};

export const TABLE_DEFAULT_PAGINATION = 50; // from UX table audit

export const REQUIRED_PERMISSIONS_TO_READ_GROUP = (groupId) => [
  {
    permission: 'inventory:groups:read',
    resourceDefinitions: [
      {
        attributeFilter: {
          key: 'groupd.id',
          operation: 'equal',
          value: groupId,
        },
      },
    ],
  },
];

export const REQUIRED_PERMISSIONS_TO_MODIFY_GROUP = (groupId) => [
  {
    permission: 'inventory:groups:write',
    resourceDefinitions: [
      {
        attributeFilter: {
          key: 'groupd.id',
          operation: 'equal',
          value: groupId,
        },
      },
    ],
  },
];

export const NO_MODIFY_GROUP_TOOLTIP_MESSAGE =
  'You do not have the necessary permissions to modify this group. Contact your organization administrator.';
