/* eslint-disable camelcase */
import { Pagination, PaginationVariant } from '@patternfly/react-core';
import {
    fitContent,
    sortable,
    Table,
    TableBody,
    TableHeader,
    TableVariant
} from '@patternfly/react-table';
import {
    DateFormat,
    ErrorState,
    PrimaryToolbar
} from '@redhat-cloud-services/frontend-components';
import debounce from 'lodash/debounce';
import upperCase from 'lodash/upperCase';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { TABLE_DEFAULT_PAGINATION } from '../../constants';
import { fetchGroups } from '../../store/inventory-actions';
import { generateLoadingRows } from '../InventoryTable/helpers';
import NoSystemsTable from '../InventoryTable/NoSystemsTable';

const GROUPS_TABLE_INITIAL_STATE = {
    perPage: TABLE_DEFAULT_PAGINATION,
    page: 1
};

const GROUPS_TABLE_COLUMNS = [
    {
        title: 'Name',
        transforms: [sortable]
    },
    {
        title: 'Total systems',
        transforms: [sortable, fitContent]
    },
    {
        title: 'Last modified',
        transforms: [sortable, fitContent]
    }
];

const GROUPS_TABLE_COLUMNS_TO_URL = {
    0: 'name',
    1: 'host_ids',
    2: 'updated_at'
};

const REQUEST_DEBOUNCE_TIMEOUT = 500;

const GroupsTable = () => {
    const dispatch = useDispatch();
    const { rejected, uninitialized, loading, data } = useSelector(
        (state) => state.groups
    );
    const [filters, setFilters] = useState(GROUPS_TABLE_INITIAL_STATE);
    const [rows, setRows] = useState([]);
    const groups = useMemo(() => data?.results || [], [data]);

    const fetchData = useCallback(
        debounce((filters) => {
            const { perPage, page, sortIndex, sortDirection, ...search } = filters;

            if (sortIndex !== undefined && sortDirection !== undefined) {
                const order_by = GROUPS_TABLE_COLUMNS_TO_URL[sortIndex];
                const order_how = upperCase(sortDirection);
                return dispatch(
                    fetchGroups({ ...search, order_by, order_how }, { page, perPage })
                );
            } else {
                return dispatch(fetchGroups(search, { page, perPage }));
            }
        }, REQUEST_DEBOUNCE_TIMEOUT), // wait the timeout before making the final fetch
        []
    );

    useEffect(() => {
        fetchData(filters);
    }, [filters]);

    useEffect(() => {
        // update visible rows once new data obtained
        const newRows = groups.map((group, index) => ({
            cells: [
                <span key={index}>
                    <Link to={`groups/${group.id}`}>{group.name || group.id}</Link>
                </span>,
                <span key={index}>{(group.host_ids || []).length.toString()}</span>,
                <span key={index}>{<DateFormat date={group.updated_at} />}</span>
            ]
        }));
        setRows(newRows);
    }, [groups]);

    // TODO: convert initial URL params to filters

    const onSort = (event, index, direction) => {
        setFilters({ ...filters, sortIndex: index, sortDirection: direction });
    };

    const filterConfigItems = [
        {
            label: 'Name',
            filterValues: {
                key: 'name-filter',
                onChange: (event, value) =>
                    setFilters({ ...filters, hostname_or_id: value }),
                value: filters.hostname_or_id,
                placeholder: 'Filter by name',
                isDisabled: rejected
            }
        }
    ];

    const activeFiltersConfig = {
        showDeleteButton: !!filters.hostname_or_id,
        deleteTitle: 'Reset filters',
        filters: filters.hostname_or_id
            ? [
                {
                    category: 'Name',
                    chips: [
                        { name: filters.hostname_or_id, value: filters.hostname_or_id }
                    ]
                }
            ]
            : [],
        // always reset to initial filters since there is only one filter currently
        onDelete: () => setFilters(GROUPS_TABLE_INITIAL_STATE)
    };

    const onSetPage = (event, page) => setFilters({ ...filters, page });

    const onPerPageSelect = (event, perPage) =>
        setFilters({ ...filters, perPage, page: 1 }); // will also reset the page to first

    // TODO: use ouiaSafe to indicate the loading state for e2e tests

    return (
        <div id="groups-table">
            <PrimaryToolbar
                pagination={{
                    itemCount: data?.total || 0,
                    page: filters.page,
                    perPage: filters.perPage,
                    onSetPage,
                    onPerPageSelect,
                    isCompact: true,
                    ouiaId: 'pager',
                    isDisabled: rejected

                }}
                filterConfig={{ items: filterConfigItems  }}
                activeFiltersConfig={activeFiltersConfig}
            />
            <Table
                aria-label="Groups table"
                ouiaId="groups-table"
                /* ouiaSafe={!loadingState}> */
                variant={TableVariant.compact}
                cells={GROUPS_TABLE_COLUMNS}
                rows={
                    uninitialized || loading
                        ? generateLoadingRows(GROUPS_TABLE_COLUMNS.length, filters.perPage)
                        : (rejected || rows.length === 0)
                            ? [
                                {
                                    fullWidth: true,
                                    cells: [
                                        {
                                            title: rejected ? <ErrorState /> : <NoSystemsTable />,
                                            props: {
                                                colSpan: GROUPS_TABLE_COLUMNS.length + 1
                                            }
                                        }
                                    ]
                                }
                            ]
                            : rows
                }
                sortBy={{
                    index: filters.sortIndex,
                    direction: filters.sortDirection
                }}
                onSort={onSort}
                isStickyHeader
            >
                <TableHeader />
                <TableBody />
            </Table>
            <Pagination
                itemCount={data?.total || 0}
                page={filters.page}
                perPage={filters.perPage}
                onSetPage={onSetPage}
                onPerPageSelect={onPerPageSelect}
                variant={PaginationVariant.bottom}
                widgetId={`pagination-options-menu-bottom`}
                ouiaId="pager"
                isDisabled={rejected}
            />
        </div>
    );
};

export default GroupsTable;
