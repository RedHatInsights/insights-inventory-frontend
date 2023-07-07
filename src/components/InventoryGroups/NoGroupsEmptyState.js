import React, { useState } from 'react';
import {
  Button,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  Title,
  Tooltip,
} from '@patternfly/react-core';
import { ExternalLinkAltIcon, PlusCircleIcon } from '@patternfly/react-icons';
import PropTypes from 'prop-types';

import { global_palette_black_600 as globalPaletteBlack600 } from '@patternfly/react-tokens/dist/js/global_palette_black_600';
import CreateGroupModal from './Modals/CreateGroupModal';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const REQUIRED_PERMISSIONS = ['inventory:groups:write'];

const NoGroupsEmptyState = ({ reloadData }) => {
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const { hasAccess: canModifyGroups } =
    usePermissionsWithContext(REQUIRED_PERMISSIONS);

  return (
    <EmptyState
      data-ouia-component-id="empty-state"
      data-ouia-component-type="PF4/EmptyState"
      data-ouia-safe={true}
    >
      <CreateGroupModal
        isModalOpen={createGroupModalOpen}
        setIsModalOpen={setCreateGroupModalOpen}
        reloadData={reloadData}
      />
      <EmptyStateIcon
        icon={PlusCircleIcon}
        color={globalPaletteBlack600.value}
      />
      <Title headingLevel="h4" size="lg">
        Create a system group
      </Title>
      <EmptyStateBody>
        Manage device operations efficiently by creating system groups.
      </EmptyStateBody>
      {canModifyGroups ? (
        <Button variant="primary" onClick={() => setCreateGroupModalOpen(true)}>
          Create group
        </Button>
      ) : (
        <Tooltip content="You do not have the necessary permissions to modify groups. Contact your organization administrator.">
          <Button variant="primary" isAriaDisabled>
            Create group
          </Button>
        </Tooltip>
      )}
      <EmptyStateSecondaryActions>
        <Button
          variant="link"
          icon={<ExternalLinkAltIcon />}
          iconPosition="right"
          // TODO: component={(props) => <a href='' {...props} />}
        >
          Learn more about system groups
        </Button>
      </EmptyStateSecondaryActions>
    </EmptyState>
  );
};

NoGroupsEmptyState.propTypes = {
  reloadData: PropTypes.func,
};

export default NoGroupsEmptyState;
