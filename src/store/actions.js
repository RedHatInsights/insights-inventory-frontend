import { ACTION_TYPES, CLEAR_NOTIFICATIONS, SET_INVENTORY_FILTER, SET_PAGINATION,
    CLEAR_ENTITIES } from './action-types';
import { hosts, getEntitySystemProfile } from '../api';
export * from './system-issues-actions';
export * from './inventory-actions';

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

export const setFilter = (filtersList) => ({
    type: SET_INVENTORY_FILTER,
    payload: {
        filtersList
    }
});

export const clearNotifications = () => {
    return ({
        type: CLEAR_NOTIFICATIONS
    });
};

export const editDisplayName = (id, value, origValue) => ({
    type: ACTION_TYPES.UPDATE_DISPLAY_NAME,
    payload: hosts.apiHostPatchById([id], { display_name: value }), // eslint-disable-line camelcase
    meta: {
        id,
        value,
        origValue,
        notifications: {
            fulfilled: {
                variant: 'success',
                title: `Display name for entity with ID ${id} has been changed to ${value}`,
                dismissable: true
            }
        }
    }
});

export const setPagination = (page, perPage) => ({
    type: SET_PAGINATION,
    payload: {
        page, perPage
    }
});

export const systemProfile = (itemId) => ({
    type: ACTION_TYPES.LOAD_SYSTEM_PROFILE,
    payload: getEntitySystemProfile(itemId, {})
});

export const editAnsibleHost = (id, value, origValue) => ({
    type: ACTION_TYPES.SET_ANSIBLE_HOST,
    payload: hosts.apiHostPatchById([id], { ansible_host: value }), // eslint-disable-line camelcase
    meta: {
        id,
        value,
        origValue,
        notifications: {
            fulfilled: {
                variant: 'success',
                title: 'Ansible hostname has been updated',
                dismissable: true
            }
        }
    }
});

export const clearEntitiesAction = () => ({
    type: CLEAR_ENTITIES,
    payload: []
});
