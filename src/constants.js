import keyBy from 'lodash/keyBy';
import flatMap from 'lodash/flatMap';
import PropTypes from 'prop-types';

const actions = [
    'ALERT_ADD',
    'ALERT_DISMISS',
    'REMOVE_ENTITY'
];

const asyncActions = flatMap([
    'GET_ENTITIES',
    'GET_ENTITY',
    'UPDATE_DISPLAY_NAME',
    'LOAD_WRITE_PERMISSIONS',
    'LOAD_SYSTEM_PROFILE',
    'SET_ANSIBLE_HOST'
], a => [a, `${a}_PENDING`, `${a}_FULFILLED`, `${a}_REJECTED`]);

export const ACTION_TYPES = keyBy([...actions, ...asyncActions], k => k);
export const CLEAR_NOTIFICATIONS = '@@INSIGHTS-CORE/NOTIFICATIONS/CLEAR_NOTIFICATIONS';
export const SELECT_ENTITY = 'SELECT_ENTITY';
export const SET_INVENTORY_FILTER = 'SET_INVENTORY_FILTER';
export const SET_PAGINATION = 'SET_PAGINATION';
export const SET_DISPLAY_NAME = 'SET_DISPLAY_NAME';
export const SET_ANSIBLE_HOST = 'SET_ANSIBLE_HOST';

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

export const prepareRows = (rows = [], pagination = {}) => (
    rows
    .slice((pagination.page - 1) * pagination.perPage, pagination.page * pagination.perPage)
);

export const isDate = (date) => {
    return !(isNaN(date) && isNaN(Date.parse(date)));
};

export const filterRows = (rows = [], activeFilters = {}) => (
    rows
    .filter(row => (
        Object.values(activeFilters).length === 0 ||
        Object.values(activeFilters)
        .every(
            filter => {
                const rowValue = row[filter.key] && (row[filter.key].sortValue || row[filter.key]);
                return rowValue && (
                    Array.isArray(filter.value) ?
                        filter.value.includes(rowValue) :
                        rowValue.toLocaleLowerCase().indexOf(filter.value.toLocaleLowerCase()) !== -1
                );
            }
        )
    ))
);

export const generateFilters = (cells = [], filters = [], activeFilters = {}, onChange = () => undefined) => (
    filters.map((filter, key) => {
        const activeKey = filter.index || key;
        const activeLabel = cells[activeKey] && (cells[activeKey].title || cells[activeKey]);

        return ({
            value: String(activeKey),
            label: activeLabel,
            type: filter.type || 'text',
            filterValues: {
                id: filter.id || `${activeLabel}-${activeKey}`,
                onChange: (_e, newFilter) => onChange(activeKey, newFilter, activeLabel),
                value: activeFilters[activeKey] && activeFilters[activeKey].value,
                ...filter.options && { items: filter.options }
            }
        });
    })
);

export const onDeleteFilter = (deleted = {}, deleteAll = false, activeFilters = {}) => {
    if (deleteAll) {
        return {};
    } else {
        const { [deleted.key]: workingItem, ...filtersRest } = activeFilters;
        const newValue = workingItem && Array.isArray(workingItem.value) &&
            workingItem.value.filter(item => !deleted.chips.find(({ name }) => name === item));
        const newFilter = workingItem && Array.isArray(workingItem.value) && newValue && newValue.length > 0 ? {
            [deleted.key]: {
                ...workingItem,
                value: newValue
            }
        } : {};
        return {
            ...filtersRest,
            ...newFilter
        };
    }
};

export const extraShape = PropTypes.shape({
    title: PropTypes.node,
    value: PropTypes.node,
    singular: PropTypes.node,
    plural: PropTypes.node,
    onClick: PropTypes.func
});
