import React from 'react';
import PropTypes from 'prop-types';
import { ActionButton } from '../../../../../../components/InventoryTable/ActionWithRBAC';
import {
  GENERAL_HOSTS_WRITE_PERMISSIONS,
  NO_MODIFY_HOSTS_TOOLTIP_MESSAGE,
} from '../../../../../../constants';

const DedicatedAction = ({ onClick = () => {}, selected = [] }) => {
  return (
    <ActionButton
      requiredPermissions={[GENERAL_HOSTS_WRITE_PERMISSIONS]}
      noAccessTooltip={NO_MODIFY_HOSTS_TOOLTIP_MESSAGE}
      ignoreResourceDefinitions
      isAriaDisabled={!selected?.length}
      variant="primary"
      ouiaId="Primary"
      onClick={onClick}
    >
      Delete
    </ActionButton>
  );
};

DedicatedAction.propTypes = {
  onClick: PropTypes.func,
  selected: PropTypes.array,
};

export default DedicatedAction;
