import { getHostList } from '../../../api/hostInventoryApi';

export const getConventionalHostsCount = (params) =>
  getHostList({
    perPage: 1,
    page: 1,
    ...params,
    filter: { system_profile: { host_type: 'edge' }, ...params.filter },
  });

export const getImmutableHostsCount = (params) =>
  getHostList({
    perPage: 1,
    page: 1,
    ...params,
    filter: { system_profile: { host_type: 'nil' }, ...params.filter },
  });

export const getHostsCount = async (params) => {
  try {
    const conventionalHostsCount = await getConventionalHostsCount(params).data
      .total;
    const immutableHostsCount = await getImmutableHostsCount(params).data.total;

    return {
      conventionalHostsCount,
      immutableHostsCount,
    };
  } catch (error) {
    console.error(error);

    return {
      conventionalHostsCount: 0,
      immutableHostsCount: 0,
    };
  }
};
