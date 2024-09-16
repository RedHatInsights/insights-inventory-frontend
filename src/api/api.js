export const INVENTORY_API_BASE = '/api/inventory/v1';
export const EDGE_API_BASE = '/api/edge/v1';
import flatMap from 'lodash/flatMap';

import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import {
  generateFilter,
  mergeArraysByKey,
} from '@redhat-cloud-services/frontend-components-utilities/helpers';
import {
  GroupsApi,
  HostsApi,
  SystemProfileApi,
  TagsApi,
} from '@redhat-cloud-services/host-inventory-client';
import {
  RHCD_FILTER_KEY,
  UPDATE_METHOD_KEY,
  allStaleFilters,
} from '../Utilities/constants';

export { instance };
export const hosts = new HostsApi(undefined, INVENTORY_API_BASE, instance);
export const tags = new TagsApi(undefined, INVENTORY_API_BASE, instance);
export const systemProfile = new SystemProfileApi(
  undefined,
  INVENTORY_API_BASE,
  instance
);
export const groupsApi = new GroupsApi(undefined, INVENTORY_API_BASE, instance);
export const getEntitySystemProfile = (item) =>
  hosts.apiHostGetHostSystemProfileById([item]);

export const mapData = ({ facts = {}, ...oneResult }) => ({
  ...oneResult,
  rawFacts: facts,
  facts: {
    ...facts.reduce?.(
      (acc, curr) => ({ ...acc, [curr.namespace]: curr.facts }),
      {}
    ),
    ...flatMap(facts, (oneFact) => Object.values(oneFact))
      .map((item) =>
        typeof item !== 'string'
          ? {
              ...item,
              os_release: item.os_release || item.release,
              display_name: item.display_name || item.fqdn || item.id,
            }
          : item
      )
      .reduce(
        (acc, curr) => ({ ...acc, ...(typeof curr !== 'string' ? curr : {}) }),
        {}
      ),
  },
});

