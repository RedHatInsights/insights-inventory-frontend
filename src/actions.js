import { ACTION_TYPES } from './constants';
import { getEntity, getEntities } from './api';

export const loadEntities = (config) => {
    return ({
        type: ACTION_TYPES.GET_ENTITIES,
        payload: getEntities(config).then(data => (data.items || data))
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
