import React from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { PlusCircleIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

import { global_palette_black_600 as globalPaletteBlack600 } from '@patternfly/react-tokens/dist/js/global_palette_black_600';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { GENERAL_GROUPS_WRITE_PERMISSION } from '../../constants';

const REQUIRED_PERMISSIONS = [GENERAL_GROUPS_WRITE_PERMISSION];

const NoGroupsEmptyState = ({ onCreateGroupClick }) => {
  const { hasAccess: canModifyGroups } =
    usePermissionsWithContext(REQUIRED_PERMISSIONS);

  return (
    <EmptyState
      data-ouia-component-id="empty-state"
      data-ouia-component-type="PF4/EmptyState"
      data-ouia-safe={true}
    >
      <EmptyStateIcon
        icon={PlusCircleIcon}
        color={globalPaletteBlack600.value}
        data-testid="no-groups-icon"
      />
      <Title headingLevel="h4" size="lg">
        No inventory groups
      </Title>
      <EmptyStateBody>
        Manage device operations efficiently by creating inventory groups.
      </EmptyStateBody>
      {canModifyGroups ? (
        <Button
          variant="primary"
          onClick={onCreateGroupClick}
          ouiaId="CreateGroupButton"
        >
          Create group
        </Button>
      ) : (
        <Tooltip content="You do not have the necessary permissions to modify groups. Contact your organization administrator.">
          <Button variant="primary" isAriaDisabled ouiaId="CreateGroupButton">
            Create group
          </Button>
        </Tooltip>
      )}
    </EmptyState>
  );
};

NoGroupsEmptyState.propTypes = {
  onCreateGroupClick: PropTypes.func,
};

export default NoGroupsEmptyState;
