import React from 'react';
import PropTypes from 'prop-types';
import {
  HOST_GROUP_CHIP,
  RHCD_FILTER_KEY,
  UPDATE_METHOD_KEY,
  WORKLOAD_FILTER_KEY,
} from './Utilities/constants';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';

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
    pagination.page * pagination.perPage,
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
      }),
  );

export const generateFilters = (
  cells = [],
  filters = [],
  activeFilters = {},
  onChange = () => undefined,
) =>
  filters.map((filter, key) => {
    const activeKey = filter.index || key;
    const activeLabel =
      cells[activeKey] &&
      (cells[activeKey].title?.toLowerCase() || cells[activeKey]);
    return {
      value: String(activeKey),
      label: activeLabel,
      type: filter.type || 'text',
      filterValues: {
        id: filter.id || `${activeLabel}-${activeKey}`,
        onChange: (_e, newFilter) =>
          onChange(activeKey, newFilter, activeLabel),
        value:
          (activeFilters[activeKey] && activeFilters[activeKey].value) || '',
        ...(filter.options && { items: filter.options }),
      },
    };
  });

export const onDeleteFilter = (
  deleted = {},
  deleteAll = false,
  activeFilters = {},
) => {
  if (deleteAll) {
    return {};
  } else {
    const { [deleted.key]: workingItem, ...filtersRest } = activeFilters;
    const newValue =
      workingItem &&
      Array.isArray(workingItem.value) &&
      workingItem.value.filter(
        (item) => !deleted.chips.find(({ name }) => name === item),
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

export const getSearchParams = (searchParams) => {
  const status = searchParams.getAll('status');
  const source = searchParams.getAll('source');
  const filterbyName = searchParams.getAll('hostname_or_id');
  const tagsFilter = searchParams
    .getAll('tags')?.[0]
    ?.split?.(',')
    .reduce?.(tagsMapper, []);
  const operatingSystem = searchParams
    .getAll('operating_system')
    .reduce((filter, osFilter) => {
      if (typeof osFilter !== 'object') {
        let found = osFilter.match(new RegExp(/^([\D|\s]*)([\d|.]*)/));
        const osName = found[1].replaceAll(' ', '-');
        const osVersion = found[2];
        const [major] = osVersion.split('.');
        const groupName = `${osName}-${major}`;

        return {
          ...filter,
          [groupName]: {
            ...filter[groupName],
            [`${groupName}-${osVersion}`]: true,
          },
        };
      }
    }, {});

  const rhcdFilter = searchParams.getAll(RHCD_FILTER_KEY);
  const updateMethodFilter = searchParams.getAll(UPDATE_METHOD_KEY);
  const hostGroupFilter = searchParams.getAll(HOST_GROUP_CHIP);
  const page = searchParams.get('page');
  const perPage = searchParams.get('per_page');
  const lastSeenFilter = searchParams.getAll('last_seen');
  const systemTypeFilter = searchParams.getAll('system_type');
  const workloadFilter = searchParams.getAll(WORKLOAD_FILTER_KEY);
  const rawSort = searchParams.get('sort');
  const sortBy = {
    key: rawSort?.startsWith('-') ? rawSort.slice(1) : rawSort,
    direction: rawSort?.startsWith('-') ? 'desc' : 'asc',
  };

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
    systemTypeFilter,
    sortBy,
    workloadFilter,
  };
};

export const TABLE_DEFAULT_PAGINATION = 50; // from UX table audit

export const REQUIRED_PERMISSIONS_TO_READ_GROUP = (groupId) => [
  {
    permission: 'inventory:groups:read',
    resourceDefinitions: [
      {
        attributeFilter: {
          key: 'group.id',
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
          key: 'group.id',
          operation: 'equal',
          value: groupId,
        },
      },
    ],
  },
];

export const REQUIRED_PERMISSION_TO_MODIFY_HOST_IN_GROUP = (groupId) => ({
  permission: 'inventory:hosts:write',
  resourceDefinitions: [
    {
      attributeFilter: {
        key: 'group.id',
        operation: 'equal',
        value: groupId,
      },
    },
  ],
});

export const REQUIRED_PERMISSIONS_TO_READ_GROUP_HOSTS = (groupId) => [
  {
    permission: 'inventory:hosts:read',
    resourceDefinitions: [
      {
        attributeFilter: {
          key: 'group.id',
          operation: 'equal',
          value: groupId,
        },
      },
    ],
  },
];

export const NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE =
  'You do not have the necessary permissions to modify workspaces. Contact your organization administrator.';
export const NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE =
  'You do not have the necessary permissions to modify this workspace. Contact your organization administrator.';
export const NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE =
  'Checking your workspace permissions. Try again in a moment.';
export const NO_RENAME_WORKSPACE_KESSEL_TOOLTIP_MESSAGE =
  'You do not have permission to rename this workspace. Contact your organization administrator.';
export const NO_EDIT_WORKSPACE_KESSEL_TOOLTIP_MESSAGE =
  'You do not have permission to edit this workspace. Contact your organization administrator.';
export const NO_DELETE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE =
  'You do not have permission to delete this workspace. Contact your organization administrator.';
export const NO_DELETE_SELECTED_WORKSPACES_KESSEL_TOOLTIP_MESSAGE =
  'You do not have permission to delete every selected workspace. Remove workspaces you cannot delete from the selection, or contact your organization administrator.';
export const NO_CREATE_WORKSPACE_KESSEL_TOOLTIP_MESSAGE =
  'You do not have permission to create workspaces. Contact your organization administrator.';
export const NO_MODIFY_HOSTS_TOOLTIP_MESSAGE =
  'You do not have the necessary permissions to modify hosts. Contact your organization administrator.';
export const NO_MODIFY_HOST_TOOLTIP_MESSAGE =
  'You do not have the necessary permissions to modify this host. Contact your organization administrator.';
export const NO_MODIFY_HOST_KESSEL_TOOLTIP_MESSAGE =
  'You do not have permission to edit this host. Contact your organization administrator.';
export const NO_MANAGE_USER_ACCESS_TOOLTIP_MESSAGE =
  'You must be an organization administrator to modify User Access configuration.';
const REMEDIATIONS_DISPLAY = 'Automation Toolkit > Remediations';
const REMEDIATIONS_LINK = (
  <InsightsLink aria-label="rhc-remediations-link" to={'/'} app="remediations">
    {REMEDIATIONS_DISPLAY}
  </InsightsLink>
);
export const RHC_TOOLTIP_MESSAGE = (
  <span>
    The RHC client was installed and configured but may not reflect actual
    connectivity.
    <br />
    <br /> To view the remediation status of your system, go to{' '}
    {REMEDIATIONS_LINK} and open a remediation that your system is associated
    with. Under the <b>Systems</b> tab, you will find the{' '}
    <b>Connection Status</b>.
  </span>
);
export const GENERAL_GROUPS_WRITE_PERMISSION = 'inventory:groups:write';
export const GROUPS_WILDCARD = 'inventory:groups:*';
export const INVENTORY_WILDCARD = 'inventory:*:*';
export const INVENTORY_WRITE_WILDCARD = 'inventory:*:write';
export const GENERAL_GROUPS_READ_PERMISSION = 'inventory:groups:read';
export const GROUPS_ADMINISTRATOR_PERMISSIONS = [
  GENERAL_GROUPS_READ_PERMISSION,
  GENERAL_GROUPS_WRITE_PERMISSION,
];
export const GENERAL_HOSTS_READ_PERMISSIONS = 'inventory:hosts:read';
export const GENERAL_HOSTS_WRITE_PERMISSIONS = 'inventory:hosts:write';
export const USER_ACCESS_ADMIN_PERMISSIONS = ['rbac:*:*'];
export const PAGINATION_DEFAULT = { perPage: 10, page: 1 };
export const NO_ACCESS_STATE = 'noAccess';

export const TAB_REQUIRED_PERMISSIONS = {
  /**
   * Should be up to date with
   * https://github.com/RedHatInsights/rbac-config/tree/master/configs/stage/roles
   * viewer roles.
   */
  advisor: ['advisor:*:read'],
  vulnerability: [
    'vulnerability:vulnerability_results:read',
    'vulnerability:system.opt_out:read',
    'vulnerability:report_and_export:read',
    'vulnerability:advanced_report:read',
  ],
  compliance: [
    'compliance:policy:read',
    'compliance:report:read',
    'compliance:system:read',
    'remediations:remediation:read',
  ],
  patch: ['patch:*:read'],
  ros: ['ros:*:read'],
};

// Kessel access-check API (see PR 2919 / useHostIdsWithKessel)
export const KESSEL_API_PATH = '/api/kessel/v1beta2';
export const HOST_RESOURCE_TYPE = 'host';
export const HOST_RESOURCE_TYPE_VIEW = 'view';
export const HOST_RESOURCE_TYPE_UPDATE = 'update';
export const HOST_RESOURCE_TYPE_DELETE = 'delete';
export const INVENTORY_STALENESS_READ_PERMISSION = 'inventory:staleness:read';
export const INVENTORY_STALENESS_WRITE_PERMISSION = 'inventory:staleness:write';
export const PER_PAGE_MAX = 100;
export const PER_PAGE = 50;
export const INITIAL_PAGE = 1;
export const EMPTY_CELL = '';
export const DEBOUNCE_TIMEOUT_MS = 300;
export const WORKSPACE_RESOURCE_TYPE = 'workspace';
/**
 * Kessel self-access relation for read access on a `workspace` resource (RBAC reporter).
 * Aligns with `docs/kessel-frontend-design-document.md` (workspace `view` = read / list / detail).
 */
export const WORKSPACE_RELATION_VIEW = 'view';
export const WORKSPACE_RELATION_EDIT = 'edit';
export const WORKSPACE_RELATION_DELETE = 'delete';
export const KESSEL_REPORTER = { type: 'hbi' };
export const KESSEL_WORKSPACE_REPORTER = { type: 'rbac' };
/**
 * Self-access `relation` values on {@link WORKSPACE_RESOURCE_TYPE} with Default workspace id
 * (see kessel-sdk-browser README “Fetching Workspace IDs for Access Checks”).
 * Source: RedHatInsights/rbac-config `configs/stage/schemas/schema.zed` (`rbac/workspace`).
 */
export const STALENESS_WORKSPACE_RELATION_VIEW = 'staleness_staleness_view';
export const STALENESS_WORKSPACE_RELATION_UPDATE = 'staleness_staleness_update';
/** Inventory hosts in workspace: `inventory_host_view` / `inventory_host_update` on that workspace object. */
export const HOST_WORKSPACE_RELATION_VIEW = 'inventory_host_view';
export const HOST_WORKSPACE_RELATION_UPDATE = 'inventory_host_update';
export const DEFAULT_DELETE_ERROR_MESSAGE =
  'There was an error processing the request. Please try again.';
export const NOT_AVAILABLE = 'N/A';
