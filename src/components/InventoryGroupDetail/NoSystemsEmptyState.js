import React, { useState } from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import PropTypes from 'prop-types';
import {
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
} from '../../constants';
import { ActionButton } from '../InventoryTable/ActionWithRBAC';

const NoSystemsEmptyState = ({ groupId, groupName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
        edgeParityIsAllowed={true}
      />
      <EmptyStateBody>
        To manage systems more effectively, add systems to the workspace.
      </EmptyStateBody>
      <EmptyStateFooter>
        <ActionButton
          requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId)}
          noAccessTooltip={NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE}
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          ouiaId="add-systems-button"
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
};
export default NoSystemsEmptyState;
