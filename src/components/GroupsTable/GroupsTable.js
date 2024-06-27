/* eslint-disable camelcase */
import {
  Pagination,
  PaginationVariant,
  SearchInput,
} from '@patternfly/react-core';
import { TableVariant, cellWidth, sortable } from '@patternfly/react-table';
import {
  Table,
  TableBody,
  TableHeader,
} from '@patternfly/react-table/deprecated';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import ErrorState from '@redhat-cloud-services/frontend-components/ErrorState';
import PrimaryToolbar from '@redhat-cloud-services/frontend-components/PrimaryToolbar';
import debounce from 'lodash/debounce';
import difference from 'lodash/difference';
import flatten from 'lodash/flatten';
import map from 'lodash/map';
import union from 'lodash/union';
import upperCase from 'lodash/upperCase';
import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  GENERAL_GROUPS_WRITE_PERMISSION,
  NO_MODIFY_GROUPS_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE,
  NO_MODIFY_GROUP_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
  TABLE_DEFAULT_PAGINATION,
} from '../../constants';
import { fetchGroups } from '../../store/inventory-actions';
import useFetchBatched from '../../Utilities/hooks/useFetchBatched';
import useWorkspaceFeatureFlag from '../../Utilities/hooks/useWorkspaceFeatureFlag';
import DeleteGroupModal from '../InventoryGroups/Modals/DeleteGroupModal';
import RenameGroupModal from '../InventoryGroups/Modals/RenameGroupModal';
import { getGroups } from '../InventoryGroups/utils/api';
import { generateLoadingRows } from '../InventoryTable/helpers';
import NoEntitiesFound from '../InventoryTable/NoEntitiesFound';
import {
  readURLSearchParams,
  updateURLSearchParams,
} from '../../Utilities/URLSearchParams';
import { useLocation } from 'react-router-dom';
import isNil from 'lodash/isNil';
import {
  ActionButton,
  ActionDropdownItem,
} from '../InventoryTable/ActionWithRBAC';
import PropTypes from 'prop-types';

const GROUPS_TABLE_INITIAL_STATE = {
  perPage: TABLE_DEFAULT_PAGINATION,
  page: 1,
};

const GROUPS_TABLE_COLUMNS = [
  {
    title: 'Name',
    transforms: [sortable, cellWidth(40)],
  },
  {
    title: 'Total systems',
    transforms: [sortable, cellWidth(20)],
  },
  {
    title: 'Last modified',
    transforms: [sortable, cellWidth(20)],
  },
];

const GROUPS_TABLE_COLUMNS_TO_URL = {
  0: '', // reserved for selection boxes
  1: 'name',
  2: 'host_count',
  3: 'updated',
};

const REQUEST_DEBOUNCE_TIMEOUT = 500;

const groupsTableFiltersConfig = {
  name: {
    paramName: 'name',
  },
  perPage: {
    paramName: 'per_page',
    transformFromParam: (value) => parseInt(value),
  },
  page: {
    paramName: 'page',
    transformFromParam: (value) => parseInt(value),
  },
  sortIndex: {
    paramName: 'order_by',
    transformToParam: (value) => GROUPS_TABLE_COLUMNS_TO_URL[value],
    transformFromParam: (value) =>
      parseInt(
        Object.entries(GROUPS_TABLE_COLUMNS_TO_URL).find(
          ([, name]) => name === value
        )?.[0]
      ),
  },
  sortDirection: {
    paramName: 'order_how',
  },
};

