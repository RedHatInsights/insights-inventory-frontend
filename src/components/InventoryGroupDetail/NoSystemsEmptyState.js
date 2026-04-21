import React, { useState } from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import PropTypes from 'prop-types';
import { REQUIRED_PERMISSIONS_TO_MODIFY_GROUP } from '../../constants';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import { useWorkspaceDetailEditActionsAccess } from '../../Utilities/hooks/useWorkspaceDetailEditActionsAccess';
import { ActionButton } from '../InventoryTable/ActionWithRBAC';

const NoSystemsEmptyState = ({
  groupId,
  groupName,
  workspaceKesselGateActive = false,
  workspaceKesselCanEdit,
  workspaceKesselPermissionsLoading = false,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { hasAccess: rbacCanModify } = useConditionalRBAC(
    REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId),
  );

  const {
    useKesselEditGate,
    canModifyWorkspaceForActions,
    noAccessEditTooltip,
    kesselActionOverride,
  } = useWorkspaceDetailEditActionsAccess({
    workspaceKesselGateActive,
    workspaceKesselCanEdit,
    workspaceKesselPermissionsLoading,
    rbacCanModify,
  });

  return (
    <EmptyState
      headingLevel="h4"
      icon={PlusCircleIcon}
      titleText="No systems added"
      data-ouia-component-id="empty-state"
      data-ouia-component-type="PF6/EmptyState"
      data-ouia-safe={true}
    >
      <AddSystemsToGroupModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        groupId={groupId}
        groupName={groupName}
      />
      <EmptyStateBody>
        To manage systems more effectively, add systems to the workspace.
      </EmptyStateBody>
      <EmptyStateFooter>
        <ActionButton
          requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId)}
          noAccessTooltip={noAccessEditTooltip}
          override={kesselActionOverride}
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          ouiaId="add-systems-button"
          isAriaDisabled={
            useKesselEditGate === true ? !canModifyWorkspaceForActions : false
          }
        >
          Add systems
        </ActionButton>
      </EmptyStateFooter>
    </EmptyState>
  );
};

NoSystemsEmptyState.propTypes = {
  groupId: PropTypes.string,
  groupName: PropTypes.string,
  workspaceKesselGateActive: PropTypes.bool,
  workspaceKesselCanEdit: PropTypes.bool,
  workspaceKesselPermissionsLoading: PropTypes.bool,
};
export default NoSystemsEmptyState;
