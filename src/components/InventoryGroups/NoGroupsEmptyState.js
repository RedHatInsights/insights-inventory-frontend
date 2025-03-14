import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Tooltip,
  EmptyStateHeader,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

import { global_palette_black_600 as globalPaletteBlack600 } from '@patternfly/react-tokens';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { GENERAL_GROUPS_WRITE_PERMISSION } from '../../constants';

const REQUIRED_PERMISSIONS = [GENERAL_GROUPS_WRITE_PERMISSION];

const NoGroupsEmptyState = ({ onCreateGroupClick }) => {
  const { hasAccess: canModifyGroups } =
    usePermissionsWithContext(REQUIRED_PERMISSIONS);

  return (
    <EmptyState
      data-ouia-component-id="empty-state"
      data-ouia-component-type="PF5/EmptyState"
      data-ouia-safe={true}
    >
      <EmptyStateHeader
        titleText="No workspaces"
        icon={
          <EmptyStateIcon
            icon={PlusCircleIcon}
            color={globalPaletteBlack600.value}
            data-testid="no-groups-icon"
          />
        }
        headingLevel="h4"
      />
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
