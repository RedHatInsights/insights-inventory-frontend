import { ACTION_TYPES } from '../constants';
import { mergeArraysByKey } from '@redhat-cloud-services/frontend-components-utilities/files/helpers';
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/files/ReducerRegistry';
import GeneralInformation, {
    systemProfileStore
} from '@redhat-cloud-services/frontend-components-inventory-general-info';
import Vulnerabilities from '@redhat-cloud-services/frontend-components-inventory-vulnerabilities';
import Compliance from '@redhat-cloud-services/frontend-components-inventory-compliance';
import Advisor from '@redhat-cloud-services/frontend-components-inventory-insights';
import { notifications } from '@redhat-cloud-services/frontend-components-notifications';

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
            { title: 'General Information', name: 'general_information', component: GeneralInformation },
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
            }
        ].filter(Boolean)
    };
}

let reducers = {
    notifications,
    systemProfileStore
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
