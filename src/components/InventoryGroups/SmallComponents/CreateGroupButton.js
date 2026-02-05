import React from 'react';
import { Button, Content } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import { useConditionalRBAC } from '../../../Utilities/hooks/useConditionalRBAC';
import { GENERAL_GROUPS_WRITE_PERMISSION } from '../../../constants';

export const CreateGroupButton = ({ closeModal }) => {
  const { hasAccess: canModifyGroups } = useConditionalRBAC([
    GENERAL_GROUPS_WRITE_PERMISSION,
  ]);

  return canModifyGroups ? (
    <>
      <Content component="p">Or</Content>
      <Button variant="secondary" className="pf-v6-u-w-50" onClick={closeModal}>
        Create workspace
      </Button>
    </>
  ) : (
    <></>
  );
};

CreateGroupButton.propTypes = {
  closeModal: PropTypes.func,
};
