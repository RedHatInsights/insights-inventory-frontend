import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  Tooltip,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import { GENERAL_GROUPS_WRITE_PERMISSION } from '../../constants';

const REQUIRED_PERMISSIONS = [GENERAL_GROUPS_WRITE_PERMISSION];

const NoGroupsEmptyState = ({ onCreateGroupClick }) => {
  const { hasAccess: canModifyGroups } =
    useConditionalRBAC(REQUIRED_PERMISSIONS);

  return (
    <EmptyState
      headingLevel="h4"
      icon={PlusCircleIcon}
      titleText="No workspaces"
      data-ouia-component-id="empty-state"
      data-ouia-component-type="PF6/EmptyState"
      data-ouia-safe={true}
    >
      <EmptyStateBody>
        Manage device operations efficiently by creating workspaces
      </EmptyStateBody>
      <EmptyStateFooter>
        {canModifyGroups ? (
          <Button
            variant="primary"
            onClick={onCreateGroupClick}
            ouiaId="CreateGroupButton"
          >
            Create workspace
          </Button>
        ) : (
          <Tooltip content="You do not have the necessary permissions to modify workspaces. Contact your organization administrator.">
            <Button variant="primary" isAriaDisabled ouiaId="CreateGroupButton">
              Create workspace
            </Button>
          </Tooltip>
        )}
      </EmptyStateFooter>
    </EmptyState>
  );
};

NoGroupsEmptyState.propTypes = {
  onCreateGroupClick: PropTypes.func,
};

export default NoGroupsEmptyState;
