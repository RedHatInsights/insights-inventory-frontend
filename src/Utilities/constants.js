import { createContext } from 'react';
import { loadEntities } from '../store/actions';
export const TEXT_FILTER = 'hostname_or_id';
export const TEXTUAL_CHIP = 'textual';
export const TAG_CHIP = 'tags';
export const STALE_CHIP = 'staleness';
export const REGISTERED_CHIP = 'registered_with';
export const OS_CHIP = 'operating_system';
export const staleness = [
    { label: 'Fresh', value: 'fresh' },
    { label: 'Stale', value: 'stale' },
    { label: 'Stale warning', value: 'stale_warning' }
];
export const registered = [{ label: 'Insights', value: 'insights' }, { label: 'Insights not connected', value: 'nil' }];
export const InventoryContext = createContext({});
export const defaultFilters = {
    staleFilter: ['fresh', 'stale']
};

export const operatingSystems = [
    {
        label: 'RHEL 9.0',
        value: '9.0'
    },
    {
        label: 'RHEL 8.6',
        value: '8.6'
    },
    {
        label: 'RHEL 8.5',
        value: '8.5'
    },
    {
        label: 'RHEL 8.4',
        value: '8.4'
    },
    {
        label: 'RHEL 8.3',
        value: '8.3'
    },
    {
        label: 'RHEL 8.2',
        value: '8.2'
    },
    {
        label: 'RHEL 8.1',
        value: '8.1'
    },
    {
        label: 'RHEL 8.0',
        value: '8.0'
    },
    {
        label: 'RHEL 7.9',
        value: '7.9'
    },
    {
        label: 'RHEL 7.8',
        value: '7.8'
    },
    {
        label: 'RHEL 7.7',
        value: '7.7'
    },
    {
        label: 'RHEL 7.6',
        value: '7.6'
    },
    {
        label: 'RHEL 7.5',
        value: '7.5'
    },
    {
        label: 'RHEL 7.4',
        value: '7.4'
    },
    {
        label: 'RHEL 7.3',
        value: '7.3'
    },
    {
        label: 'RHEL 7.2',
        value: '7.2'
    },
    {
        label: 'RHEL 7.1',
        value: '7.1'
    },
    {
        label: 'RHEL 7.0',
        value: '7.0'
    },
    {
        label: 'RHEL 6.10',
        value: '6.10'
    },
    {
        label: 'RHEL 6.9',
        value: '6.9'
    },
    {
        label: 'RHEL 6.8',
        value: '6.8'
    },
    {
        label: 'RHEL 6.7',
        value: '6.7'
    },
    {
        label: 'RHEL 6.6',
        value: '6.6'
    },
    {
        label: 'RHEL 6.5',
        value: '6.5'
    },
    {
        label: 'RHEL 6.4',
        value: '6.4'
    },
    {
        label: 'RHEL 6.3',
        value: '6.3'
    },
    {
        label: 'RHEL 6.2',
        value: '6.2'
    },
    {
        label: 'RHEL 6.1',
        value: '6.1'
    },
    {
        label: 'RHEL 6.0',
        value: '6.0'
    }
];

export function filterToGroup(filter = [], valuesKey = 'values') {
    return filter.reduce((accGroup, group) => ({
        ...accGroup,
        [group.key]: group[valuesKey].reduce((acc, curr) => ({ ...acc, [curr.key]: {
            isSelected: true,
            group: curr.group,
            item: {
                meta: {
                    tag: {
                        key: curr.tagKey,
                        value: curr.value
                    }
                }
            }
        } }), {})
    }), {});
}

export const arrayToSelection = (selected) => selected.reduce((acc, { cells: [key, value, namespace] }) => ({
    ...acc,
    [namespace]: {
        ...acc[namespace?.title || namespace],
        [key?.title || key]: {
            isSelected: true,
            group: { value: namespace?.title || namespace, label: namespace?.title || namespace },
            item: {
                value: key?.title || key,
                meta: { tag: { key: key?.title || key, value: value?.title || value } }
            }
        }
    }
}), {});

export function reduceFilters(filters = []) {
    return filters.reduce((acc, oneFilter) => {
        if (oneFilter.value === TEXT_FILTER) {
            return { ...acc, textFilter: oneFilter.filter };
        } else if ('tagFilters' in oneFilter) {
            return {
                ...acc,
                tagFilters: filterToGroup(oneFilter.tagFilters)
            };
        }

        const foundKey = ['staleFilter', 'registeredWithFilter', 'osFilter', '']
        .find(item => Object.keys(oneFilter).includes(item));

        return {
            ...acc,
            ...foundKey && { [foundKey]: oneFilter[foundKey] }
        };
    }, {
        textFilter: '',
        tagFilters: {},
        ...defaultFilters
    });
}

export const loadSystems = (options, showTags, getEntities) => {
    const limitedItems = options?.items?.length > options.per_page ? options?.items?.slice(
        (options?.page - 1) * options.per_page, options?.page * options.per_page
    ) : options?.items;

    const config = {
        ...options.hasItems && {
            sortBy: options?.sortBy?.key,
            orderDirection: options?.sortBy?.direction?.toUpperCase()
        },
        ...options,
        filters: options?.filters || options?.activeFilters,
        orderBy: options?.orderBy || options?.sortBy?.key,
        orderDirection: options?.orderDirection?.toUpperCase() || options?.sortBy?.direction?.toUpperCase(),
        ...limitedItems?.length > 0 && {
            itemsPage: options?.page,
            page: 1
        }
    };

    return loadEntities(limitedItems, config, { showTags }, getEntities);
};

export const reloadWrapper = (event, callback) => {
    event.payload.then(data => {
        callback();
        return data;
    });

    return event;
};

export const isEmpty = (check) => !check || check?.length === 0;

export const generateFilter = (status, source, tagsFilter, filterbyName, operatingSystem) => ([
    !isEmpty(status) && {
        staleFilter: Array.isArray(status) ? status : [status]
    },
    !isEmpty(tagsFilter) && {
        tagFilters: Array.isArray(tagsFilter) ? tagsFilter : [tagsFilter]
    },
    !isEmpty(source) && {
        registeredWithFilter: Array.isArray(source) ? source : [source]
    },
    !isEmpty(filterbyName) && {
        value: 'hostname_or_id',
        filter: Array.isArray(filterbyName) ? filterbyName[0] : filterbyName
    },
    (!isEmpty(status) || !isEmpty(tagsFilter) || !isEmpty(filterbyName)) && isEmpty(source) && {
        registeredWithFilter: []
    },
    (!isEmpty(source) || !isEmpty(tagsFilter) || !isEmpty(filterbyName)) && isEmpty(status) && {
        staleFilter: []
    },
    !isEmpty(operatingSystem) && {
        osFilter: Array.isArray(operatingSystem) ? operatingSystem : [operatingSystem]
    }
].filter(Boolean));
