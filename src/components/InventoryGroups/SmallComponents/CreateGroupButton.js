import React from 'react';
import { Button, Text, Tooltip } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { NO_MODIFY_GROUPS_TOOLTIP_MESSAGE } from '../../../constants';

export const CreateGroupButton = ({ closeModal }) => {
  const { hasAccess: canModifyGroups } = usePermissionsWithContext([
    'inventory:groups:write',
  ]);

  return (
    <>
      <Text>Or</Text>
      {canModifyGroups ? (
        <Button variant="secondary" className="pf-u-w-50" onClick={closeModal}>
          Create a new group
        </Button>
      ) : (
        <Tooltip content={NO_MODIFY_GROUPS_TOOLTIP_MESSAGE}>
          <Button variant="secondary" className="pf-u-w-50" isAriaDisabled>
            Create a new group
          </Button>
        </Tooltip>
      )}
    </>
  );
};

CreateGroupButton.propTypes = {
  closeModal: PropTypes.func,
};