const GroupsTable = ({ onCreateGroupClick }) => {
  const dispatch = useDispatch();
  const { rejected, uninitialized, loading, fulfilled, data } = useSelector(
    (state) => state.groups
  );
  const [rowsGenerated, setRowsGenerated] = useState(false);
  const location = useLocation();
  const [filters, setFilters] = useState({
    ...GROUPS_TABLE_INITIAL_STATE,
    ...readURLSearchParams(location.search, groupsTableFiltersConfig),
  });
  const [rows, setRows] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(undefined); // for per-row actions
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const groups = useMemo(() => data?.results || [], [data]);
  const { fetchBatched } = useFetchBatched();
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();
  const loadingState = uninitialized || loading;

  const fetchData = useCallback(
    debounce((filters) => {
      const { perPage, page, sortIndex, sortDirection, ...search } = filters;

      if (sortIndex !== undefined && sortDirection !== undefined) {
        const order_by = GROUPS_TABLE_COLUMNS_TO_URL[sortIndex];
        const order_how = upperCase(sortDirection);
        return dispatch(
          fetchGroups(
            { ...search, order_by, order_how },
            { page, per_page: perPage }
          )
        );
      } else {
        return dispatch(fetchGroups(search, { page, per_page: perPage }));
      }
    }, REQUEST_DEBOUNCE_TIMEOUT), // wait the timeout before making the final fetch
    []
  );

  useEffect(() => {
    updateURLSearchParams(filters, groupsTableFiltersConfig);
    fetchData(filters);
  }, [filters]);

  useEffect(() => {
    // update visible rows once new data obtained
    const newRows = groups.map((group, index) => ({
      cells: [
        <span key={index}>
          <Link to={group.id}>{group.name || group.id}</Link>
        </span>,
        <span key={index}>
          {isNil(group.host_count) ? 'N/A' : group.host_count.toString()}
        </span>,
        <span key={index}>
          {isNil(group.updated) ? 'N/A' : <DateFormat date={group.updated} />}
        </span>,
      ],
      groupId: group.id,
      groupName: group.name,
      selected: selectedIds.includes(group.id),
    }));
    setRows(newRows);
    setRowsGenerated(!uninitialized && !loading); // set to true only after the API call is complete

    if (selectedIds.length === 1) {
      setSelectedGroup({
        id: selectedIds[0],
        name: groups.find(({ id }) => id === selectedIds[0])?.name,
      });
    } else {
      setSelectedGroup(undefined);
    }
  }, [loading, selectedIds]);

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
              onChange={(event, value) => {
                const { name, ...fs } = filters;
                return setFilters({
                  ...fs,
                  ...(value.length > 0 ? { name: value } : {}),
                });
              }}
              onClear={() => {
                const { name, ...fs } = filters;
                return setFilters(fs);
              }}
              isDisabled={rejected}
            />
          ),
        },
      },
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
            chips: [{ name: filters.name, value: filters.name }],
          },
        ]
      : [],
    // always reset to initial filters since there is only one filter currently
    onDelete: onResetFilters,
  };

  const onSetPage = (event, page) => setFilters({ ...filters, page });

  const onPerPageSelect = (event, perPage) =>
    setFilters({ ...filters, perPage, page: 1 }); // will also reset the page to first

  const tableRows = useMemo(() => {
    if (uninitialized || loading || !rowsGenerated) {
      return generateLoadingRows(GROUPS_TABLE_COLUMNS.length, filters.perPage);
    }

    if (fulfilled) {
      if (rows.length === 0) {
        return [
          {
            fullWidth: true,
            cells: [
              {
                title: (
                  <NoEntitiesFound
                    entities={isWorkspaceEnabled ? 'workspaces' : 'groups'}
                    onClearAll={onResetFilters}
                  />
                ),
                props: {
                  colSpan: GROUPS_TABLE_COLUMNS.length + 1,
                },
              },
            ],
          },
        ];
      } else {
        return rows; // the happy path
      }
    }

    return [
      {
        fullWidth: true,
        cells: [
          {
            title: <ErrorState />, // TODO: don't render the primary button (requires change in FF)
            props: {
              colSpan: GROUPS_TABLE_COLUMNS.length + 1,
            },
          },
        ],
      },
    ];
  }, [uninitialized, loading, rejected, rows, filters.perPage]);

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

  const groupsActionsResolver = (rowData) => [
    {
      title: (
        <ActionDropdownItem
          requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
            rowData?.groupId
          )}
          noAccessTooltip={
            isWorkspaceEnabled
              ? NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE
              : NO_MODIFY_GROUP_TOOLTIP_MESSAGE
          }
          onClick={() => {
            setSelectedGroup({
              id: rowData?.groupId,
              name: rowData?.groupName,
            });
            setRenameModalOpen(true);
          }}
        >
          {isWorkspaceEnabled ? 'Rename workspace' : 'Rename group'}
        </ActionDropdownItem>
      ),
    },
    {
      title: (
        <ActionDropdownItem
          requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
            rowData?.groupId
          )}
          noAccessTooltip={
            isWorkspaceEnabled
              ? NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE
              : NO_MODIFY_GROUP_TOOLTIP_MESSAGE
          }
          onClick={() => {
            setSelectedGroup({
              id: rowData?.groupId,
              name: rowData?.groupName,
            });
            setDeleteModalOpen(true);
          }}
        >
          {isWorkspaceEnabled ? 'Delete workspace' : 'Delete group'}
        </ActionDropdownItem>
      ),
    },
  ];

  return (
    <div id="groups-table">
      {renameModalOpen && (
        <RenameGroupModal
          isModalOpen={renameModalOpen}
          setIsModalOpen={(value) => {
            if (value === false) {
              setSelectedGroup(undefined);
            }

            setRenameModalOpen(value);
          }}
          reloadData={() => fetchData(filters)}
          modalState={selectedGroup}
        />
      )}
      {deleteModalOpen && (
        <DeleteGroupModal
          isModalOpen={deleteModalOpen}
          setIsModalOpen={(value) => {
            if (value === false) {
              setSelectedGroup(undefined);
            }

            setDeleteModalOpen(value);
          }}
          reloadData={() => {
            fetchData(filters);
            setSelectedIds([]);
          }}
          groupIds={
            selectedGroup !== undefined ? [selectedGroup.id] : selectedIds
          }
        />
      )}
      <PrimaryToolbar
        pagination={{
          itemCount: data?.total || 0,
          page: filters.page,
          perPage: filters.perPage,
          onSetPage,
          onPerPageSelect,
          isCompact: true,
          ouiaId: 'pager',
          isDisabled: rejected,
        }}
        filterConfig={{ items: filterConfigItems }}
        activeFiltersConfig={activeFiltersConfig}
        bulkSelect={{
          items: [
            {
              title: 'Select none',
              onClick: () => setSelectedIds([]),
              props: { isDisabled: noneSelected },
            },
            {
              title: `${pageSelected ? 'Deselect' : 'Select'} page (${
                data?.count || 0
              } items)`,
              onClick: () => {
                if (pageSelected) {
                  // exclude groups on the page from the selected ids
                  const newRows = difference(selectedIds, displayedIds);
                  setSelectedIds(newRows);
                } else {
                  setSelectedIds(union(selectedIds, displayedIds));
                }
              },
            },
            {
              title: `${allSelected ? 'Deselect' : 'Select'} all (${
                data?.total || 0
              } items)`,
              onClick: async () => {
                if (allSelected) {
                  setSelectedIds([]);
                } else {
                  await selectAllIds();
                }
              },
            },
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
          count: selectedIds.length,
          toggleProps: {
            'data-ouia-component-id': 'bulk-select-toggle-button',
          },
        }}
        actionsConfig={{
          actions: [
            <ActionButton
              key="create-group-btn"
              requiredPermissions={[GENERAL_GROUPS_WRITE_PERMISSION]}
              noAccessTooltip={
                isWorkspaceEnabled
                  ? NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE
                  : NO_MODIFY_GROUPS_TOOLTIP_MESSAGE
              }
              onClick={onCreateGroupClick}
              ouiaId="CreateGroupButton"
            >
              {isWorkspaceEnabled ? 'Create workspace' : 'Create group'}
            </ActionButton>,
            {
              label: (
                <ActionDropdownItem
                  requiredPermissions={selectedIds.flatMap((id) =>
                    REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(id)
                  )}
                  noAccessTooltip={
                    isWorkspaceEnabled
                      ? NO_MODIFY_WORKSPACES_TOOLTIP_MESSAGE
                      : NO_MODIFY_GROUPS_TOOLTIP_MESSAGE
                  }
                  onClick={() => setDeleteModalOpen(true)}
                  isAriaDisabled={selectedIds.length === 0}
                  checkAll
                >
                  {selectedIds.length > 1
                    ? isWorkspaceEnabled
                      ? 'Delete workspaces'
                      : 'Delete groups'
                    : isWorkspaceEnabled
                    ? 'Delete workspace'
                    : 'Delete group'}
                </ActionDropdownItem>
              ),
            },
          ],
        }}
      />
      <Table
        aria-label="Groups table"
        ouiaId="groups-table"
        ouiaSafe={!loadingState}
        variant={TableVariant.compact}
        cells={GROUPS_TABLE_COLUMNS}
        rows={tableRows}
        sortBy={{
          index: filters.sortIndex,
          direction: filters.sortDirection,
        }}
        onSort={onSort}
        isStickyHeader
        onSelect={onSelect}
        actionResolver={groupsActionsResolver}
        canSelectAll={false}
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

GroupsTable.propTypes = {
  onCreateGroupClick: PropTypes.func,
};

export default memo(GroupsTable);
