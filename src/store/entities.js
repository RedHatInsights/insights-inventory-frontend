import React from 'react';
import {
    ACTION_TYPES,
    SELECT_ENTITY,
    CHANGE_SORT,
    SHOW_ENTITIES,
    FILTER_SELECT,
    UPDATE_ENTITIES,
    ENTITIES_LOADING,
    CLEAR_FILTERS,
    TOGGLE_TAG_MODAL,
    CONFIG_CHANGED,
    CLEAR_ENTITIES
} from './action-types';
import { mergeArraysByKey } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { CullingInformation } from '@redhat-cloud-services/frontend-components/CullingInfo';
import { TagWithDialog } from '../Utilities/index';
import groupBy from 'lodash/groupBy';
import TitleColumn from '../components/InventoryTable/TitleColumn';
import InsightsDisconnected from '../Utilities/InsightsDisconnected';
import OperatingSystemFormatter from '../Utilities/OperatingSystemFormatter';
import { Tooltip } from '@patternfly/react-core';
import { verifyCulledInsightsClient } from '../Utilities/sharedFunctions';
import { fitContent } from '@patternfly/react-table';
import isEmpty from 'lodash/isEmpty';

export const defaultState = {
    loaded: false,
    tagsLoaded: false,
    allTagsLoaded: false,
    operatingSystems: [],
    operatingSystemsLoaded: false,
    groups: [],
    invConfig: {},
    sortBy: {
        key: 'updated',
        direction: 'desc'
    }
};

export const defaultColumns = (groupsEnabled = false) => ([
    {
        key: 'display_name',
        sortKey: 'display_name',
        title: 'Name',
        renderFunc: TitleColumn
    },
    ...(groupsEnabled ? [{
        key: 'groups',
        sortKey: 'groups',
        title: 'Group',
        props: { width: 10 },
        // eslint-disable-next-line camelcase
        renderFunc: (value, systemId, { group_name }) => isEmpty(group_name) ? 'N/A' : group_name,
        transforms: [fitContent]
    }] : []),
    {
        key: 'tags',
        title: 'Tags',
        props: { width: 10, isStatic: true },
        // eslint-disable-next-line react/display-name
        renderFunc: (value, systemId) => <TagWithDialog count={value.length} systemId={systemId} />
    },
    {
        key: 'system_profile',
        sortKey: 'operating_system',
        dataLabel: 'OS',
        title: <Tooltip content={<span>Operating system</span>}><span>OS</span></Tooltip>,
        // eslint-disable-next-line react/display-name
        renderFunc: (systemProfile) => <OperatingSystemFormatter operatingSystem={systemProfile?.operating_system} />,
        props: { width: 10 }
    },
    {
        key: 'updated',
        sortKey: 'updated',
        title: 'Last seen',
        // eslint-disable-next-line react/display-name
        renderFunc: (
            value,
            _id,
            {
                culled_timestamp: culled, stale_warning_timestamp: staleWarn, stale_timestamp: stale,
                per_reporter_staleness: perReporterStaleness
            }) => {
            return CullingInformation ? <CullingInformation
                culled={culled}
                staleWarning={staleWarn}
                stale={stale}
                render={({ msg }) => <React.Fragment>
                    <DateFormat date={ value } extraTitle={ (
                        <React.Fragment>
                            <div>{ msg }</div>
                        Last seen:{` `}
                        </React.Fragment>
                    ) }/>
                    {verifyCulledInsightsClient(perReporterStaleness) && <InsightsDisconnected />}
                </React.Fragment>
                }
            > <DateFormat date={ value } /> </CullingInformation> : new Date(value).toLocaleString();
        },
        props: { width: 10 },
        transforms: [fitContent]
    }
]);

function entitiesPending(state, { meta }) {
    return {
        ...state,
        ...state.columns && { columns: mergeArraysByKey([
            defaultColumns().filter(({ key }) => key !== 'tags' || meta?.showTags),
            state.columns
        ], 'key') } || {},
        rows: [],
        loaded: false,
        lastDateRequest: meta.lastDateRequest
    };
}

function clearFilters(state) {
    return {
        ...state,
        activeFilters: []
    };
}

const clearEntities = () => {
    return defaultState;
};

// eslint-disable-next-line camelcase
function entitiesLoaded(state, { payload: { results, per_page: perPage, page, count, total, loaded, filters }, meta }) {
    // Older requests should not rewrite the state
    if (meta.lastDateRequest < state.lastDateRequest) {
        return state;
    }

    // Data are loaded and APi returned malicious data
    if (loaded === undefined && (page === undefined || perPage === undefined)) {
        return state;
    }

    return {
        ...state,
        activeFilters: filters || [],
        loaded: loaded === undefined || loaded,
        // filter data only if we are loaded
        rows: mergeArraysByKey([state.rows, results]).filter(item => !loaded ? true : item.created),
        perPage: perPage !== undefined ? perPage : state.perPage,
        page: page !== undefined ? page : state.page,
        count: count !== undefined ? count : state.count,
        total: total !== undefined ? total : state.total
    };
}

function loadingRejected(state, { payload }) {
    return {
        ...state,
        error: payload
    };
}

