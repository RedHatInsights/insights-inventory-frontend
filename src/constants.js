import keyBy from 'lodash/keyBy';
import flatMap from 'lodash/flatMap';

const actions = [];

const asyncActions = flatMap([
    'LOAD_ENTITIES'
], a => [a, `${a}_PENDING`, `${a}_FULFILLED`, `${a}_REJECTED`]);

export const ACTION_TYPES = keyBy([...actions, ...asyncActions], k => k);
