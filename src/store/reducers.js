import { ACTION_TYPES } from '../constants';
import { applyReducerHash } from '@red-hat-insights/insights-frontend-components/Utilities/ReducerRegistry';

const reducers = {
    entities: applyReducerHash({
        [ACTION_TYPES.LOAD_ENTITIES_PENDING]: (state) => ({
            ...state,
            loaded: false
        }),

        [ACTION_TYPES.LOAD_ENTITIES_FULFILLED]: (state, action) => ({
            ...state,
            loaded: true,
            entities: action.payload
        })
    }, {
        loaded: false
    }),

    entityDetails: applyReducerHash({
        [ACTION_TYPES.LOAD_ENTITY_PENDING]: (state) => ({
            ...state,
            loaded: false
        }),

        [ACTION_TYPES.LOAD_ENTITY_FULFILLED]: (state, action) => ({
            ...state,
            loaded: true,
            entity: action.payload
        })
    }, {
        loaded: false
    })
};

export default reducers;