export const mapTags = (
  data = { results: [] },
  { orderBy, orderDirection } = {}
) => {
  if (data.results.length > 0) {
    return hosts
      .apiHostGetHostTags(
        data.results.map(({ id }) => id),
        data.per_page,
        1,
        orderBy,
        orderDirection
      )
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
          }`
      )
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
          })
        ),
      ];
    })
  );

  return Object.entries(
    Object.values(osFilterStateWithoutMajors).reduce(
      (acc, item) => ({ ...acc, ...item }),
      {}
    )
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

export const calculateSystemProfile = ({
  osFilter,
  rhcdFilter,
  updateMethodFilter,
  hostTypeFilter,
  system_profile,
  systemTypeFilter,
}) => {
  const operating_system = buildOperatingSystemFilter(osFilter);
  const newSystemProfile = {
    ...system_profile,
    ...(hostTypeFilter ? { host_type: hostTypeFilter } : { host_type: 'nil' }),
    ...(updateMethodFilter
      ? {
          [UPDATE_METHOD_KEY]: {
            eq: updateMethodFilter,
          },
        }
      : {}),
    ...(rhcdFilter ? { [RHCD_FILTER_KEY]: rhcdFilter } : {}),
    ...(Object.keys(operating_system).length ? { operating_system } : {}),
    ...(systemTypeFilter?.length
      ? {
          bootc_status: {
            booted: {
              image_digest: {
                is: systemTypeFilter,
              },
            },
          },
        }
      : {}),
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
        /* needed by inventory groups */ 'system_update_method',
        /* needed for image based systems */ 'bootc_status',
      ],
    },
    ...options
  },
  showTags
) {
  if (hasItems && items?.length > 0) {
    let data = await hosts.apiHostGetHostById(
      items,
      undefined,
      perPage,
      page,
      orderBy,
      orderDirection,
      undefined,
      undefined,
      {
        ...(controller?.signal !== undefined
          ? { signal: controller.signal }
          : {}),
      }
    );
    if (fields && Object.keys(fields).length) {
      try {
        const result = await hosts.apiHostGetHostSystemProfileById(
          items,
          perPage,
          undefined,
          undefined,
          undefined,
          undefined,
          undefined,
          {
            ...(controller?.signal !== undefined
              ? { signal: controller.signal }
              : {}),
            // TODO We should not be doing this, but use the "fields" param of the function
            // We then probably do not need to (ab)use the generateFilter function
            query: generateFilter(fields, 'fields'),
          }
        );

        data = {
          ...data,
          results: mergeArraysByKey(
            [data?.results, result?.results || []],
            'id'
          ),
        };
      } catch (e) {
        console.error(e); // eslint-disable-line
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
        })
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
      generateFilter(calculateSystemProfile(combinedFilters));

    const fieldsQueryParams =
      Object.keys(fields || {}).length && generateFilter(fields, 'fields');

    const lastSeenFilterQueryParams = {
      ...(filters?.lastSeenFilter?.updatedStart && {
        updated_start: filters.lastSeenFilter.updatedStart,
      }),
      ...(filters?.lastSeenFilter?.updatedEnd && {
        updated_end: filters.lastSeenFilter.updatedEnd,
      }),
    };

    return hosts
      .apiHostGetHostList(
        undefined,
        undefined,
        filters.hostnameOrId,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        filters.hostGroupFilter,
        undefined,
        perPage,
        page,
        orderBy,
        orderDirection,
        filters.staleFilter,
        [
          ...constructTags(filters?.tagFilters),
          ...(options?.globalFilter?.tags || []),
        ],
        filters?.registeredWithFilter,
        undefined,
        undefined,
        {
          ...(controller?.signal !== undefined
            ? { signal: controller.signal }
            : {}),
          query: {
            // TODO We should be using the fields and filter (function) parameter instead
            // Side note: we probably do this because it seems the js-clients have issues with parameters that have array values or smth
            ...(Object.keys(filterQueryParams).length ? filterQueryParams : {}),
            ...(Object.keys(fieldsQueryParams).length ? fieldsQueryParams : {}),
            // TODO There should be a way to pass these via the filter func param
            ...(Object.keys(lastSeenFilterQueryParams).length
              ? lastSeenFilterQueryParams
              : {}),
          },
        }
      )
      .then((data) =>
        showTags ? mapTags(data, { orderBy, orderDirection }) : data
      )
      .then(({ results = [], ...data } = {}) => ({
        ...data,
        filters,
        results: results.map((result) =>
          mapData({
            ...result,
            display_name: result.display_name || result.fqdn || result.id,
          })
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
  return hosts.apiHostGetHostTags(
    systemId,
    pagination.perPage || 10,
    pagination.page || 1,
    undefined,
    undefined,
    search
  );
}

export function getAllTags(search, pagination = {}) {
  return tags.apiTagGetTags(
    [],
    'tag',
    'ASC',
    pagination.perPage || 10,
    pagination.page || 1,
    //TODO: ask the backend to return all tags by default.
    allStaleFilters,
    search,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined
  );
}

export const getOperatingSystems = async (params = [], showCentosVersions) => {
  let operatingSystems = await systemProfile.apiSystemProfileGetOperatingSystem(
    ...params
  );
  if (!showCentosVersions) {
    const newResults = operatingSystems.results.filter(
      ({ value }) => !value.name.toLowerCase().startsWith('centos')
    );
    operatingSystems.results = newResults;
  }
  return operatingSystems;
};

export const fetchDefaultStalenessValues = () => {
  return instance.get(`${INVENTORY_API_BASE}/account/staleness/defaults`);
};

export const fetchStalenessData = () => {
  return instance.get(`${INVENTORY_API_BASE}/account/staleness`);
};

export const postStalenessData = (data) => {
  return instance.post(`${INVENTORY_API_BASE}/account/staleness`, data);
};
export const patchStalenessData = (data) => {
  return instance.patch(`${INVENTORY_API_BASE}/account/staleness`, data);
};

export const fetchEdgeSystem = () => {
  try {
    return instance.get(`${EDGE_API_BASE}/devices/devicesview?limit=1`);
  } catch (err) {
    console.log(err);
  }
};

export const useGetImageData = () => {
  return (deviceIDs) => {
    return instance.post(`${EDGE_API_BASE}/devices/devicesview`, deviceIDs);
  };
};
export const fetchEdgeEnforceGroups = () => {
  try {
    return instance.get(`${EDGE_API_BASE}/device-groups/enforce-edge-groups`);
  } catch (err) {
    console.error(err);
  }
};
