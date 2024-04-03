import React from 'react';
import { Button, Text } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { GENERAL_GROUPS_WRITE_PERMISSION } from '../../../constants';

export const CreateGroupButton = ({ closeModal }) => {
  const { hasAccess: canModifyGroups } = usePermissionsWithContext([
    GENERAL_GROUPS_WRITE_PERMISSION,
  ]);

  return canModifyGroups ? (
    <>
      <Text>Or</Text>
      <Button variant="secondary" className="pf-v5-u-w-50" onClick={closeModal}>
        Create a new group
      </Button>
    </>
  ) : (
    <></>
  );
};

CreateGroupButton.propTypes = {
  closeModal: PropTypes.func,
};
