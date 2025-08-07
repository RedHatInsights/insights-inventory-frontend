// TODO remove dependency on fec helpers and components
import { generateFilter } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { getHostList, getHostTags, getTags } from '../../api/hostInventoryApi';
import defaultColumns from './components/SystemsTable/columns';
import defaultFilters, {
  CUSTOM_FILTER_TYPES,
} from './components/SystemsTable/filters';

const fetchHostTags = async (hosts) => {
  if (hosts.length) {
    return await getHostTags({
      hostIdList: hosts.map(({ id }) => id),
    });
  } else {
    return {};
  }
};

export const fetchTags = async () => {
  return await getTags();
};

export const fetchSystems = async (serialisedTableState) => {
  const fields = {
    system_profile: [
      'operating_system',
      'system_update_method' /* needed by inventory groups Why? */,
      'bootc_status',
    ],
  };

  const params = {
    // TODO Add global filter
    ...(serialisedTableState?.pagination || {}),
    ...(serialisedTableState?.filters || {}),
    ...(serialisedTableState?.sort || {}),
    options: {
      params: generateFilter(fields, 'fields'),
    },
  };

  const { results: hosts, total } = await getHostList(params);
  const { results: hostsTags } = await fetchHostTags(hosts);

  const systems = hosts.map((system) => ({
    ...system,
    ...(hostsTags[system.id] ? { tags: hostsTags[system.id] } : {}),
  }));

  return [systems, total];
};

export const resolveColumns = (columns) => {
  if (typeof columns === 'function') {
    return columns(defaultColumns);
  } else {
    return columns;
  }
};

export const resolveFilters = (filters) => {
  if (typeof filters === 'function') {
    return filters({
      customFilterTypes: CUSTOM_FILTER_TYPES,
      filterConfig: defaultFilters,
    });
  } else {
    return filters;
  }
};
