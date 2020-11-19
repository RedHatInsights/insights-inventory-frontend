import keyBy from 'lodash/keyBy';
import flatMap from 'lodash/flatMap';

const actions = [
    'ALERT_ADD',
    'ALERT_DISMISS',
    'REMOVE_ENTITY'
];

const asyncActions = flatMap([
    'GET_ENTITIES',
    'GET_ENTITY',
    'UPDATE_DISPLAY_NAME',
    'LOAD_WRITE_PERMISSIONS'
], a => [a, `${a}_PENDING`, `${a}_FULFILLED`, `${a}_REJECTED`]);

export const ACTION_TYPES = keyBy([...actions, ...asyncActions], k => k);
export const CLEAR_NOTIFICATIONS = '@@INSIGHTS-CORE/NOTIFICATIONS/CLEAR_NOTIFICATIONS';
export const SELECT_ENTITY = 'SELECT_ENTITY';
export const SET_INVENTORY_FILTER = 'SET_INVENTORY_FILTER';
export const SET_PAGINATION = 'SET_PAGINATION';

export const tagsMapper = (acc, curr) => {
    let [namespace, keyValue] = curr.split('/');
    if (!keyValue) {
        keyValue = namespace;
        namespace = null;
    }

    const [key, value = null] = keyValue.split('=');
    const currTagKey = acc.findIndex(({ category }) => category === namespace);
    const currTag = acc[currTagKey] || {
        category: namespace,
        key: namespace,
        type: 'tags',
        values: []
    };
    currTag.values.push({
        name: `${key}${value ? `=${value}` : ''}`,
        key: `${key}${value ? `=${value}` : ''}`,
        tagKey: key,
        value,
        group: {
            label: namespace,
            value: namespace,
            type: 'checkbox'
        }
    });
    if (!acc[currTagKey]) {
        acc.push(currTag);
    }

    return acc;
};
