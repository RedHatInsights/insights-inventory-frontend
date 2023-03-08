import {
    ACTION_TYPES,
    SELECT_ENTITY,
    CHANGE_SORT,
    FILTER_ENTITIES,
    FILTER_SELECT,
    UPDATE_ENTITIES,
    ENTITIES_LOADING,
    CLEAR_FILTERS,
    TOGGLE_TAG_MODAL,
    CONFIG_CHANGED,
    TOGGLE_DRAWER
} from './action-types';
import {
    getEntities as defaultGetEntities,
    getEntitySystemProfile,
    hosts,
    getAllTags as defaultGetAllTags,
    getTags,
    filtersReducer,
    getOperatingSystems
} from '../api';
import { getGroupDetail, getGroups } from '../components/InventoryGroups/utils/api';

export const loadEntities = (items = [], { filters, ...config }, { showTags } = {}, getEntities = defaultGetEntities) => {
    const itemIds = items.reduce((acc, curr) => (
        [
            ...acc,
            curr && typeof curr === 'string' ? curr : curr.id
        ]
    ), []).filter(Boolean);

    const isFilterDisabled = (name) => config.hideFilters?.[name] ||
    (config.hideFilters?.all && config.hideFilters?.[name] !== false);

    const updatedFilters = filters ? filters.reduce(filtersReducer, {
        ...filters.length === 0 && { registeredWithFilter: [] },
        ...(isFilterDisabled('stale') && { staleFilter: undefined }),
        ...(isFilterDisabled('registeredWith') && { registeredWithFilter: undefined }),
        ...(isFilterDisabled('operating_system') && { osFilter: undefined }),
        ...(isFilterDisabled('host_group')) && { groupHostFilter: undefined }
    }) : {
        ...(isFilterDisabled('stale') && { staleFilter: undefined }),
        ...(isFilterDisabled('last_seen') && { lastSeenFilter: undefined }),
        ...(isFilterDisabled('registeredWith') && { registeredWithFilter: undefined }),
        ...(isFilterDisabled('operating_system') && { osFilter: undefined }),
        ...(isFilterDisabled('host_group')) && { groupHostFilter: undefined }
    };

    const orderBy = config.orderBy || 'updated';
    const orderDirection = config.orderDirection || 'DESC';

    const lastDateRequest = Date.now();

    return {
        type: ACTION_TYPES.LOAD_ENTITIES,
        payload: getEntities(itemIds, {
            filters: updatedFilters,
            ...config,
            orderBy,
            orderDirection
        }, showTags, defaultGetEntities).then(({ results, ...data }) => ({
            ...data,
            filters,
            sortBy: { key: orderBy, direction: orderDirection },
            results: items.length > 0 ? items.map((item) => ({
                ...item.id ? item : { id: item },
                ...results.find(({ id }) => id === item || id === item.id) || {}
            })) : results,
            page: config.page || (data?.page),
            // eslint-disable-next-line camelcase
            per_page: config.per_page || (data?.per_page),
            hideFilters: config.hideFilters
        })),
        meta: {
            showTags,
            lastDateRequest
        }
    };
};

export const updateEntities = (items = []) => ({
    type: UPDATE_ENTITIES,
    payload: {
        results: items
    }
});

export const filterSelect = (selectedItem) => ({
    type: FILTER_SELECT,
    payload: selectedItem
});

export const loadEntity = (id, config, { showTags }) => ({
    type: ACTION_TYPES.LOAD_ENTITY,
    payload: defaultGetEntities(id, config, showTags),
    meta: {
        showTags
    }
});

export const selectEntity = (id, selected) => ({
    type: SELECT_ENTITY,
    payload: { id, selected }
});

export const setSort = (data) => ({
    type: CHANGE_SORT,
    payload: data
});

export const filterEntities = (key, filterString) => ({
    type: FILTER_ENTITIES,
    payload: { key, filterString }
});

export const entitiesLoading = (isLoading = true) => ({
    type: ENTITIES_LOADING,
    payload: { isLoading }
});

export const clearFilters = () => ({
    type: CLEAR_FILTERS
});

export const systemProfile = (itemId) => ({
    type: ACTION_TYPES.LOAD_SYSTEM_PROFILE,
    payload: getEntitySystemProfile(itemId, {})
});

export const editDisplayName = (id, value) => ({
    type: ACTION_TYPES.SET_DISPLAY_NAME,
    payload: hosts.apiHostPatchHost(id, { display_name: value }), // eslint-disable-line camelcase
    meta: {
        notifications: {
            fulfilled: {
                variant: 'success',
                title: 'Display name has been updated',
                dismissable: true
            }
        }
    }
});

export const editAnsibleHost = (id, value) => ({
    type: ACTION_TYPES.SET_ANSIBLE_HOST,
    payload: hosts.apiHostPatchHost(id, { ansible_host: value }), // eslint-disable-line camelcase
    meta: {
        notifications: {
            fulfilled: {
                variant: 'success',
                title: 'Ansible hostname has been updated',
                dismissable: true
            }
        }
    }
});

export const loadTags = (systemId, search, options, count) => ({
    type: ACTION_TYPES.LOAD_TAGS,
    payload: getTags(systemId, search, options),
    meta: {
        tagsCount: count,
        systemId
    }
});

export const toggleTagModal = (isOpen) => ({
    type: TOGGLE_TAG_MODAL,
    payload: { isOpen }
});

export const fetchAllTags = (search, pagination, getTags = defaultGetAllTags) => ({
    type: ACTION_TYPES.ALL_TAGS,
    payload: getTags(search, pagination),
    meta: { lastDateRequestTags: Date.now() }
});

export const fetchGroups = (search, pagination) => ({
    type: ACTION_TYPES.GROUPS,
    payload: getGroups(search, pagination)
});

export const fetchGroupDetail = (groupId) => ({
    type: ACTION_TYPES.GROUP_DETAIL,
    payload: getGroupDetail(groupId)
});

export const fetchOperatingSystems = (params = []) => ({
    type: ACTION_TYPES.OPERATING_SYSTEMS,
    payload: getOperatingSystems(params)
});

export const deleteEntity = (systems, displayName) => ({
    type: ACTION_TYPES.REMOVE_ENTITY,
    payload: hosts.apiHostDeleteById(systems),
    meta: {
        notifications: {
            fulfilled: {
                variant: 'success',
                title: 'Delete operation finished',
                description: `${displayName} has been successfully removed.`,
                dismissable: true
            }
        },
        systems
    }
});

export const configChanged = (config) => ({
    type: CONFIG_CHANGED,
    payload: config
});

export const toggleDrawer = (isOpened) => ({
    type: TOGGLE_DRAWER,
    payload: { isOpened }
});
