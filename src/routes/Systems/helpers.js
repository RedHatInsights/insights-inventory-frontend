import { generateFilter } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { getHostList, getHostTags } from '../../api/hostInventoryApi';

const fetchHostTags = async (hosts) => {
  if (hosts.length) {
    return await getHostTags({
      hostIdList: hosts.map(({ id }) => id),
    });
  } else {
    return {};
  }
};

export const fetchSystems = async (serialisedTableState) => {
  const fields = {
    system_profile: [
      'operating_system',
      /* needed by inventory groups */ 'system_update_method',
      /* needed for image based systems */ 'bootc_status',
    ],
  };

  const params = {
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
