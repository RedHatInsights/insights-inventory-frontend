import { ACTION_TYPES, TOGGLE_DRAWER, TOGGLE_TAG_MODAL } from './action-types';
import { showTags, toggleTagModalReducer } from './entities';
import systemIssuesReducer from './systemIssues';
export const entityDefaultState = { loaded: false };

function entityDetailPending(state) {
  return {
    ...state,
    loaded: false,
  };
}

function entityDetailLoaded(state, { payload }) {
  return {
    ...state,
    loaded: true,
    entity: payload.results[0],
  };
}

function toggleDrawer(state, { payload }) {
  return {
    ...state,
    isToggleOpened: payload?.isOpened,
  };
}

function showTagsPending(state) {
  return {
    ...state,
    tagModalLoaded: false,
  };
}

function updateAnsibleName(state, { meta }, useOrigValue) {
  meta.notifications.fulfilled();
  const value = useOrigValue ? meta?.origValue : meta?.value;
  return {
    ...state,
    ...(state.rows && {
      rows: state.rows.map((row) =>
        row.id === meta?.id
          ? {
              ...row,

              ansible_host: value,
            }
          : row,
      ),
    }),
    ...(state.entity && {
      entity: {
        ...state.entity,

        ansible_host: value,
      },
    }),
  };
}

function updateAnsibleNameRejected(state, { meta }) {
  meta.notifications.rejected();
  return state;
}

function updateEntity(state, { meta }, useOrigValue) {
  const value = useOrigValue ? meta?.origValue : meta?.value;
  return {
    ...state,
    ...(state.rows && {
      rows: state.rows.map((row) =>
        row.id === meta?.id
          ? {
              ...row,

              display_name: value,
            }
          : row,
      ),
    }),
    ...(state.entity && {
      entity: {
        ...state.entity,

        display_name: value,
      },
    }),
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
  [`${ACTION_TYPES.SET_ANSIBLE_HOST}_FULFILLED`]: updateAnsibleName,
  [`${ACTION_TYPES.SET_ANSIBLE_HOST}_REJECTED`]: updateAnsibleNameRejected,
  [`${ACTION_TYPES.UPDATE_DISPLAY_NAME}_FULFILLED`]: updateEntity,
  [`${ACTION_TYPES.UPDATE_DISPLAY_NAME}_REJECTED`]: (state, payload) =>
    updateEntity(state, payload, true),
  [ACTION_TYPES.SET_ANSIBLE_HOST_REJECTED]: (state, payload) =>
    updateAnsibleName(state, payload, true),
  ...systemIssuesReducer,
};
