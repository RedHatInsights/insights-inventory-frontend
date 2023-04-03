import keyBy from 'lodash/keyBy';

const makeActions = (actions) => {
    return actions?.reduce?.((acc, curr) => ({
        ...acc,
        [curr]: curr,
        [`${curr}_PENDING`]: `${curr}_PENDING`,
        [`${curr}_FULFILLED`]: `${curr}_FULFILLED`,
        [`${curr}_REJECTED`]: `${curr}_REJECTED`
    }), {});
};

const actions = [
    'ALERT_ADD',
    'ALERT_DISMISS',
    'REMOVE_ENTITY'
];

export const asyncActions = [
    'GET_ENTITIES',
    'GET_ENTITY',
    'UPDATE_DISPLAY_NAME',
    'LOAD_WRITE_PERMISSIONS',
    'LOAD_SYSTEM_PROFILE',
    'SET_ANSIBLE_HOST'
];

export const asyncInventory = [
    'LOAD_ENTITIES',
    'LOAD_ENTITY',
    'REMOVE_ENTITY',
    'LOAD_SYSTEM_PROFILE',
    'SET_DISPLAY_NAME',
    'SET_ANSIBLE_HOST',
    'LOAD_TAGS',
    'ALL_TAGS',
    'OPERATING_SYSTEMS',
    'GROUPS',
    'GROUP_DETAIL'
];

export const systemIssues = [
    'LOAD_ADVISOR_RECOMMENDATIONS',
    'LOAD_APPLICABLE_CVES',
    'LOAD_APPLICABLE_ADVISORIES',
    'LOAD_COMPLIANCE_POLICIES'
];

export const ACTION_TYPES = { ...keyBy(actions, k => k), ...makeActions(asyncActions), ...makeActions(asyncInventory) };
export const INVENTORY_ACTION_TYPES = makeActions(asyncInventory);
export const SYSTEM_ISSUE_TYPES = makeActions(systemIssues);

export const CLEAR_NOTIFICATIONS = '@@INSIGHTS-CORE/NOTIFICATIONS/CLEAR_NOTIFICATIONS';
export const SELECT_ENTITY = 'SELECT_ENTITY';
export const SET_INVENTORY_FILTER = 'SET_INVENTORY_FILTER';
export const SET_PAGINATION = 'SET_PAGINATION';
export const SET_DISPLAY_NAME = 'SET_DISPLAY_NAME';
export const SET_ANSIBLE_HOST = 'SET_ANSIBLE_HOST';

export const UPDATE_ENTITIES = 'UPDATE_ENTITIES';
export const CHANGE_SORT = 'CHANGE_SORT';
export const FILTER_ENTITIES = 'FILTER_ENTITIES';
export const SHOW_ENTITIES = 'SHOW_ENTITIES';
export const FILTER_SELECT = 'FILTER_SELECT';
export const ENTITIES_LOADING = 'ENTITIES_LOADING';
export const CLEAR_FILTERS = 'CLEAR_FILTERS';
export const TOGGLE_TAG_MODAL = 'TOGGLE_TAG_MODAL';
export const CONFIG_CHANGED = 'CONFIG_CHANGED';
export const TOGGLE_DRAWER = 'TOGGLE_INVENTORY_DRAWER';
export const CLEAR_ENTITIES = 'CLEAR_ENTITIES';
