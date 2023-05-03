import { createContext } from 'react';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { INVENTORY_WRITE_PERMISSIONS } from '../constants';

export const TEXT_FILTER = 'hostname_or_id';
export const TEXTUAL_CHIP = 'textual';
export const TAG_CHIP = 'tags';
export const STALE_CHIP = 'staleness';
export const REGISTERED_CHIP = 'registered_with';
export const OS_CHIP = 'operating_system';
export const RHCD_FILTER_KEY = 'rhc_client_id';
export const UPDATE_METHOD_KEY = 'system_update_method';
export const LAST_SEEN_CHIP = 'last_seen';
export const HOST_GROUP_CHIP = 'host_group';

export function subtractDate(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString();
}

export const staleness = [
    { label: 'Fresh', value: 'fresh' },
    { label: 'Stale', value: 'stale' },
    { label: 'Stale warning', value: 'stale_warning' },
    { label: 'Unknown', value: 'unknown' }
];

export const currentDate = new Date().toISOString();
export const lastSeenItems = [
    {
        value: { updatedStart: subtractDate(1), updatedEnd: currentDate, mark: 'last24' },
        label: 'Within the last 24 hours'    },
    {
        value: {  updatedEnd: subtractDate(1), mark: '24more' },
        label: 'More than 1 day ago'

    },
    {
        value: { updatedEnd: subtractDate(7), mark: '7more' },
        label: 'More than 7 days ago'
    },
    {
        value: { updatedEnd: subtractDate(15), mark: '15more' },
        label: 'More than 15 days ago'
    },
    {
        value: { updatedEnd: subtractDate(30), mark: '30more' },
        label: 'More than 30 days ago'
    }
    //Temporarily disabled
    // {
    //     value: { mark: 'custom' },
    //     label: 'Custom'
    // }
];
export const registered = [
    { label: 'insights-client', value: 'puptoo', idName: 'Insights id', idValue: 'insights_id' },
    { label: 'subscription-manager', value: 'rhsm-conduit',
        idName: 'Subscription manager id', idValue: 'subscription_manager_id' },
    { label: 'Satellite/Discovery', value: 'yupana' },
    { label: 'insights-client not connected', value: '!puptoo' }
];
export const InventoryContext = createContext({});

export const rhcdOptions = [
    { label: 'Active', value: 'not_nil' },
    { label: 'Inactive', value: 'nil' }
];

export const updateMethodOptions = [
    { label: 'yum', value: 'yum' },
    { label: 'dnf', value: 'dnf' },
    { label: 'rpm-ostree', value: 'rpm-ostree' }
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

        const foundKey = ['staleFilter', 'registeredWithFilter', 'osFilter', 'rhcdFilter', 'updateMethodFilter',
            'lastSeenFilter', '']
        .find(item => Object.keys(oneFilter).includes(item));

        return {
            ...acc,
            ...foundKey && { [foundKey]: oneFilter[foundKey] }
        };
    }, {
        textFilter: '',
        tagFilters: {}
    });
}

export const reloadWrapper = (event, callback) => {
    event.payload.then(data => {
        callback();
        return data;
    });

    return event;
};

export const isEmpty = (check) => !check || check?.length === 0;

export const generateFilter = (status,
    source,
    tagsFilter,
    filterbyName,
    operatingSystem,
    rhcdFilter,
    updateMethodFilter,
    hostGroup,
    lastSeenFilter
) => ([
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
    },
    !isEmpty(rhcdFilter) && {
        rhcdFilter: Array.isArray(rhcdFilter) ? rhcdFilter : [rhcdFilter]
    },
    !isEmpty(lastSeenFilter) && {
        lastSeenFilter: Array.isArray(lastSeenFilter)
            ? lastSeenItems.filter((item)=> item.value.mark === lastSeenFilter[0])[0].value : [lastSeenFilter]
    },
    !isEmpty(updateMethodFilter) && {
        updateMethodFilter: Array.isArray(updateMethodFilter) ? updateMethodFilter : [updateMethodFilter]
    },
    !isEmpty(hostGroup) && {
        hostGroupFilter: Array.isArray(hostGroup) ? hostGroup : [hostGroup]
    }
].filter(Boolean));

export const useWritePermissions = () => {
    const { hasAccess } = usePermissionsWithContext(INVENTORY_WRITE_PERMISSIONS);

    return hasAccess;
};

export const allStaleFilters = ['fresh', 'stale', 'stale_warning', 'unknown'];
