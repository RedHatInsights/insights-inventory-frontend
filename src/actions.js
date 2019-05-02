import { ACTION_TYPES, CLEAR_NOTIFICATIONS } from './constants';
import { getEntity } from './api';

export const loadEntity = () => ({
    type: ACTION_TYPES.GET_ENTITY,
    payload: getEntity()
});

export const clearNotifications = () => {
    return ({
        type: CLEAR_NOTIFICATIONS
    });
};
