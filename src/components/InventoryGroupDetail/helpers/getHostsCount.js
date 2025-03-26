import { getHostList } from '../../../api/hostInventoryApi';

export const getConventionalHostsCount = (params) =>
  getHostList({
    perPage: 1,
    page: 1,
    ...params,
    options: {
      params: {
        filter: {
          system_profile: {
            host_type: 'nil',
          },
        },
      },
      ...params?.options,
    },
  });

export const getImmutableHostsCount = (params) =>
  getHostList({
    perPage: 1,
    page: 1,
    ...params,
    options: {
      params: {
        filter: {
          system_profile: {
            host_type: 'edge',
          },
        },
      },
      ...params?.options,
    },
  });

export const getHostsCount = async (params) => {
  try {
    const conventionalHosts = await getConventionalHostsCount(params);
    const immutableHosts = await getImmutableHostsCount(params);

    return {
      conventionalHostsCount: conventionalHosts.total,
      immutableHostsCount: immutableHosts.total,
    };
  } catch (error) {
    console.error(error);

    return {
      conventionalHostsCount: 0,
      immutableHostsCount: 0,
    };
  }
};
