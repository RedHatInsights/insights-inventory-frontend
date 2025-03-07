import {
  ACTION_TYPES,
  CLEAR_ENTITIES,
  CLEAR_ERRORS,
  CLEAR_NOTIFICATIONS,
  SET_INVENTORY_FILTER,
  SET_PAGINATION,
  SET_SORT,
} from './action-types';
import { getEntitySystemProfile } from '../api';
import { deleteSystemsById } from '../components/InventoryTable/utils/api';
import { patchHostById } from '../api/hostInventoryApi';
export * from './system-issues-actions';
export * from './inventory-actions';

export const deleteEntity = (systems, displayName) => ({
  type: ACTION_TYPES.REMOVE_ENTITY,
  payload: deleteSystemsById(systems),
  meta: {
    notifications: {
      fulfilled: {
        variant: 'success',
        title: 'Delete operation finished',
        description: `${displayName} has been successfully removed.`,
        dismissable: true,
      },
    },
    systems,
  },
});

export const setFilter = (filtersList) => ({
  type: SET_INVENTORY_FILTER,
  payload: {
    filtersList,
  },
});

export const clearNotifications = () => {
  return {
    type: CLEAR_NOTIFICATIONS,
  };
};

export const editDisplayName = (id, value, origValue) => ({
  type: ACTION_TYPES.UPDATE_DISPLAY_NAME,
  payload: patchHostById({
    hostIdList: [id],
    patchHostIn: { display_name: value },
  }),
  meta: {
    id,
    value,
    origValue,
    notifications: {
      fulfilled: {
        variant: 'success',
        title: `Display name has been changed to ${value}`,
        dismissable: true,
      },
    },
  },
});

export const setPagination = (page, perPage) => ({
  type: SET_PAGINATION,
  payload: {
    page,
    perPage,
  },
});

export const setSort = (key, direction) => ({
  type: SET_SORT,
  payload: {
    key,
    direction,
  },
});

export const systemProfile = (itemId) => ({
  type: ACTION_TYPES.LOAD_SYSTEM_PROFILE,
  payload: getEntitySystemProfile(itemId, {}),
});

export const editAnsibleHost = (id, value, origValue) => ({
  type: ACTION_TYPES.SET_ANSIBLE_HOST,
  payload: patchHostById({
    hostIdList: [id],
    patchHostIn: { ansible_host: value },
  }),
  meta: {
    id,
    value,
    origValue,
    notifications: {
      fulfilled: {
        variant: 'success',
        title: `Ansible hostname has been changed to ${value}`,
        dismissable: true,
      },
    },
  },
});

export const clearEntitiesAction = () => ({
  type: CLEAR_ENTITIES,
  payload: [],
});

export const clearErrors = () => ({
  type: CLEAR_ERRORS,
  payload: [],
});
