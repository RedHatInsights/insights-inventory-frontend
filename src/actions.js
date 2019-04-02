import { ACTION_TYPES, CLEAR_NOTIFICATIONS } from './constants';
import { getEntity, getEntities } from './api';

export const loadEntities = (config) => {
    return ({
        type: ACTION_TYPES.GET_ENTITIES,
        payload: getEntities(config).then(({ results }) => ({ results }))
    });
};

export const loadEntity = id => ({
    type: ACTION_TYPES.GET_ENTITY,
    payload: getEntity(id)
});

export const addAlert = ({ title, dismissible = false, variant = 'warning' }) => ({
    type: ACTION_TYPES.ALERT_ADD,
    payload: { title, dismissible, variant }
});

export const dismissAlert = (alert, timeout = false) => ({
    type: ACTION_TYPES.ALERT_DISMISS,
    alert,
    timeout
});

export const clearNotifications = () => {
    return ({
        type: CLEAR_NOTIFICATIONS
    });
};
