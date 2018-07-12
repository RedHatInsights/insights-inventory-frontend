import { ACTION_TYPES } from './constants';
import { getEntities } from './api';

export const loadEntities = () => ({
    type: ACTION_TYPES.LOAD_ENTITIES,
    payload: getEntities()
});
