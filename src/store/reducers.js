import pickBy from 'lodash/pickBy';
import mapValues from 'lodash/mapValues';

import { ACTION_TYPES } from '../constants';
import { applyReducerHash } from '@red-hat-insights/insights-frontend-components/Utilities/ReducerRegistry';

let alertIdGenerator = 0;

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
    }),

    alerts: applyReducerHash({
        [ACTION_TYPES.ALERT_ADD]: (state, { payload }) =>
            ([...state, { id: alertIdGenerator++, ...payload }]),
        [ACTION_TYPES.ALERT_DISMISS]: (state, action) => state.filter(alert => alert.id !== action.alert.id),

        // map every rejected action to an alert
        ...mapValues(
            pickBy(ACTION_TYPES, (type => type.endsWith('_REJECTED'))),
            () => (state, action) =>
                ([...state, { title: action.payload.message, id: alertIdGenerator++, dismissible: true, variant: 'warning' }])
        )
    }, [])
};

export default reducers;
