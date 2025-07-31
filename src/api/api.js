export const INVENTORY_API_BASE = '/api/inventory/v1';
export const EDGE_API_BASE = '/api/edge/v1';
import flatMap from 'lodash/flatMap';

import axiosInstance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import {
  generateFilter,
  mergeArraysByKey,
} from '@redhat-cloud-services/frontend-components-utilities/helpers';
import {
  RHCD_FILTER_KEY,
  UPDATE_METHOD_KEY,
  allStaleFilters,
} from '../Utilities/constants';
import { ApiTagGetTagsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiTagGetTags';
import {
  createStaleness as apiCreateStaleness,
  getDefaultStaleness as apiGetDefaultStaleness,
  getHostById as apiGetHostById,
  getHostList as apiGetHostList,
  getHostSystemProfileById as apiGetHostSystemProfileById,
  getHostTags as apiGetHostTags,
  getStaleness as apiGetStaleness,
  getTags as apiGetTags,
  getOperatingSystem,
} from './hostInventoryApi';

export { axiosInstance as instance };

export const getEntitySystemProfile = (item) =>
  apiGetHostSystemProfileById({ hostIdList: [item] });

export const mapData = ({ facts = {}, ...oneResult }) => ({
  ...oneResult,
  rawFacts: facts,
  facts: {
    ...facts.reduce?.(
      (acc, curr) => ({ ...acc, [curr.namespace]: curr.facts }),
      {},
    ),
    ...flatMap(facts, (oneFact) => Object.values(oneFact))
      .map((item) =>
        typeof item !== 'string'
          ? {
              ...item,
              os_release: item.os_release || item.release,
              display_name: item.display_name || item.fqdn || item.id,
            }
          : item,
      )
      .reduce(
        (acc, curr) => ({ ...acc, ...(typeof curr !== 'string' ? curr : {}) }),
        {},
      ),
  },
});

export const mapTags = (
  data = { results: [] },
  { orderBy, orderDirection } = {},
) => {
  if (data.results.length > 0) {
    return apiGetHostTags({
      hostIdList: data.results.map(({ id }) => id),
      perPage: data.per_page,
      page: 1,
      orderBy,
      orderHow: orderDirection,
    })
      .then(({ results: tags }) => ({
        ...data,
        results: data.results.map((row) => ({
          ...row,
          tags: tags[row.id] || [],
        })),
      }))
      .catch(() => ({
        ...data,
        results: data.results.map((row) => ({
          ...row,
          tags: [],
        })),
      }));
  }

  return data;
};

export const constructTags = (tagFilters) => {
  return (
    flatMap(tagFilters, ({ values, category: namespace }) =>
      values.map(
        ({ value: tagValue, tagKey }) =>
          `${namespace ? `${namespace}/` : ''}${tagKey}${
            tagValue ? `=${tagValue}` : ''
          }`,
      ),
    ) || ''
  );
};

const buildOperatingSystemFilter = (osFilterState = {}) => {
  const osFilterStateWithoutMajors = Object.fromEntries(
    Object.entries(osFilterState).map(([majorKey, items]) => {
      return [
        majorKey,
        Object.fromEntries(
          Object.entries(items).filter(([minorKey]) => {
            return minorKey !== majorKey;
          }),
        ),
      ];
    }),
  );

  return Object.entries(
    Object.values(osFilterStateWithoutMajors).reduce(
      (acc, item) => ({ ...acc, ...item }),
      {},
    ),
  )
    .filter(([, value]) => value === true)
    .map(([key]) => {
      const keyParts = key.split('-');
      return [
        keyParts.slice(0, keyParts.length - 2).join(' '),
        keyParts[keyParts.length - 1],
      ];
    })
    .reduce((oses, [osName, version]) => {
      if (!oses[osName]) {
        oses[osName] = {
          version: { eq: [] },
        };
      }
      return {
        ...oses,
        [osName]: {
          version: {
            eq: [...oses[osName].version.eq, version],
          },
        },
      };
    }, {});
};

export const calculateSystemProfile = (
  { osFilter, rhcdFilter, updateMethodFilter, hostTypeFilter, system_profile },
  filterImmutable = true,
) => {
  const operating_system = buildOperatingSystemFilter(osFilter);
  const defaultHostTypeFilter = filterImmutable ? { host_type: 'nil' } : {};
  const newSystemProfile = {
    ...system_profile,
    ...(hostTypeFilter ? { host_type: hostTypeFilter } : defaultHostTypeFilter),
    ...(updateMethodFilter
      ? {
          [UPDATE_METHOD_KEY]: {
            eq: updateMethodFilter,
          },
        }
      : {}),
    ...(rhcdFilter ? { [RHCD_FILTER_KEY]: rhcdFilter } : {}),
    ...(Object.keys(operating_system).length ? { operating_system } : {}),
  };

  return Object.keys(newSystemProfile).length
    ? {
        system_profile: newSystemProfile,
      }
    : {};
};

export const filtersReducer = (acc, filter = {}) => ({
  ...acc,
  ...(filter.value === 'hostname_or_id' && { hostnameOrId: filter.filter }),
  ...('tagFilters' in filter && { tagFilters: filter.tagFilters }),
  ...('staleFilter' in filter && { staleFilter: filter.staleFilter }),
  ...('registeredWithFilter' in filter && {
    registeredWithFilter: filter.registeredWithFilter,
  }),
  ...('osFilter' in filter && { osFilter: filter.osFilter }),
  ...('rhcdFilter' in filter && { rhcdFilter: filter.rhcdFilter }),
  ...('hostTypeFilter' in filter && { hostTypeFilter: filter.hostTypeFilter }),
  ...('lastSeenFilter' in filter && { lastSeenFilter: filter.lastSeenFilter }),
  ...('updateMethodFilter' in filter && {
    updateMethodFilter: filter.updateMethodFilter,
  }),
  ...('hostGroupFilter' in filter && {
    hostGroupFilter: filter.hostGroupFilter,
  }),
  ...('systemTypeFilter' in filter && {
    systemTypeFilter: filter.systemTypeFilter,
  }),
});

export async function getEntities(
  items,
  {
    controller,
    hasItems,
    filters,
    per_page: perPage,
    page,
    orderBy,
    orderDirection,
    fields = {
      system_profile: [
        'operating_system',
        /* needed by inventory groups */ 'host_type',
        /* needed by inventory groups */ 'system_update_method',
        /* needed for image based systems */ 'bootc_status',
      ],
    },
    filterImmutableByDefault = true,
    ...options
  },
  showTags,
) {
  if (hasItems && items?.length > 0) {
    let data = await apiGetHostById({
      hostIdList: items,
      perPage,
      page,
      orderBy,
      orderHow: orderDirection,
      options: {
        ...(controller?.signal !== undefined
          ? { signal: controller.signal }
          : {}),
      },
    });
    if (fields && Object.keys(fields).length) {
      try {
        const result = await apiGetHostSystemProfileById({
          hostIdList: items,
          perPage,
          options: {
            ...(controller?.signal !== undefined
              ? { signal: controller.signal }
              : {}),
            // TODO We should not be doing this, but use the "fields" param of the function
            // We then probably do not need to (ab)use the generateFilter function
            params: generateFilter(fields, 'fields'),
          },
        });

        data = {
          ...data,
          results: mergeArraysByKey(
            [data?.results, result?.results || []],
            'id',
          ),
        };
      } catch (e) {
        console.error(e);
      }
    }

    data = showTags ? await mapTags(data) : data;

    data = {
      ...data,
      filters,
      results: data.results.map((result) =>
        mapData({
          ...result,
          display_name: result.display_name || result.fqdn || result.id,
        }),
      ),
    };

    return data;
  } else if (!hasItems) {
    const combinedFilters = {
      ...(options?.globalFilter?.filter || {}),
      ...(options?.filter || {}),
      ...(filters || {}),
    };

    const filterQueryParams =
      Object.keys(combinedFilters).length &&
      generateFilter(
        calculateSystemProfile(combinedFilters, filterImmutableByDefault),
      );

    const fieldsQueryParams =
      Object.keys(fields || {}).length && generateFilter(fields, 'fields');

    return apiGetHostList({
      hostnameOrId: filters.hostnameOrId,
      groupName: filters.hostGroupFilter,
      perPage,
      page,
      orderBy,
      orderHow: orderDirection,
      staleness: filters.staleFilter,
      updatedStart: filters.lastSeenFilter?.updatedStart,
      updatedEnd: filters.lastSeenFilter?.updatedEnd,
      tags: [
        ...constructTags(filters?.tagFilters),
        ...(options?.globalFilter?.tags || []),
      ],
      registeredWith: filters?.registeredWithFilter,
      systemType: filters?.systemTypeFilter,
      options: {
        ...(controller?.signal !== undefined
          ? { signal: controller.signal }
          : {}),
        params: {
          ...(Object.keys(filterQueryParams).length ? filterQueryParams : {}),
          ...(Object.keys(fieldsQueryParams).length ? fieldsQueryParams : {}),
        },
      },
    })
      .then((data) =>
        showTags ? mapTags(data, { orderBy, orderDirection }) : data,
      )
      .then(({ results = [], ...data } = {}) => ({
        ...data,
        filters,
        results: results.map((result) =>
          mapData({
            ...result,
            display_name: result.display_name || result.fqdn || result.id,
          }),
        ),
      }));
  }

  return {
    page,
    per_page: perPage,
    results: [],
  };
}

export function getTags(systemId, search, { pagination } = { pagination: {} }) {
  return apiGetHostTags({
    hostIdList: [systemId], // TODO: can cause a bug when passing with array
    perPage: pagination.perPage || 10,
    page: pagination.page || 1,
    search,
  });
}

export function getAllTags(search, pagination = {}) {
  return apiGetTags({
    tags: [],
    orderBy: ApiTagGetTagsOrderByEnum.Tag,
    orderHow: 'ASC',
    perPage: pagination.perPage || 10,
    page: pagination.page || 1,
    staleness: allStaleFilters,
    search,
  });
}

export const getOperatingSystems = async (params = [], showCentosVersions) => {
  let operatingSystems = await getOperatingSystem(...params);
  if (!showCentosVersions) {
    const newResults = operatingSystems.results.filter(
      ({ value }) => !value.name.toLowerCase().startsWith('centos'),
    );
    operatingSystems.results = newResults;
  }
  return operatingSystems;
};

export const fetchDefaultStalenessValues = () => {
  return apiGetDefaultStaleness();
};

export const fetchStalenessData = () => {
  return apiGetStaleness();
};

export const postStalenessData = (data) => {
  return apiCreateStaleness({ stalenessIn: data });
};

export const fetchEdgeSystem = () => {
  try {
    return axiosInstance.get(`${EDGE_API_BASE}/devices/devicesview?limit=1`);
  } catch (err) {
    console.log(err);
  }
};

export const useGetImageData = () => {
  return (deviceIDs) => {
    return axiosInstance.post(
      `${EDGE_API_BASE}/devices/devicesview`,
      deviceIDs,
    );
  };
};
export const fetchEdgeEnforceGroups = () => {
  try {
    return axiosInstance.get(
      `${EDGE_API_BASE}/device-groups/enforce-edge-groups`,
    );
  } catch (err) {
    console.error(err);
  }
};
