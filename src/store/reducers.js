import { ACTION_TYPES } from '../constants';
import { mergeArraysByKey } from '@redhat-cloud-services/frontend-components-utilities/files/helpers';
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/files/ReducerRegistry';
import GeneralInformation, {
    systemProfileStore
} from '@redhat-cloud-services/frontend-components-inventory-general-info';
import Vulnerabilities from '@redhat-cloud-services/frontend-components-inventory-vulnerabilities';
import Advisor from '@redhat-cloud-services/frontend-components-inventory-insights';
import { notifications } from '@redhat-cloud-services/frontend-components-notifications';
import ComplianceTab from '../components/inventory/Compliance';

const defaultState = { loaded: false, selected: {} };

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
                title: 'Vulnerability',
                name: 'vulnerabilities',
                component: Vulnerabilities
            },
            isEntitled(entitlements && entitlements.smart_management) && {
                title: 'Compliance',
                name: 'compliance',
                component: ComplianceTab
            }
        ].filter(Boolean)
    };
}

function entitySelected(state, { payload }) {
    const selected = state.selected || {};
    if (payload.id === 0) {
        state.rows.map(row => {
            selected[row.id] = payload.selected;
        });
    } else {
        selected[payload.id] = payload.selected;
    }

    return {
        ...state,
        selected
    };
}

function onEntitiesLoaded(state, { payload }) {
    return {
        ...state,
        rows: mergeArraysByKey([state.rows, payload.results.map(result => {
            return {
                ...result,
                selected: Object.keys(state.selected || {})
                .find(selectedRow => selectedRow === result.id && state.selected[selectedRow])
            };
        })])
    };
}

let reducers = {
    notifications,
    systemProfileStore
};

export const entitiesReducer = ({ LOAD_ENTITIES_FULFILLED }) => applyReducerHash(
    {
        [ACTION_TYPES.GET_ENTITIES_FULFILLED]: entitiesLoaded,
        [LOAD_ENTITIES_FULFILLED]: onEntitiesLoaded,
        SELECT_ENTITY: entitySelected,
        FILTER_SELECT: (state) => ({ ...state, selected: {} })
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