function selectEntity(state, { payload }) {
    const rows = [...state.rows];
    const toSelect = [].concat(payload);
    toSelect.forEach(({ id, selected }) => {
        const entity = rows.find(entity => entity.id === id);
        if (entity) {
            entity.selected = selected;
        } else {
            rows.forEach(item => item.selected = selected);
        }
    });
    return {
        ...state,
        rows
    };
}

function versionsLoaded(state, { payload: { results } }) {
    return {
        ...state,
        operatingSystems: (results || []).map(entry => {
            const { name, major, minor } = entry.value;
            const versionStringified = `${major}.${minor}`;
            return { label: `${name} ${versionStringified}`, value: versionStringified };
        }),
        operatingSystemsLoaded: true
    };
}

function changeSort(state, { payload: { key, direction } }) {
    return {
        ...state,
        sortBy: {
            key,
            direction
        }
    };
}

function selectFilter(state, { payload: { item: { items, ...item }, selected } }) {
    let { activeFilters = [] } = state;
    if (selected) {
        activeFilters = [
            ...activeFilters,
            item,
            ...items ? items : []
        ];
        const values = activeFilters.map(active => active.value);
        activeFilters = activeFilters.filter((filter, key) => values.lastIndexOf(filter.value) === key);
    } else {
        activeFilters.splice(activeFilters.map(active => active.value).indexOf(item.value), 1);
        if (items) {
            items.forEach(subItem => {
                activeFilters.splice(activeFilters.map(active => active.value).indexOf(subItem.value), 1);
            });
        }
    }

    return {
        ...state,
        activeFilters
    };
}

export function showTags(state, { payload, meta }) {
    const { tags, ...activeSystemTag } = state.rows ? state.rows.find(({ id }) => meta.systemId === id) : state.entity || {};
    return {
        ...state,
        tagModalLoaded: true,
        activeSystemTag: {
            ...activeSystemTag,
            tags: Object.values(payload.results)[0],
            tagsCount: meta.tagsCount,
            page: payload.page,
            perPage: payload.per_page,
            tagsLoaded: true
        }
    };
}

export function showTagsPending(state, { meta }) {
    const { tags, ...activeSystemTag } = state.rows ? state.rows.find(({ id }) => meta.systemId === id) : state.entity || {};
    return {
        ...state,
        tagModalLoaded: false,
        activeSystemTag: {
            ...activeSystemTag,
            tagsCount: meta.tagsCount,
            tagsLoaded: false
        }
    };
}

export function toggleTagModalReducer(state, { payload: { isOpen } }) {
    return {
        ...state,
        showTagDialog: isOpen,
        activeSystemTag: undefined
    };
}

export function allTags(state, { payload: { results, total, page, per_page: perPage }, meta: { lastDateRequestTags } }) {
    // only the latest request can change state
    if (lastDateRequestTags < state.lastDateRequestTags) {
        return state;
    }

    return {
        ...state,
        allTags: Object.entries(groupBy(results, ({ tag: { namespace } }) => namespace)).map(([key, value]) => ({
            name: key,
            tags: value
        })),
        allTagsPagination: {
            perPage,
            page
        },
        additionalTagsCount: total > perPage ? total - perPage : 0,
        allTagsTotal: total,
        allTagsLoaded: true,
        tagModalLoaded: true
    };
}

export default {
    [ACTION_TYPES.ALL_TAGS_FULFILLED]: allTags,
    [ACTION_TYPES.ALL_TAGS_PENDING]: (state, { meta }) => (
        { ...state, allTagsLoaded: false, tagModalLoaded: false, lastDateRequestTags: meta.lastDateRequestTags }
    ),
    [ACTION_TYPES.LOAD_ENTITIES_PENDING]: entitiesPending,
    [ACTION_TYPES.LOAD_ENTITIES_FULFILLED]: entitiesLoaded,
    [ACTION_TYPES.LOAD_ENTITIES_REJECTED]: loadingRejected,
    [ACTION_TYPES.LOAD_TAGS_PENDING]: showTagsPending,
    [ACTION_TYPES.LOAD_TAGS_FULFILLED]: showTags,
    [ACTION_TYPES.ALL_TAGS_REJECTED]: loadingRejected,
    [ACTION_TYPES.OPERATING_SYSTEMS_PENDING]: (state) => ({ ...state, operatingSystemsLoaded: false }),
    [ACTION_TYPES.OPERATING_SYSTEMS_FULFILLED]: versionsLoaded,
    [UPDATE_ENTITIES]: entitiesLoaded,
    [SHOW_ENTITIES]: (state, action) => entitiesLoaded(state, {
        payload: {
            ...action.payload,
            loaded: false
        }
    }),
    [FILTER_SELECT]: selectFilter,
    [SELECT_ENTITY]: selectEntity,
    [CHANGE_SORT]: changeSort,
    [CLEAR_FILTERS]: clearFilters,
    [ENTITIES_LOADING]: (state, { payload: { isLoading } }) => ({ ...state, loaded: !isLoading }),
    [TOGGLE_TAG_MODAL]: toggleTagModalReducer,
    [CONFIG_CHANGED]: (state, { payload }) => ({ ...state, invConfig: payload }),
    [CLEAR_ENTITIES]: clearEntities
};
