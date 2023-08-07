/**
 * This module contains Button and DropdownItem components wrapped by RBAC checks.
 * If host is in a group, then a minimum required RBAC permission is the group-level inventory:hosts:write.
 */
import React from 'react';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { Button, DropdownItem, Tooltip } from '@patternfly/react-core';
import PropTypes from 'prop-types';

export const ActionButton = ({
  requiredPermissions,
  noAccessTooltip,
  ...props
}) => {
  const { hasAccess: enabled } = usePermissionsWithContext(requiredPermissions);

  return enabled ? (
    <Button {...props} />
  ) : (
    <Tooltip content={noAccessTooltip}>
      <Button {...props} isAriaDisabled />
    </Tooltip>
  );
};

ActionButton.propTypes = {
  requiredPermissions: PropTypes.array,
  noAccessTooltip: PropTypes.string,
};

export const ActionDropdownItem = ({
  requiredPermissions,
  noAccessTooltip,
  ...props
}) => {
  const { hasAccess: enabled } = usePermissionsWithContext(requiredPermissions);

  return enabled ? (
    <DropdownItem {...props} />
  ) : (
    <DropdownItem {...props} isAriaDisabled tooltip={noAccessTooltip} />
  );
};

ActionDropdownItem.propTypes = {
  requiredPermissions: PropTypes.array,
  noAccessTooltip: PropTypes.string,
};
