import { ACTION_TYPES } from '../constants';
import { applyReducerHash } from '@red-hat-insights/insights-frontend-components/Utilities/ReducerRegistry';
import { mergeArraysByKey } from '@red-hat-insights/insights-frontend-components/Utilities/helpers';
import {
    GeneralInformation,
    Vulnerabilities,
    Compliance,
    Advisor
} from '@red-hat-insights/insights-frontend-components';
import { notifications } from '@red-hat-insights/insights-frontend-components/components/Notifications';

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
            { title: 'Rules', name: 'rules', component: Advisor },
            { title: 'Vulnerabilities', name: 'vulnerabilities', component: Vulnerabilities },
            { title: 'Compliance', name: 'compliance', component: Compliance },
            { title: 'General Information', name: 'general_information', component: GeneralInformation }
        ]
    };
}

let reducers = {
    notifications
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
