import { ACTION_TYPES, CLEAR_NOTIFICATIONS } from './constants';
import { getEntity, hosts } from './api';

export const deleteEntity = (id, displayName) => ({
    type: ACTION_TYPES.REMOVE_ENTITY,
    payload: hosts.apiHostDeleteById([id]),
    meta: {
        notifications: {
            fulfilled: {
                variant: 'success',
                title: 'Delete operation finished',
                description: `Removing of ${displayName} has been successfully finished.`,
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
