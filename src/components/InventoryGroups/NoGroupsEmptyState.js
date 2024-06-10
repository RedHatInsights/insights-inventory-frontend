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

import { global_palette_black_600 as globalPaletteBlack600 } from '@patternfly/react-tokens/dist/js/global_palette_black_600';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { GENERAL_GROUPS_WRITE_PERMISSION } from '../../constants';
import useWorkspaceFeatureFlag from '../../Utilities/hooks/useWorkspaceFeatureFlag';

const REQUIRED_PERMISSIONS = [GENERAL_GROUPS_WRITE_PERMISSION];

const NoGroupsEmptyState = ({ onCreateGroupClick }) => {
  const { hasAccess: canModifyGroups } =
    usePermissionsWithContext(REQUIRED_PERMISSIONS);
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();

  return (
    <EmptyState
      data-ouia-component-id="empty-state"
      data-ouia-component-type="PF4/EmptyState"
      data-ouia-safe={true}
    >
      <EmptyStateHeader
        titleText={isWorkspaceEnabled ? 'No workspaces' : 'No inventory groups'}
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
        {`Manage device operations efficiently by creating ${
          isWorkspaceEnabled ? 'workspaces' : 'inventory groups.'
        }`}
      </EmptyStateBody>
      <EmptyStateFooter>
        {canModifyGroups ? (
          <Button
            variant="primary"
            onClick={onCreateGroupClick}
            ouiaId="CreateGroupButton"
          >
            {isWorkspaceEnabled ? 'Create workspace' : 'Create group'}
          </Button>
        ) : (
          <Tooltip
            content={`You do not have the necessary permissions to modify ${
              isWorkspaceEnabled ? 'workspaces' : 'groups'
            }. Contact your organization administrator.`}
          >
            <Button variant="primary" isAriaDisabled ouiaId="CreateGroupButton">
              {isWorkspaceEnabled ? 'Create workspace' : 'Create group'}
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
