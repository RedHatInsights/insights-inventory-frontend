// TODO remove dependency on fec helpers and components
import { generateFilter } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { getHostList, getHostTags, getTags } from '../../api/hostInventoryApi';
import defaultColumns from './components/SystemsTable/columns';

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

export const fetchSystems = async (
  serialisedTableState,
  _rawTableState,
  { filter: globalFilter, tags: globalFilterTags } = {},
) => {
  const fields = {
    system_profile: [
      'operating_system',
      'system_update_method' /* needed by inventory groups Why? */,
      'bootc_status',
    ],
  };

  const params = {
    ...(serialisedTableState?.pagination || {}),
    ...(serialisedTableState?.filters || {}),
    ...(serialisedTableState?.sort || {}),
    // Currently tags set in the global filter only appear in the global filter
    // If we wanted to keep the toolbar filters and global filters in sync
    // we should use `setFilter` instead and not add the global filter tags here
    tags: [
      ...(serialisedTableState?.filters?.tags || []),
      ...(globalFilterTags || []),
    ],
    options: {
      params: {
        // There is a bug in the JS clients that requires us to pass "filter" and "fields" as "raw" params.
        // the issue is that JS clients convert that object wrongly to something like filter.systems_profile.sap_system as the param name
        // it should rather be something like `filter[systems_profile][sap_system]`
        ...generateFilter(fields, 'fields'),
        ...generateFilter(globalFilter),
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
