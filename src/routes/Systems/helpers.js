// TODO remove dependency on fec helpers and components
import { generateFilter } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { getHostList, getHostTags, getTags } from '../../api/hostInventoryApi';

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
