import pickBy from 'lodash/pickBy';
import mapValues from 'lodash/mapValues';

import { ACTION_TYPES } from '../constants';
import { applyReducerHash } from '@red-hat-insights/insights-frontend-components/Utilities/ReducerRegistry';
import { mergeArraysByKey } from '@red-hat-insights/insights-frontend-components/Utilities/helpers';
import {
    mergeWithDetail,
    mergeWithEntities,
    ASYNC_ACTIONS,
    Overview,
    GeneralInformation
} from '@red-hat-insights/insights-frontend-components';
let alertIdGenerator = 0;

function entitiesLoaded(state, { payload }) {
    return {
        ...state,
        rows: mergeArraysByKey([state.rows, payload]),
        entities: mergeArraysByKey([state.entities, payload])
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
            { title: 'Overview', name: 'overview', component: Overview },
            { title: 'Vulnerabilities', name: 'vulnerabilities' },
            { title: 'Configuration Assessment', name: 'configuration_assessment' },
            { title: 'Compliance', name: 'compliance' },
            { title: 'Cost Managemenet', name: 'cost_management' },
            { title: 'General Information', name: 'general_information', component: GeneralInformation }
        ]
    };
}

const reducers = {
    ...mergeWithEntities(applyReducerHash({
        [ACTION_TYPES.GET_ENTITIES_FULFILLED]: entitiesLoaded
    },
    {
        loaded: false
    })),
    ...mergeWithDetail(applyReducerHash({
        [ASYNC_ACTIONS.LOAD_ENTITY_FULFILLED]: enableApplications,
        [ACTION_TYPES.GET_ENTITY_FULFILLED]: entityLoaded
    },
    {
        loaded: false
    })),
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
