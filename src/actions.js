import { ACTION_TYPES } from './constants';
import { getEntity, getEntities } from './api';

export const loadEntities = () => ({
    type: ACTION_TYPES.LOAD_ENTITIES,
    payload: getEntities()
});

export const loadEntity = id => ({
    type: ACTION_TYPES.LOAD_ENTITY,
    payload: getEntity(id)
});
