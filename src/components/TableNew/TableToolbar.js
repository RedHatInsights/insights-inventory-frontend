import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';

import { PrimaryToolbar } from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import { Skeleton, SkeletonSize } from '@redhat-cloud-services/frontend-components/Skeleton';

import { generateFilters, generateChips } from './filters';
import { useTagsFilter } from '../filters';
import { arrayToSelection, TagsModal } from '../../Utilities';

const TableToolbar = ({
    state,
    paginationConfig,
    actionsConfig,
    dispatch,
    enabledFilters,
    bulkSelect,
    rows,
    selectAll,
    children,
    noAccess
}) => {
    const [tagModal, toggleTagModal] = useState();
    const [{ allTags, allTagsLoaded, additionalTagsCount }, setTagsState] = useState({});
    const [filters, setFilter] = useState(state.filters);
    const {
        tagsFilter,
        tagsChip,
        selectedTags,
        setSelectedTags,
        filterTagsBy,
        seFilterTagsBy
    } = useTagsFilter(
        allTags,
        allTagsLoaded,
        additionalTagsCount,
        () => toggleTagModal(true),
        [{ tagsFilter: state.filters.tags }]
    );

    const updateTextFilter = (key, value) => {
        setFilter({ ...filters, [key]: value });
        // debounce dispatch({ type: 'setFilter', payload: { key, value } })
    };

    const bulkSelectConfig = useMemo(() => (
        {
            count: state.selected.length,
            isDisabled: (state.total === 0 && state.selected.length === 0) || !state.isLoaded || noAccess,
            checked: rows.every(({ selected }) => selected) || (rows.some(({ selected }) => selected) && null),
            onSelect: () => rows.some(({ selected }) => selected)
                ? dispatch({ type: 'unselectPage' })
                : dispatch({ type: 'selectPage' }),
            items: [
                {
                    title: 'Select none (0)',
                    onClick: () => dispatch({ type: 'selectNone' })
                },
                ...state.isLoaded && rows?.length > 0 ? [{
                    title: `Select page (${ rows.length })`,
                    onClick: () => dispatch({ type: 'selectPage' })
                }] : [{}],
                ...selectAll && state.isLoaded && rows?.length > 0 ? [{
                    title: `Select all (${ state.total })`,
                    onClick: () => selectAll((selected) => dispatch({ type: 'selectAll', payload: { selected } }))
                }] : [{}]
            ]
        }
    ), [state.selected, state.total, state.isLoaded, noAccess, rows.length, Boolean(selectAll)]);

    console.log(tagsFilter, enabledFilters);

    return (
        <React.Fragment>
            <PrimaryToolbar
                pagination={state.isLoaded ? paginationConfig : <Skeleton size={SkeletonSize.lg} /> }
                filterConfig={
                    generateFilters(
                        enabledFilters,
                        {},
                        filters,
                        updateTextFilter,
                        tagsFilter
                    )
                }
                {...actionsConfig && { actionsConfig }}
                {...bulkSelect && {
                    bulkSelect: bulkSelectConfig
                }}
                activeFiltersConfig={{
                    filters: [...generateChips(filters), tagsChip],
                    onDelete: console.log
                }}
            >{children}</PrimaryToolbar>
            {tagModal && <TagsModal
                customFilters={state.customFilters}
                filterTagsBy={filterTagsBy}
                onApply={(selected) => setSelectedTags(arrayToSelection(selected))}
                onToggleModal={() => seFilterTagsBy('')}
            />}
        </React.Fragment>
    );
};

TableToolbar.propTypes = {
    state: PropTypes.object,
    paginationConfig: PropTypes.object,
    actionsConfig: PropTypes.object,
    dispatch: PropTypes.func,
    enabledFilters: PropTypes.object,
    bulkSelect: PropTypes.bool,
    rows: PropTypes.array,
    selectAll: PropTypes.func,
    children: PropTypes.node,
    noAccess: PropTypes.bool
};

export default TableToolbar;
