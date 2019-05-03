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

const isEntitled = (service) => {
    if (window.sessionStorage.getItem('disableEntitlements') === 'true') {
        return true;
    }

    return service && service.is_entitled;
};

function entitiesLoaded(state, { payload }) {
    return {
        ...state,
        rows: mergeArraysByKey([state.rows, payload.results]),
        entities: mergeArraysByKey([state.entities, payload.results])
    };
}

function entityLoaded(state, { payload: { entitlements } } = { payload: {} }) {
    return {
        ...state,
        loaded: true,
        activeApps: [
            isEntitled(entitlements && entitlements.insights) && { title: 'Insights', name: 'insights', component: Advisor },
            isEntitled(entitlements && entitlements.smart_management) && {
                title: 'Vulnerabilities',
                name: 'vulnerabilities',
                component: Vulnerabilities
            },
            isEntitled(entitlements && entitlements.smart_management) && {
                title: 'Compliance',
                name: 'compliance',
                component: Compliance
            },
            { title: 'General Information', name: 'general_information', component: GeneralInformation }
        ].filter(Boolean)
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

export const entitesDetailReducer = () => applyReducerHash(
    {
        [ACTION_TYPES.GET_ENTITY_FULFILLED]: entityLoaded
    },
    defaultState
);

export default reducers;
