import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  Skeleton,
} from '@patternfly/react-core';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import DeleteGroupModal from '../InventoryGroups/Modals/DeleteGroupModal';
import RenameGroupModal from '../InventoryGroups/Modals/RenameGroupModal';
import { fetchGroupDetail } from '../../store/inventory-actions';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import { useWorkspaceDetailEditActionsAccess } from '../../Utilities/hooks/useWorkspaceDetailEditActionsAccess';
import {
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
  REQUIRED_PERMISSIONS_TO_READ_GROUP,
} from '../../constants';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';

const defaultWorkspaceAccess = {
  canEdit: undefined,
  isLoading: false,
  gateActive: false,
};

const GroupDetailHeader = ({
  groupId,
  workspaceAccess = defaultWorkspaceAccess,
}) => {
  const {
    canEdit: workspaceKesselCanEdit,
    isLoading: workspaceKesselPermissionsLoading,
    gateActive: workspaceKesselGateActive,
  } = workspaceAccess;
  const dispatch = useDispatch();
  const navigate = useInsightsNavigate();
  const { uninitialized, loading, data } = useSelector(
    (state) => state.groupDetail,
  );

  const { hasAccess: canRead } = useConditionalRBAC(
    REQUIRED_PERMISSIONS_TO_READ_GROUP(groupId),
  );

  const { hasAccess: rbacCanModify } = useConditionalRBAC(
    REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId),
  );

  const { canModifyWorkspaceForActions, noAccessEditTooltip } =
    useWorkspaceDetailEditActionsAccess({
      workspaceKesselGateActive,
      workspaceKesselCanEdit,
      workspaceKesselPermissionsLoading,
      rbacCanModify,
    });

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const name = data?.results?.[0]?.name;
  const ungrouped = data?.results?.[0]?.ungrouped;

  const getTitle = () => {
    if (canRead) {
      if (uninitialized || loading) {
        return (
          <Skeleton
            width="250px"
            screenreaderText="Loading workspace details"
          />
        );
      } else {
        return name || groupId; // in case of error, render just id from URL
      }
    }

    return groupId;
  };

  return (
    <PageHeader>
      {renameModalOpen && (
        <RenameGroupModal
          isModalOpen={renameModalOpen}
          setIsModalOpen={() => setRenameModalOpen(false)}
          modalState={{
            id: groupId,
            name: canRead ? name || groupId : groupId,
          }}
          reloadData={() => dispatch(fetchGroupDetail(groupId))}
        />
      )}
      {deleteModalOpen && (
        <DeleteGroupModal
          isModalOpen={deleteModalOpen}
          setIsModalOpen={() => setDeleteModalOpen(false)}
          reloadData={() => navigate('/groups')}
          groupIds={[groupId]}
        />
      )}
      <Flex
        id="group-header"
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <FlexItem>
          <PageHeaderTitle title={getTitle()} />
        </FlexItem>
        <FlexItem id="group-header-dropdown">
          <Dropdown
            isOpen={dropdownOpen}
            onOpenChange={(dropdownOpen) => setDropdownOpen(dropdownOpen)}
            onSelect={() => setDropdownOpen(false)}
            autoFocus={false}
            popperProps={{
              position: 'right',
            }}
            toggle={(toggleRef) => (
              <MenuToggle
                ref={toggleRef}
                isExpanded={dropdownOpen}
                onClick={() => setDropdownOpen(!dropdownOpen)}
                id="group-dropdown-toggle"
                toggleVariant="secondary"
                isDisabled={
                  !canModifyWorkspaceForActions || uninitialized || loading
                }
                ouiaId="group-actions-dropdown-toggle"
              >
                Actions
              </MenuToggle>
            )}
          >
            <DropdownList>
              <DropdownItem
                key="rename-group"
                onClick={() => setRenameModalOpen(true)}
                isAriaDisabled={ungrouped || !canModifyWorkspaceForActions}
                {...(!canModifyWorkspaceForActions && {
                  tooltipProps: { content: noAccessEditTooltip },
                })}
              >
                Rename workspace
              </DropdownItem>
              <DropdownItem
                key="delete-group"
                onClick={() => setDeleteModalOpen(true)}
                isAriaDisabled={ungrouped || !canModifyWorkspaceForActions}
                {...(!canModifyWorkspaceForActions && {
                  tooltipProps: { content: noAccessEditTooltip },
                })}
              >
                Delete workspace
              </DropdownItem>
            </DropdownList>
          </Dropdown>
        </FlexItem>
      </Flex>
    </PageHeader>
  );
};

GroupDetailHeader.propTypes = {
  groupId: PropTypes.string.isRequired,
  workspaceAccess: PropTypes.shape({
    canEdit: PropTypes.bool,
    isLoading: PropTypes.bool,
    gateActive: PropTypes.bool,
  }),
};

export default GroupDetailHeader;
