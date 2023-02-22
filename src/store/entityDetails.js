import { ACTION_TYPES, TOGGLE_TAG_MODAL, TOGGLE_DRAWER } from './action-types';
import { showTags, toggleTagModalReducer } from './entities';
import systemIssuesReducer from './systemIssues';
export const entityDefaultState = { loaded: false };

function entityDetailPending(state) {
    return {
        ...state,
        loaded: false
    };
}

function entityDetailLoaded(state, { payload }) {
    return {
        ...state,
        loaded: true,
        entity: payload.results[0]
    };
}

function toggleDrawer(state, { payload }) {
    return  {
        ...state,
        isToggleOpened: payload?.isOpened
    };
}

function showTagsPending(state) {
    return {
        ...state,
        tagModalLoaded: false
    };
}

function updateAnsibleName(state, { meta }, useOrigValue) {
    const value = useOrigValue ? meta?.origValue : meta?.value;
    return {
        ...state,
        ...state.rows && {
            rows: state.rows.map((row) => row.id === meta?.id ? ({
                ...row,
                // eslint-disable-next-line camelcase
                ansible_host: value
            }) : row)
        },
        ...state.entity && {
            entity: {
                ...state.entity,
                // eslint-disable-next-line camelcase
                ansible_host: value
            }
        }
    };
}

export function updateEntity(state, { meta }, useOrigValue) {
    const value = useOrigValue ? meta?.origValue : meta?.value;
    return {
        ...state,
        ...state.rows && {
            rows: state.rows.map((row) => row.id === meta?.id ? ({
                ...row,
                // eslint-disable-next-line camelcase
                display_name: value
            }) : row)
        },
        ...state.entity && {
            entity: {
                ...state.entity,
                // eslint-disable-next-line camelcase
                display_name: value
            }
        }
    };
}

export default {
    [ACTION_TYPES.LOAD_ENTITIES_PENDING]: () => entityDefaultState,
    [ACTION_TYPES.LOAD_ENTITY_PENDING]: entityDetailPending,
    [ACTION_TYPES.LOAD_ENTITY_FULFILLED]: entityDetailLoaded,
    [ACTION_TYPES.LOAD_TAGS]: showTags,
    [ACTION_TYPES.LOAD_TAGS_PENDING]: showTagsPending,
    [ACTION_TYPES.LOAD_TAGS_FULFILLED]: showTags,
    [TOGGLE_TAG_MODAL]: toggleTagModalReducer,
    [TOGGLE_DRAWER]: toggleDrawer,
    [ACTION_TYPES.UPDATE_DISPLAY_NAME_PENDING]: updateEntity,
    [ACTION_TYPES.SET_ANSIBLE_HOST_PENDING]: updateAnsibleName,
    [ACTION_TYPES.UPDATE_DISPLAY_NAME_ERROR]: (state, payload) => updateEntity(state, payload, true),
    [ACTION_TYPES.SET_ANSIBLE_HOST_ERROR]: (state, payload) => updateAnsibleName(state, payload, true),
    ...systemIssuesReducer
};
