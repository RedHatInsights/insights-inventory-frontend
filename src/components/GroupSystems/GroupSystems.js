import { TableVariant } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import InventoryTable from '../InventoryTable/InventoryTable';
import { useSearchParams } from 'react-router-dom';
import RemoveHostsFromGroupModal from '../InventoryGroups/Modals/RemoveHostsFromGroupModal';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import { useWorkspaceDetailEditActionsAccess } from '../../Utilities/hooks/useWorkspaceDetailEditActionsAccess';
import {
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
import useOnRefresh from '../filters/useOnRefresh';
import { generateFilter } from '../../Utilities/constants';
import { prepareColumns } from './helpers';
import { useDeepCompareMemo } from 'use-deep-compare';

const defaultWorkspaceAccess = {
  canEdit: undefined,
  isLoading: false,
  gateActive: false,
};

const GroupSystems = ({
  groupName,
  groupId,
  ungrouped,
  workspaceAccess = defaultWorkspaceAccess,
}) => {
  const {
    canEdit: workspaceKesselCanEdit,
    isLoading: workspaceKesselPermissionsLoading,
    gateActive: workspaceKesselGateActive,
  } = workspaceAccess;
  const dispatch = useDispatch();
  const globalFilter = useGlobalFilter();
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [currentSystem, setCurrentSystem] = useState([]);
  const inventory = useRef(null);

  const selected = useSelector(
    (state) => state?.entities?.selected || new Map(),
  );
  const rows = useSelector(({ entities }) => entities?.rows || []);
  const total = useSelector(({ entities }) => entities?.total);
  const displayedIds = map(rows, 'id');
  const pageSelected =
    difference(displayedIds, [...selected.keys()]).length === 0;

  const [addToGroupModalOpen, setAddToGroupModalOpen] = useState(false);

  const { hasAccess: canModify } = useConditionalRBAC(
    REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId),
  );

  const {
    canModifyWorkspaceForActions,
    noAccessEditTooltip,
    kesselActionOverride,
  } = useWorkspaceDetailEditActionsAccess({
    workspaceKesselGateActive,
    workspaceKesselCanEdit,
    workspaceKesselPermissionsLoading,
    rbacCanModify: canModify,
  });

  const [searchParams] = useSearchParams();
  const removeLabel = 'Remove from workspace';

  /*eslint-disable react-hooks/exhaustive-deps*/
  useEffect(() => {
    const { page, perPage } = getSearchParams(searchParams);

    if (perPage !== null || page !== null) {
      dispatch(setPagination(page, perPage));
    }

    return () => {
      dispatch(clearEntitiesAction());
    };
  }, []);
  /*eslint-enable react-hooks/exhaustive-deps*/

  const calculateSelected = () => (selected ? selected.size : 0);

  const onRefresh = useOnRefresh();
  const initialFilters = useDeepCompareMemo(() => {
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
      lastSeenFilter,
    );
  }, [addToGroupModalOpen, searchParams]);

  const bulkSelectConfig = useBulkSelectConfig(
    selected,
    globalFilter,
    total,
    rows,
    true,
    pageSelected,
    groupName,
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
        />
      )}
      {removeHostsFromGroupModalOpen && (
        <RemoveHostsFromGroupModal
          isModalOpen={removeHostsFromGroupModalOpen}
          setIsModalOpen={setRemoveHostsFromGroupModalOpen}
          modalState={currentSystem}
        />
      )}
      {!addToGroupModalOpen && (
        <InventoryTable
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
              showTags,
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
                      groupId,
                    )}
                    isAriaDisabled={ungrouped || !canModifyWorkspaceForActions}
                    noAccessTooltip={noAccessEditTooltip}
                    override={kesselActionOverride}
                    {...(!canModifyWorkspaceForActions && {
                      tooltipProps: { content: noAccessEditTooltip },
                    })}
                    onClick={() => {
                      setCurrentSystem([row]);
                      setRemoveHostsFromGroupModalOpen(true);
                    }}
                  >
                    {removeLabel}
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
                  groupId,
                )}
                noAccessTooltip={noAccessEditTooltip}
                override={kesselActionOverride}
                onClick={() => {
                  dispatch(clearEntitiesAction());
                  setAddToGroupModalOpen(true);
                }}
                ouiaId="add-systems-button"
                isAriaDisabled={ungrouped || !canModifyWorkspaceForActions}
              >
                Add systems
              </ActionButton>,
              {
                label: removeLabel,
                props: {
                  isAriaDisabled:
                    ungrouped ||
                    !canModifyWorkspaceForActions ||
                    calculateSelected() === 0,
                  ...(!canModifyWorkspaceForActions && {
                    tooltipProps: {
                      content: noAccessEditTooltip,
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
      )}
    </div>
  );
};

GroupSystems.propTypes = {
  groupName: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
  ungrouped: PropTypes.string,
  hostType: PropTypes.string,
  workspaceAccess: PropTypes.shape({
    canEdit: PropTypes.bool,
    isLoading: PropTypes.bool,
    gateActive: PropTypes.bool,
  }),
};

GroupSystems.defaultProps = {
  ungrouped: false,
};

export default GroupSystems;
