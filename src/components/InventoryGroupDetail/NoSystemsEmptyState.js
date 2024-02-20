import React, { useState } from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';

import { global_palette_black_600 as globalPaletteBlack600 } from '@patternfly/react-tokens/dist/js/global_palette_black_600';
import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import PropTypes from 'prop-types';
import {
  NO_MODIFY_GROUP_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
} from '../../constants';
import { ActionButton } from '../InventoryTable/ActionWithRBAC';

const NoSystemsEmptyState = ({ groupId, groupName }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <EmptyState
      data-ouia-component-id="empty-state"
      data-ouia-component-type="PF4/EmptyState"
      data-ouia-safe={true}
    >
      <AddSystemsToGroupModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        groupId={groupId}
        groupName={groupName}
        edgeParityIsAllowed={true}
      />
      <EmptyStateHeader
        titleText="No systems added"
        icon={
          <EmptyStateIcon
            icon={PlusCircleIcon}
            color={globalPaletteBlack600.value}
          />
        }
        headingLevel="h4"
      />
      <EmptyStateBody>
        To manage systems more effectively, add systems to the group.
      </EmptyStateBody>
      <EmptyStateFooter>
        <ActionButton
          requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId)}
          noAccessTooltip={NO_MODIFY_GROUP_TOOLTIP_MESSAGE}
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
