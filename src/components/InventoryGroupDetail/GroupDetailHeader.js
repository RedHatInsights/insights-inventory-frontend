import {
  Dropdown,
  DropdownItem,
  DropdownList,
  Flex,
  FlexItem,
  MenuToggle,
  Skeleton,
  Tooltip,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import menuToggleStyles from '@patternfly/react-styles/css/components/MenuToggle/menu-toggle';
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
import './GroupDetailHeader.scss';

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
            toggle={(toggleRef) => {
              const detailLoading = uninitialized || loading;
              const actionsTogglePermissionDisabled =
                !canModifyWorkspaceForActions;
              const actionsToggleLoadingDisabled = detailLoading;
              const menuToggle = (
                <MenuToggle
                  ref={toggleRef}
                  isExpanded={dropdownOpen}
                  onClick={() => {
                    if (actionsTogglePermissionDisabled) {
                      return;
                    }
                    setDropdownOpen(!dropdownOpen);
                  }}
                  id="group-dropdown-toggle"
                  isDisabled={actionsToggleLoadingDisabled}
                  className={
                    actionsTogglePermissionDisabled &&
                    !actionsToggleLoadingDisabled
                      ? css(menuToggleStyles.modifiers.disabled)
                      : undefined
                  }
                  {...(actionsTogglePermissionDisabled &&
                    !actionsToggleLoadingDisabled && {
                      'aria-disabled': true,
                    })}
                  ouiaId="group-actions-dropdown-toggle"
                >
                  Actions
                </MenuToggle>
              );

              if (!canModifyWorkspaceForActions) {
                return (
                  <Tooltip content={noAccessEditTooltip}>
                    <span
                      data-testid="group-detail-header-actions-tooltip-trigger"
                      className="pf-v6-u-display-inline-block ins-c-group-detail-header__actions-tooltip-anchor"
                    >
                      {menuToggle}
                    </span>
                  </Tooltip>
                );
              }

              return menuToggle;
            }}
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
