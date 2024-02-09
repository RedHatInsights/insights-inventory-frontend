/**
 * This module contains Button and DropdownItem components wrapped by RBAC checks.
 *
 * The permissions are checked _only_ within the Inventory app context.
 */
import React from 'react';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { Button, MenuItem, Tooltip } from '@patternfly/react-core';
import PropTypes from 'prop-types';
import './ActionWithRBAC.scss';

export const ActionButton = ({
  requiredPermissions,
  noAccessTooltip,
  checkAll,
  override,
  ignoreResourceDefinitions,
  ...props
}) => {
  const { hasAccess: enabled } =
    override !== undefined
      ? { hasAccess: override }
      : usePermissionsWithContext(
          requiredPermissions,
          checkAll,
          !ignoreResourceDefinitions
        );

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
  checkAll: PropTypes.bool,
  override: PropTypes.bool,
  ignoreResourceDefinitions: PropTypes.bool,
};

ActionButton.defaultProps = {
  checkAll: false,
};

export const ActionDropdownItem = ({
  requiredPermissions,
  noAccessTooltip,
  checkAll,
  override,
  ignoreResourceDefinitions,
  ...props
}) => {
  const { hasAccess: enabled } =
    override !== undefined
      ? { hasAccess: override }
      : usePermissionsWithContext(
          requiredPermissions,
          checkAll,
          !ignoreResourceDefinitions
        );

  return enabled ? (
    <MenuItem className="inventory__action-menu-item" {...props} />
  ) : (
    <MenuItem
      {...props}
      className="inventory__action-menu-item"
      isAriaDisabled
      tooltipProps={{ content: noAccessTooltip }}
    />
  );
};

ActionDropdownItem.propTypes = {
  requiredPermissions: PropTypes.array,
  noAccessTooltip: PropTypes.string,
  checkAll: PropTypes.bool,
  override: PropTypes.bool,
  ignoreResourceDefinitions: PropTypes.bool,
};

ActionDropdownItem.defaultProps = {
  checkAll: false,
};
