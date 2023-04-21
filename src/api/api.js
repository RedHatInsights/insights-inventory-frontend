import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';
export const INVENTORY_API_BASE = '/api/inventory/v1';
import flatMap from 'lodash/flatMap';

import instance from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { generateFilter, mergeArraysByKey } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { HostsApi, TagsApi, SystemProfileApi } from '@redhat-cloud-services/host-inventory-client';
import { allStaleFilters, RHCD_FILTER_KEY, UPDATE_METHOD_KEY } from '../Utilities/constants';

export { instance };
export const hosts = new HostsApi(undefined, INVENTORY_API_BASE, instance);
export const tags = new TagsApi(undefined, INVENTORY_API_BASE, instance);
export const systemProfile = new SystemProfileApi(undefined, INVENTORY_API_BASE, instance);

export const getEntitySystemProfile = (item) => hosts.apiHostGetHostSystemProfileById([item]);

/* eslint camelcase: off */
export const mapData = ({ facts = {}, ...oneResult }) => ({
    ...oneResult,
    rawFacts: facts,
    facts: {
        ...facts.reduce?.((acc, curr) => ({ ...acc, [curr.namespace]: curr.facts }), {}),
        ...flatMap(facts, (oneFact => Object.values(oneFact)))
        .map(item => typeof item !== 'string' ? ({
            ...item,
            // eslint-disable-next-line camelcase
            os_release: item.os_release || item.release,
            // eslint-disable-next-line camelcase
            display_name: item.display_name || item.fqdn || item.id
        }) : item)
        .reduce(
            (acc, curr) => ({ ...acc, ...(typeof curr !== 'string') ? curr : {} }), {}
        )
    }
});

export const mapTags = (data = { results: [] }, { orderBy, orderDirection } = {}) => {
    if (data.results.length > 0) {
        return hosts.apiHostGetHostTags(data.results.map(({ id }) => id), data.per_page, 1, orderBy, orderDirection)
        .then(({ results: tags }) => ({
            ...data,
            results: data.results.map(row => ({ ...row, tags: tags[row.id] || [] }))
        }))
        .catch(() => ({
            ...data,
            results: data.results.map(row => ({
                ...row,
                tags: []
            }))
        }));
    }

    return data;
};

export const constructTags = (tagFilters) => {
    return flatMap(
        tagFilters,
        ({ values, category: namespace }) => values.map(({ value: tagValue, tagKey }) => (
            `${namespace ? `${namespace}/` : ''}${tagKey}${tagValue ? `=${tagValue}` : ''}`
        ))
    ) || '';
};

export const calculateSystemProfile = ({ osFilter, rhcdFilter, updateMethodFilter }) => {
    let systemProfile = {};
    const osFilterValues = Array.isArray(osFilter) ? osFilter : Object.values(osFilter || {})
    .flatMap((majorOsVersion) => Object.keys(majorOsVersion));

    if (osFilterValues?.length > 0) {
        systemProfile.operating_system = {
            RHEL: {
                version: {
                    eq: osFilterValues
                }
            }
        };
    }

    if (rhcdFilter) {
        systemProfile[RHCD_FILTER_KEY] = rhcdFilter;
    }

    if (updateMethodFilter) {
        systemProfile[UPDATE_METHOD_KEY] =  {
            eq: updateMethodFilter
        };
    }

    return generateFilter({ system_profile: systemProfile });
};

export const filtersReducer = (acc, filter = {}) => ({
    ...acc,
    ...filter.value === 'hostname_or_id' && { hostnameOrId: filter.filter },
    ...'tagFilters' in filter && { tagFilters: filter.tagFilters },
    ...'staleFilter' in filter && { staleFilter: filter.staleFilter },
    ...'registeredWithFilter' in filter && { registeredWithFilter: filter.registeredWithFilter },
    ...'osFilter' in filter && { osFilter: filter.osFilter },
    ...'rhcdFilter' in filter && { rhcdFilter: filter.rhcdFilter },
    ...'lastSeenFilter' in filter && { lastSeenFilter: filter.lastSeenFilter },
    ...'updateMethodFilter' in filter && { updateMethodFilter: filter.updateMethodFilter },
    ...'groupHostFilter' in filter && { groupHostFilter: filter.groupHostFilter }
});

export async function getEntities(items, {
    controller,
    hasItems,
    filters,
    per_page: perPage,
    page,
    orderBy,
    orderDirection,
    fields = { system_profile: ['operating_system', /* needed by inventory groups */ 'system_update_method'] },
    ...options
}, showTags) {

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
            { cancelToken: controller && controller.token }
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
                        cancelToken: controller && controller.token,
                        query: generateFilter(fields, 'fields')
                    }
                );

                data = {
                    ...data,
                    results: mergeArraysByKey([
                        data?.results,
                        result?.results || []
                    ], 'id')
                };
            } catch (e) {
                console.error(e); // eslint-disable-line
            }
        }

        data = showTags ? await mapTags(data) : data;

        data = {
            ...data,
            filters,
            results: data.results.map(result => mapData({
                ...result,
                display_name: result.display_name || result.fqdn || result.id
            }))
        };

        return data;
    } else if (!hasItems) {
        return hosts.apiHostGetHostList(
            undefined,
            undefined,
            filters.hostnameOrId,
            undefined,
            undefined,
            undefined,
            undefined,
            perPage,
            page,
            orderBy,
            orderDirection,
            filters.staleFilter,
            [
                ...constructTags(filters?.tagFilters),
                ...options?.globalFilter?.tags || []
            ],
            filters?.registeredWithFilter,
            undefined,
            undefined,
            {
                cancelToken: controller && controller.token,
                query: {
                    ...(options?.globalFilter?.filter && generateFilter(options.globalFilter.filter)),
                    ...(options.filter && Object.keys(options.filter).length && generateFilter(options.filter)),
                    ...(calculateSystemProfile(filters)),
                    ...(fields && Object.keys(fields).length && generateFilter(fields, 'fields')),
                    ...filters?.lastSeenFilter?.updatedStart && { updated_start: filters.lastSeenFilter.updatedStart },
                    ...filters?.lastSeenFilter?.updatedEnd && { updated_end: filters.lastSeenFilter.updatedEnd }
                }
            }
        )
        .then((data) => showTags ? mapTags(data, { orderBy, orderDirection }) : data)
        .then(({ results = [], ...data } = {}) => ({
            ...data,
            filters,
            results: results.map(result => mapData({
                ...result,
                display_name: result.display_name || result.fqdn || result.id
            }))
        }));
    }

    return {
        page,
        per_page: perPage,
        results: []
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

export function getOperatingSystems(params = []) {
    return systemProfile.apiSystemProfileGetOperatingSystem(...params);
}
