// TODO remove dependency on fec helpers and components
import { generateFilter } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { getHostList, getHostTags } from '../../api/hostInventoryApi';
import uniq from 'lodash/uniq';

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

  const { filter, ...filterParams } = serialisedTableState?.filters || {};

  const params = {
    ...(serialisedTableState?.pagination || {}),
    ...(serialisedTableState?.sort || {}),
    // Currently tags set in the global filter only appear in the global filter
    // If we wanted to keep the toolbar filters and global filters in sync
    // we should use `setFilter` instead and not add the global filter tags here
    ...filterParams,
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

export const isBulkAddHostsToGroupsEnabled = (selectedSize, selected) => {
  if (selectedSize > 0) {
    const selectedHosts = Array.from(selected.values());

    return selectedHosts.every(({ groups }) => groups[0]?.ungrouped === true);
  }

  return false;
};

export const isBulkRemoveFromGroupsEnabled = (selectedSize, selected) => {
  return (
    // can't remove from ungrouped group
    selectedSize > 0 &&
    Array.from(selected?.values()).every(
      ({ groups }) => groups[0].ungrouped !== true,
    ) &&
    Array.from(selected.values()).some(({ groups }) => groups.length > 0) &&
    uniq(
      // can remove from at maximum one group at a time
      Array.from(selected.values())
        .filter(({ groups }) => groups.length > 0)
        .map(({ groups }) => groups[0].name),
    ).length === 1
  );
};
