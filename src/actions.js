import { ACTION_TYPES, CLEAR_NOTIFICATIONS } from './constants';
import { getEntity, hosts } from './api';

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
        }
    }
});

export const loadEntity = () => ({
    type: ACTION_TYPES.GET_ENTITY,
    payload: getEntity()
});

export const clearNotifications = () => {
    return ({
        type: CLEAR_NOTIFICATIONS
    });
};

export const editDisplayName = (id, value) => ({
    type: ACTION_TYPES.UPDATE_DISPLAY_NAME,
    payload: hosts.apiHostPatchById([id], { display_name: value }), // eslint-disable-line camelcase
    meta: {
        notifications: {
            fulfilled: {
                variant: 'success',
                title: `Display name for entity with ID ${id} has been changed to ${value}`,
                dismissable: true
            }
        }
    }
});
