import { TableVariant, fitContent } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import InventoryTable from '../InventoryTable/InventoryTable';
import { Link, useSearchParams } from 'react-router-dom';
import RemoveHostsFromGroupModal from '../InventoryGroups/Modals/RemoveHostsFromGroupModal';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  NO_MODIFY_GROUP_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
  getSearchParams,
} from '../../constants';
import {
  ActionButton,
  ActionDropdownItem,
} from '../InventoryTable/ActionWithRBAC';
import { clearEntitiesAction, setPagination } from '../../store/actions';
import { useBulkSelectConfig } from '../../Utilities/hooks/useBulkSelectConfig';
import difference from 'lodash/difference';
import map from 'lodash/map';
import useGlobalFilter from '../filters/useGlobalFilter';
import { hybridInventoryTabKeys } from '../../Utilities/constants';
import useOnRefresh from '../filters/useOnRefresh';
import { generateFilter } from '../../Utilities/constants';

export const prepareColumns = (
  initialColumns,
  hideGroupColumn,
  openTabOnClick = false
) => {
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
      <Link
        to={`../${hostId}`}
        {...(openTabOnClick ? { target: '_blank' } : {})}
      >
        {value}
      </Link>
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
  const globalFilter = useGlobalFilter();
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [currentSystem, setCurrentSystem] = useState([]);
  const inventory = useRef(null);

  const selected = useSelector(
    (state) => state?.entities?.selected || new Map()
  );
  const rows = useSelector(({ entities }) => entities?.rows || []);
  const total = useSelector(({ entities }) => entities?.total);
  const displayedIds = map(rows, 'id');
  const pageSelected =
    difference(displayedIds, [...selected.keys()]).length === 0;

  const [addToGroupModalOpen, setAddToGroupModalOpen] = useState(false);

  const { hasAccess: canModify } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId)
  );

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const { page, perPage } = getSearchParams(searchParams);

    if (perPage !== null || page !== null) {
      dispatch(setPagination(page, perPage));
    }

    return () => {
      dispatch(clearEntitiesAction());
    };
  }, []);

  const calculateSelected = () => (selected ? selected.size : 0);

  const onRefresh = useOnRefresh();
  const initialFilters = useMemo(() => {
    const {
      status,
      source,
      tagsFilter,
      filterbyName,
      operatingSystem,
      rhcdFilter,
      updateMethodFilter,
      hostGroupFilter,
      lastSeenFilter,
    } = getSearchParams(searchParams);

    return generateFilter(
      status,
      source,
      tagsFilter,
      filterbyName,
      operatingSystem,
      rhcdFilter,
      updateMethodFilter,
      hostGroupFilter,
      lastSeenFilter
    );
  }, [addToGroupModalOpen]);

  const bulkSelectConfig = useBulkSelectConfig(
    selected,
    globalFilter,
    total,
    rows,
    true,
    pageSelected,
    groupName
  );

  return (
    <div id="group-systems-table">
      {addToGroupModalOpen && (
        <AddSystemsToGroupModal
          isModalOpen={addToGroupModalOpen}
          setIsModalOpen={(value) => {
            dispatch(clearEntitiesAction());
            setAddToGroupModalOpen(value);
          }}
          groupId={groupId}
          groupName={groupName}
          edgeParityIsAllowed={true}
          activeTab={hybridInventoryTabKeys.conventional.key}
        />
      )}
      {removeHostsFromGroupModalOpen && (
        <RemoveHostsFromGroupModal
          isModalOpen={removeHostsFromGroupModalOpen}
          setIsModalOpen={setRemoveHostsFromGroupModalOpen}
          modalState={currentSystem}
        />
      )}
      <InventoryTable
        isolateStore={true}
        columns={(columns) => prepareColumns(columns, true)}
        hideFilters={{ hostGroupFilter: true }}
        initialLoading
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
                dispatch(clearEntitiesAction());
                setAddToGroupModalOpen(true);
              }}
              ouiaId="add-systems-button"
            >
              Add systems
            </ActionButton>,
            {
              label: 'Remove from group',
              props: {
                isAriaDisabled: !canModify || calculateSelected() === 0,
                ...(!canModify && {
                  tooltipProps: {
                    content: NO_MODIFY_GROUP_TOOLTIP_MESSAGE,
                  },
                }),
              },
              onClick: () => {
                setCurrentSystem(Array.from(selected.values()));
                setRemoveHostsFromGroupModalOpen(true);
              },
            },
          ],
        }}
        bulkSelect={bulkSelectConfig}
        showTags
        ref={inventory}
        showCentosVersions
        customFilters={{ filters: initialFilters, globalFilter }}
        autoRefresh
        onRefresh={onRefresh}
        ignoreRefresh
      />
    </div>
  );
};

GroupSystems.propTypes = {
  groupName: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  hostType: PropTypes.string,
};

export default GroupSystems;
