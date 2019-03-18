import pickBy from 'lodash/pickBy';
import mapValues from 'lodash/mapValues';

import { ACTION_TYPES } from '../constants';
import { applyReducerHash } from '@red-hat-insights/insights-frontend-components/Utilities/ReducerRegistry';
import { mergeArraysByKey } from '@red-hat-insights/insights-frontend-components/Utilities/helpers';
import {
    GeneralInformation,
    Vulnerabilities,
    Compliance,
    Advisor
} from '@red-hat-insights/insights-frontend-components';

let alertIdGenerator = 0;

const defaultState = { loaded: false };

function entitiesLoaded(state, { payload }) {
    return {
        ...state,
        rows: mergeArraysByKey([state.rows, payload.results]),
        entities: mergeArraysByKey([state.entities, payload.results])
    };
}

function entityLoaded(state, { payload }) {
    const { health, tags, ...rest } = payload;
    return {
        ...state,
        health,
        tags,
        entity: {
            ...state.entity,
            ...rest
        }
    };
}

function enableApplications(state) {
    return {
        ...state,
        loaded: true,
        activeApps: [
            { title: 'Vulnerabilities', name: 'vulnerabilities', component: Vulnerabilities },
            { title: 'Insights', name: 'insights', component: Advisor },
            { title: 'Compliance', name: 'compliance', component: Compliance },
            { title: 'General Information', name: 'general_information', component: GeneralInformation }
        ]
    };
}

let reducers = {
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

export const entitiesReducer = applyReducerHash(
    {
        [ACTION_TYPES.GET_ENTITIES_FULFILLED]: entitiesLoaded
    },
    defaultState
);

export const entitesDetailReducer = (INVENTORY_ACTION_TYPES) => applyReducerHash(
    {
        [INVENTORY_ACTION_TYPES.LOAD_ENTITY_FULFILLED]: enableApplications,
        [ACTION_TYPES.GET_ENTITY_FULFILLED]: entityLoaded
    },
    defaultState
);

export default reducers;
