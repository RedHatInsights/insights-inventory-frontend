/* eslint-disable camelcase */
import {
    Pagination,
    PaginationVariant,
    SearchInput
} from '@patternfly/react-core';
import {
    cellWidth,
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
import difference from 'lodash/difference';
import flatten from 'lodash/flatten';
import map from 'lodash/map';
import union from 'lodash/union';
import upperCase from 'lodash/upperCase';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { TABLE_DEFAULT_PAGINATION } from '../../constants';
import { fetchGroups } from '../../store/inventory-actions';
import useFetchBatched from '../../Utilities/hooks/useFetchBatched';
import CreateGroupModal from '../InventoryGroups/Modals/CreateGroupModal';
import DeleteGroupModal from '../InventoryGroups/Modals/DeleteGroupModal';
import RenameGroupModal from '../InventoryGroups/Modals/RenameGroupModal';
import { getGroups } from '../InventoryGroups/utils/api';
import { generateLoadingRows } from '../InventoryTable/helpers';
import NoEntitiesFound from '../InventoryTable/NoEntitiesFound';

const GROUPS_TABLE_INITIAL_STATE = {
    perPage: TABLE_DEFAULT_PAGINATION,
    page: 1
};

const GROUPS_TABLE_COLUMNS = [
    {
        title: 'Name',
        transforms: [sortable, cellWidth(40)]
    },
    {
        title: 'Total systems',
        transforms: [sortable, cellWidth(20)]
    },
    {
        title: 'Last modified',
        transforms: [sortable, cellWidth(20)]
    }
];

const GROUPS_TABLE_COLUMNS_TO_URL = {
    0: '', // reserved for selection boxes
    1: 'name',
    2: 'host_ids',
    3: 'updated_at'
};

const REQUEST_DEBOUNCE_TIMEOUT = 500;

const GroupsTable = () => {
    const dispatch = useDispatch();
    const { rejected, uninitialized, loading, data } = useSelector(
        (state) => state.groups
    );
    const [filters, setFilters] = useState(GROUPS_TABLE_INITIAL_STATE);
    const [rows, setRows] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState({});
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const groups = useMemo(() => data?.results || [], [data]);
    const { fetchBatched } = useFetchBatched();

    const fetchData = useCallback(
        debounce((filters) => {
            const { perPage, page, sortIndex, sortDirection, ...search } = filters;

            if (sortIndex !== undefined && sortDirection !== undefined) {
                const order_by = GROUPS_TABLE_COLUMNS_TO_URL[sortIndex];
                const order_how = upperCase(sortDirection);
                return dispatch(
                    fetchGroups({ ...search, order_by, order_how }, { page, per_page: perPage })
                );
            } else {
                return dispatch(fetchGroups(search, { page, per_page: perPage }));
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
            ],
            groupId: group.id,
            groupName: group.name,
            selected: selectedIds.includes(group.id)
        }));
        setRows(newRows);

        setSelectedGroup({
            id: selectedIds[0],
            name: groups.find(({ id }) => id === selectedIds[0])?.name
        });
    }, [groups, selectedIds]);

    // TODO: convert initial URL params to filters

    const onSort = (event, index, direction) => {
        setFilters({ ...filters, sortIndex: index, sortDirection: direction });
    };

    const filterConfigItems = useMemo(
        () => [
            {
                type: 'custom',
                label: 'Name',
                filterValues: {
                    children: (
                        <SearchInput
                            data-ouia-component-type="PF4/TextInput"
                            data-ouia-component-id="name-filter"
                            placeholder="Filter by name"
                            value={filters.name || ''}
                            onChange={(value) => {
                                const { name, ...fs } = filters;
                                return setFilters({
                                    ...fs,
                                    ...(value.length > 0 ? { name: value } : {})
                                });
                            }}
                            onClear={() => {
                                const { name, ...fs } = filters;
                                return setFilters(fs);
                            }}
                            isDisabled={rejected}
                        />
                    )
                }
            }
        ],
        [filters.name, rejected]
    );

    const onResetFilters = () => setFilters(GROUPS_TABLE_INITIAL_STATE);

    const activeFiltersConfig = {
        showDeleteButton: !!filters.name,
        deleteTitle: 'Reset filters',
        filters: filters.name
            ? [
                {
                    category: 'Name',
                    chips: [
                        { name: filters.name, value: filters.name }
                    ]
                }
            ]
            : [],
        // always reset to initial filters since there is only one filter currently
        onDelete: onResetFilters
    };

    const onSetPage = (event, page) => setFilters({ ...filters, page });

    const onPerPageSelect = (event, perPage) =>
        setFilters({ ...filters, perPage, page: 1 }); // will also reset the page to first

    const tableRows = useMemo(
        () =>
            uninitialized || loading
                ? generateLoadingRows(GROUPS_TABLE_COLUMNS.length, filters.perPage)
                : rejected || rows.length === 0
                    ? [
                        {
                            fullWidth: true,
                            cells: [
                                {
                                    title: rejected ? (
                                    // TODO: don't render the primary button (requires change in FF)
                                        <ErrorState />
                                    ) : (
                                        <NoEntitiesFound
                                            entities="groups"
                                            onClearAll={onResetFilters}
                                        />
                                    ),
                                    props: {
                                        colSpan: GROUPS_TABLE_COLUMNS.length + 1
                                    }
                                }
                            ]
                        }
                    ]
                    : rows,
        [uninitialized, loading, rejected, rows, filters.perPage]
    );

    // TODO: use ouiaSafe to indicate the loading state for e2e tests

    const onSelect = (event, isSelected, rowId, rowData) => {
        const { groupId } = rowData;
        if (isSelected) {
            setSelectedIds(union(selectedIds, [groupId]));
        } else {
            setSelectedIds(difference(selectedIds, [groupId]));
        }
    };

    const fetchAllGroupIds = useCallback((filters, total) => {
        const { sortIndex, sortDirection, perPage, page, ...search } = filters;
        // exclude sort parameters

        return fetchBatched(getGroups, total, search);
    }, []);

    const selectAllIds = async () => {
        const results = await fetchAllGroupIds(filters, data?.total);
        const ids = map(flatten(map(results, 'results')), 'id');
        setSelectedIds(ids);
    };

    const allSelected = selectedIds.length === data?.total;
    const noneSelected = selectedIds.length === 0;
    const displayedIds = map(rows, 'groupId');
    const pageSelected = difference(displayedIds, selectedIds).length === 0;

    return (
        <div id="groups-table">
            <CreateGroupModal
                isModalOpen={createModalOpen}
                setIsModalOpen={setCreateModalOpen}
                reloadData={() => {fetchData(filters);}}
            />
            <RenameGroupModal
                isModalOpen={renameModalOpen}
                setIsModalOpen={setRenameModalOpen}
                reloadData={() => fetchData(filters)}
                modalState={selectedGroup}
            />
            <DeleteGroupModal
                isModalOpen={deleteModalOpen}
                setIsModalOpen={setDeleteModalOpen}
                reloadData={() => fetchData(filters)}
                modalState={selectedIds.length > 1 ? {
                    ids: selectedIds
                } : selectedGroup}
            />
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
                filterConfig={{ items: filterConfigItems }}
                activeFiltersConfig={activeFiltersConfig}
                bulkSelect={{
                    items: [
                        {
                            title: 'Select none',
                            onClick: () => setSelectedIds([]),
                            props: { isDisabled: noneSelected }
                        },
                        {
                            title: `${pageSelected ? 'Deselect' : 'Select'} page (${data?.count || 0} items)`,
                            onClick: () => {
                                if (pageSelected) {
                                    // exclude groups on the page from the selected ids
                                    const newRows = difference(selectedIds, displayedIds);
                                    setSelectedIds(newRows);
                                } else {
                                    setSelectedIds(union(selectedIds, displayedIds));
                                }
                            }
                        },
                        {
                            title: `${allSelected ? 'Deselect' : 'Select'} all (${data?.total || 0} items)`,
                            onClick: async () => {
                                if (allSelected) {
                                    setSelectedIds([]);
                                } else {
                                    await selectAllIds();
                                }
                            }
                        }
                    ],
                    checked: selectedIds.length > 0, // TODO: support partial selection (dash sign) in FEC BulkSelect
                    onSelect: async (checked) => {
                        if (checked) {
                            await selectAllIds();
                        } else {
                            setSelectedIds([]);
                        }
                    },
                    ouiaId: 'groups-selector',
                    count: selectedIds.length
                }}
                actionsConfig={{
                    actions: [
                        {
                            label: 'Create group',
                            onClick: () => setCreateModalOpen(true)
                        },
                        {
                            label: 'Rename group',
                            onClick: () => setRenameModalOpen(true),
                            props: {
                                isDisabled: selectedIds.length !== 1
                            }
                        },
                        {
                            label: selectedIds.length > 1 ? 'Delete groups' : 'Delete group',
                            onClick: () => setDeleteModalOpen(true),
                            props: {
                                isDisabled: selectedIds.length === 0
                            }
                        }
                    ] }}
            />
            <Table
                aria-label="Groups table"
                ouiaId="groups-table"
                /* ouiaSafe={!loadingState}> */
                variant={TableVariant.compact}
                cells={GROUPS_TABLE_COLUMNS}
                rows={tableRows}
                sortBy={{
                    index: filters.sortIndex,
                    direction: filters.sortDirection
                }}
                onSort={onSort}
                isStickyHeader
                onSelect={onSelect}
                canSelectAll={false}
                actions={[
                    {
                        title: 'Rename group',
                        onClick: (event, rowIndex, { groupId, groupName }) => {
                            setSelectedGroup({
                                id: groupId,
                                name: groupName
                            });
                            setRenameModalOpen(true);
                        }
                    },
                    {
                        title: 'Delete group',
                        onClick: (event, rowIndex, { groupId, groupName }) => {
                            setSelectedGroup({
                                id: groupId,
                                name: groupName
                            });
                            setDeleteModalOpen(true);
                        }
                    }
                ]}
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
