import { TableVariant, fitContent } from '@patternfly/react-table';
import difference from 'lodash/difference';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearFilters, selectEntity } from '../../store/inventory-actions';
import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import InventoryTable from '../InventoryTable/InventoryTable';
import { Link } from 'react-router-dom';
import RemoveHostsFromGroupModal from '../InventoryGroups/Modals/RemoveHostsFromGroupModal';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  NO_MODIFY_GROUP_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
} from '../../constants';
import {
  ActionButton,
  ActionDropdownItem,
} from '../InventoryTable/ActionWithRBAC';

export const bulkSelectConfig = (
  dispatch,
  selectedNumber,
  noneSelected,
  pageSelected,
  rowsNumber
) => ({
  count: selectedNumber,
  id: 'bulk-select-systems',
  items: [
    {
      title: 'Select none (0)',
      onClick: () => dispatch(selectEntity(-1, false)),
      props: { isDisabled: noneSelected },
    },
    {
      title: `${
        pageSelected ? 'Deselect' : 'Select'
      } page (${rowsNumber} items)`,
      onClick: () => dispatch(selectEntity(0, !pageSelected)),
    },
    // TODO: Implement "select all"
  ],
  onSelect: (value) => {
    dispatch(selectEntity(0, value));
  },
  checked: selectedNumber > 0 && pageSelected, // TODO: support partial selection (dash sign) in FEC BulkSelect
});

export const prepareColumns = (initialColumns, hideGroupColumn) => {
  // hides the "groups" column
  const columns = hideGroupColumn
    ? initialColumns.filter(({ key }) => key !== 'groups')
    : initialColumns;

  // additionally insert the "update method" column
  columns.splice(columns.length - 2 /* must be the 3rd col from the end */, 0, {
    key: 'update_method',
    title: 'Update method',
    sortKey: 'update_method',
    transforms: [fitContent],
    renderFunc: (value, hostId, systemData) =>
      systemData?.system_profile?.system_update_method || 'N/A',
    props: {
      // TODO: remove isStatic when the sorting is supported by API
      isStatic: true,
      width: 10,
    },
  });

  columns[columns.findIndex(({ key }) => key === 'display_name')].renderFunc = (
    value,
    hostId
  ) => (
    <div className="sentry-mask data-hj-suppress">
      <Link to={`/${hostId}`}>{value}</Link>
    </div>
  );

  // map columns to the speicifc order
  return [
    'display_name',
    'groups',
    'tags',
    'system_profile',
    'update_method',
    'updated',
  ]
    .map((colKey) => columns.find(({ key }) => key === colKey))
    .filter(Boolean); // eliminate possible undefined's
};

const GroupSystems = ({ groupName, groupId }) => {
  const dispatch = useDispatch();
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [currentSystem, setCurrentSystem] = useState([]);
  const inventory = useRef(null);

  const selected = useSelector(
    (state) => state?.entities?.selected || new Map()
  );
  const rows = useSelector(({ entities }) => entities?.rows || []);

  const noneSelected = selected.size === 0;
  const displayedIds = map(rows, 'id');
  const pageSelected =
    difference(displayedIds, [...selected.keys()]).length === 0;

  const [addToGroupModalOpen, setAddToGroupModalOpen] = useState(false);

  const { hasAccess: canModify } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId)
  );

  const resetTable = () => {
    dispatch(clearFilters());
    dispatch(selectEntity(-1, false));
  };

  useEffect(() => {
    return () => {
      resetTable();
    };
  }, []);

  const calculateSelected = () => (selected ? selected.size : 0);

  return (
    <div id="group-systems-table">
      {addToGroupModalOpen && (
        <AddSystemsToGroupModal
          isModalOpen={addToGroupModalOpen}
          setIsModalOpen={(value) => {
            resetTable();
            setAddToGroupModalOpen(value);
          }}
          groupId={groupId}
          groupName={groupName}
        />
      )}
      {removeHostsFromGroupModalOpen && (
        <RemoveHostsFromGroupModal
          isModalOpen={removeHostsFromGroupModalOpen}
          setIsModalOpen={setRemoveHostsFromGroupModalOpen}
          modalState={currentSystem}
          reloadData={() => {
            if (calculateSelected() > 0) {
              dispatch(selectEntity(-1, false));
            }

            inventory.current.onRefreshData({}, false, true);
          }}
        />
      )}
      {!addToGroupModalOpen && (
        <InventoryTable
          columns={(columns) => prepareColumns(columns, true)}
          hideFilters={{ hostGroupFilter: true }}
          getEntities={async (items, config, showTags, defaultGetEntities) =>
            await defaultGetEntities(
              items,
              // filter systems by the group name
              {
                ...config,
                filters: {
                  ...config.filters,
                  hostGroupFilter: [groupName],
                },
              },
              showTags
            )
          }
          tableProps={{
            isStickyHeader: true,
            variant: TableVariant.compact,
            canSelectAll: false,
            actionResolver: (row) => [
              {
                title: (
                  <ActionDropdownItem
                    requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                      groupId
                    )}
                    noAccessTooltip={NO_MODIFY_GROUP_TOOLTIP_MESSAGE}
                    onClick={() => {
                      setCurrentSystem([row]);
                      setRemoveHostsFromGroupModalOpen(true);
                    }}
                  >
                    Remove from group
                  </ActionDropdownItem>
                ),
                style: {
                  padding: 0, // custom component creates extra padding space
                },
              },
            ],
          }}
          actionsConfig={{
            actions: [
              <ActionButton
                key="add-systems-button"
                requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                  groupId
                )}
                noAccessTooltip={NO_MODIFY_GROUP_TOOLTIP_MESSAGE}
                onClick={() => {
                  resetTable();
                  setAddToGroupModalOpen(true);
                }}
              >
                Add systems
              </ActionButton>,
              {
                label: 'Remove from group',
                props: {
                  isAriaDisabled: !canModify || calculateSelected() === 0,
                  ...(!canModify && {
                    tooltip: NO_MODIFY_GROUP_TOOLTIP_MESSAGE,
                  }),
                },
                onClick: () => {
                  setCurrentSystem(Array.from(selected.values()));
                  setRemoveHostsFromGroupModalOpen(true);
                },
              },
            ],
          }}
          bulkSelect={bulkSelectConfig(
            dispatch,
            selected.size,
            noneSelected,
            pageSelected,
            rows.length
          )}
          showTags
          ref={inventory}
        />
      )}
    </div>
  );
};

GroupSystems.propTypes = {
  groupName: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
};

export default GroupSystems;
