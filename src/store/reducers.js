import {
    INVENTORY_ACTION_TYPES,
    ACTION_TYPES,
    SELECT_ENTITY,
    SET_INVENTORY_FILTER,
    SET_PAGINATION,
    SET_ROS_TAB_VISBILITY
} from './action-types';
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
import entitiesReducer, { defaultState as entitiesDefault } from './entities';
import entityDetailsReducer, { entityDefaultState as entityDefault } from './entityDetails';

export { entitiesReducer, entityDetailsReducer };

import permissionsReducer from './permissions/reducer';

const defaultState = { loaded: false, selected: new Map() };

function entitiesLoaded(state, { payload }) {
    return {
        ...state,
        rows: mergeArraysByKey([state.rows, payload.results]),
        entities: mergeArraysByKey([state.entities, payload.results])
    };
}

function updateEntity(state, { meta }) {
    return {
        ...state,
        rows: state.rows.map((row) => row.id === meta?.id ? ({
            ...row,
            // eslint-disable-next-line camelcase
            display_name: meta?.value
        }) : row)
    };
}

// async function verifyResourceTab(id) {
//     console.log('TESTING >>>>>>>>> are we getting into verifyResourceTab? I dont know, are we?');
//     const loadedSystemProfile = await getEntitySystemProfile(id).then((results) => {
//         const cloudProviderFlag = (typeof results.results[0].system_profile.cloud_provider === 'undefined'
//             ? 'nope'
//             : results.results[0].system_profile.cloud_provider
//         );
//         console.log('TESTING >>>>>>>> out what I have in verifyResourceTab: ', cloudProviderFlag);
//         // eslint-disable-next-line max-len
//         if ((!insights.chrome.isProd && cloudProviderFlag.toLowerCase() === 'aws' || (insights.chrome.isProd && insights?.chrome?.isBeta()))
//             && cloudProviderFlag.toLowerCase() === 'aws' || cloudProviderFlag.toLowerCase() === 'azure') {
//             console.log('TESTING >>>>>>>> ITS TRUE BROOOOOOOOOSKI');
//             return true;
//         }
//         // if ((!insights.chrome.isProd && !isHidden || (insights.chrome.isProd && insights?.chrome?.isBeta()))) {
//         //     console.log('TESTING >>>>>>>> ITS TRUE BROOOOOOOOOSKI');
//         //     return true;
//         // }
//     });
//     // loadedSystemProfile.then((results) => {
//     //     const cloudProviderFlag = results;
//     //     console.log('TESTING >>>>>>>> out what I have in verifyResourceTab: ', results);
//     //     if ((!insights.chrome.isProd || (insights.chrome.isProd && insights?.chrome?.isBeta()))
//     //         && cloudProviderFlag.toLowerCase() === 'aws' || cloudProviderFlag.toLowerCase() === 'azure') {
//     //         return true;
//     //     }
//     // });


//     console.log('TESTING >>>>>>>>>>> this is what my loadedSystemProfile looks like: ', loadedSystemProfile);
//     return loadedSystemProfile;
// }

function entityLoaded(state) {
    console.log('TESTING $$$$$$$$ Directly checking entity in entityLoaded from reducers: ', state);
    return {
        ...state,
        loaded: true,
        activeApps: [
            { title: 'General information', name: 'general_information', component: GeneralInformationTab },
            { title: 'Advisor', name: 'advisor', component: AdvisorTab },
            {
                title: 'Vulnerability',
                name: 'vulnerabilities',
                component: VulnerabilityTab
            },
            {
                title: 'Compliance',
                name: 'compliance',
                component: ComplianceTab
            },
            {
                title: 'Patch',
                name: 'patch',
                component: PatchTab
            },
            {
                title: 'Resource Optimization',
                name: 'ros',
                isHidden: true,
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

function resourceOptTabVisibility(state, { payload }) {
    console.log('TESTING $$$$$$$$$ Checking out state in visibility reducer: ', state);
    return {
        ...state,
        activeApps: state.activeApps?.map((entity) => {
            entity.name === 'ros' ? ({
                ...entity,
                isHidden: payload
            }) : entity;
        })
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

export const tableReducer = applyReducerHash(
    {
        [ACTION_TYPES.GET_ENTITIES_FULFILLED]: entitiesLoaded,
        [INVENTORY_ACTION_TYPES.LOAD_ENTITIES_FULFILLED]: onEntitiesLoaded,
        [`${ACTION_TYPES.REMOVE_ENTITY}_FULFILLED`]: entityDeleted,
        [SELECT_ENTITY]: entitySelected,
        FILTER_SELECT: (state) => ({ ...state, selected: {} }),
        [SET_INVENTORY_FILTER]: onSetFilter,
        [SET_PAGINATION]: onSetPagination,
        [ACTION_TYPES.UPDATE_DISPLAY_NAME_FULFILLED]: updateEntity
    },
    defaultState
);

export const entitesDetailReducer = () => applyReducerHash(
    {
        [INVENTORY_ACTION_TYPES.LOAD_ENTITY_FULFILLED]: entityLoaded,
        [SET_ROS_TAB_VISBILITY]: resourceOptTabVisibility
    },
    defaultState
);

export function mergeWithEntities(additionalReducers = (state) => state, defaultState = {}) {
    return ({
        entities: (state, payload) => ({
            ...additionalReducers({
                ...applyReducerHash({
                    ...entitiesReducer
                }, { ...entitiesDefault, ...defaultState })(state, payload)
            }, payload)
        })
    });
}

export function mergeWithDetail(additionalReducers = (state) => state, defaultState = {}) {
    return ({
        entityDetails: (state, payload) => ({
            ...additionalReducers({
                ...applyReducerHash({
                    ...entityDetailsReducer
                }, { ...entityDefault, ...defaultState })(state, payload)
            }, payload)
        })
    });
}

export default reducers;
