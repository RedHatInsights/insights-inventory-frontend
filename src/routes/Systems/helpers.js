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
  const { filter, ...filterParams } = serialisedTableState?.filters || {};

  const params = {
    // TODO Add global filter
    ...(serialisedTableState?.pagination || {}),
    ...(serialisedTableState?.sort || {}),
    // These are "filters" that are set via a specific URL parameter, like hostname, systemType, staleness, etc.
    ...filterParams,
    options: {
      params: {
        // the "generateFilter" function is used here, because coincidentally the "fields URL parameter(s)" behave similar to the filter
        ...generateFilter(fields, 'fields'),
        // The rest are those that need to be a filter query parameter, like OS version or name and other "field filters"
        // "filter", is the object of the merged "filter" prop of the individual object returned from each filter(serialiser)
        ...generateFilter(filter),
      },
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

const osVersionSorter = (a, b) =>
  b.major === a.major ? b.minor - a.minor : b.major - a.major;

export const getOsSelectOptions = (osName, osData) => {
  if (!osData) return [];

  const osItems = osData
    .filter((item) => item.name === osName)
    .toSorted(osVersionSorter);
  const majors = [...new Set(osItems.map((item) => item.major))];

  return majors.map((major) => ({
    label: `${osName} ${major}`,
    value: `${osName}`,
    items: osItems
      .filter((item) => item.major === major)
      .map((item) => ({
        label: `${item.name} ${item.major}.${item.minor}`,
        value: `${item.major}.${item.minor}`,
      })),
  }));
};
