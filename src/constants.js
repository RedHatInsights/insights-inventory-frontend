import keyBy from 'lodash/keyBy';
import flatMap from 'lodash/flatMap';

const actions = [
    'ALERT_ADD',
    'ALERT_DISMISS'
];

const asyncActions = flatMap([
    'GET_ENTITIES',
    'GET_ENTITY'
], a => [a, `${a}_PENDING`, `${a}_FULFILLED`, `${a}_REJECTED`]);

export const ACTION_TYPES = keyBy([...actions, ...asyncActions], k => k);
export const CLEAR_NOTIFICATIONS = '@@INSIGHTS-CORE/NOTIFICATIONS/CLEAR_NOTIFICATIONS';
