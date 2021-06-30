import { ACTION_TYPES, SELECT_ENTITY, SET_INVENTORY_FILTER, SET_PAGINATION } from '../constants';
import systemProfileStore from './systemProfileStore';
import {
    ComplianceTab,
    VulnerabilityTab,
    AdvisorTab,
    GeneralInformationTab,
    PatchTab,
    RosTab
} from '../components/SystemDetails';
import { applyReducerHash } from '@redhat-cloud-services/frontend-components-utilities/ReducerRegistry';
import { mergeArraysByKey } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { notificationsReducer } from '@redhat-cloud-services/frontend-components-notifications/redux';

import permissionsReducer from './permissions/reducer';

const defaultState = { loaded: false, selected: new Map() };

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

    const hasRosCookie = insights.chrome.visibilityFunctions.isProd() ?
        insights.chrome.visibilityFunctions.hasCookie('cs_ros_beta_enable', '1') : true;

    return {
        ...state,
        loaded: true,
        activeApps: [
            { title: 'General information', name: 'general_information', component: GeneralInformationTab },
            isEntitled(entitlements && entitlements.insights) && { title: 'Advisor', name: 'advisor', component: AdvisorTab },
            isEntitled(entitlements && entitlements.insights) && {
                title: 'Vulnerability',
                name: 'vulnerabilities',
                component: VulnerabilityTab
            },
            isEntitled(entitlements && entitlements.insights) && {
                title: 'Compliance',
                name: 'compliance',
                component: ComplianceTab
            },
            isEntitled(entitlements && entitlements.insights) && {
                title: 'Patch',
                name: 'patch',
                component: PatchTab
            },
            isEntitled(entitlements && entitlements.insights) && hasRosCookie && {
                title: 'Resource Optimization',
                name: 'ros',
                component: RosTab
            }

        ].filter(Boolean)
    };
}

function entitySelected(state, { payload }) {
    const selected = state.selected || (new Map());
    if (payload.selected) {
        if (payload.id === 0) {
            state.rows.forEach(row => selected.set(row.id, row));
        } else {
            const selectedRow = state.rows && state.rows.find(({ id }) => id === payload.id);
            selected.set(payload.id, { ...selectedRow || {}, id: payload.id });
        }
    } else {
        if (payload.id === 0) {
            state.rows.forEach(row => selected.delete(row.id));
        } else if (payload.id === -1) {
            selected.clear();
        } else {
            selected.delete(payload.id);
        }
    }

    return {
        ...state,
        selected: new Map(selected)
    };
}

function entityDeleted(state, { meta }) {
    const selected = state.selected || (new Map());
    meta.systems.forEach(id => selected.delete(id));

    return {
        ...state,
        selected: new Map(selected)
    };
}

function onEntitiesLoaded(state, { payload }) {
    return {
        ...state,
        rows: mergeArraysByKey([state.rows, payload.results.map(result => {
            return {
                ...result,
                selected: state.selected && state.selected.has(result.id)
            };
        })])
    };
}

function onSetFilter(state, { payload }) {
    return {
        ...state,
        activeFilters: payload.filtersList
    };
}

function onSetPagination(state, { payload }) {
    const perPage = parseInt(payload.perPage, 10);
    const page = parseInt(payload.page, 10);
    return {
        ...state,
        perPage: isNaN(perPage) ? 50 : perPage,
        page: isNaN(page) ? 1 : page
    };
}

let reducers = {
    notifications: notificationsReducer,
    systemProfileStore,
    permissionsReducer
};

export const entitiesReducer = ({ LOAD_ENTITIES_FULFILLED }) => applyReducerHash(
    {
        [ACTION_TYPES.GET_ENTITIES_FULFILLED]: entitiesLoaded,
        [LOAD_ENTITIES_FULFILLED]: onEntitiesLoaded,
        [`${ACTION_TYPES.REMOVE_ENTITY}_FULFILLED`]: entityDeleted,
        [SELECT_ENTITY]: entitySelected,
        FILTER_SELECT: (state) => ({ ...state, selected: {} }),
        [SET_INVENTORY_FILTER]: onSetFilter,
        [SET_PAGINATION]: onSetPagination
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
