import React from 'react';
import PropTypes from 'prop-types';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { GENERAL_HOSTS_READ_PERMISSIONS } from '../constants';

const RenderWrapper = ({
  cmp: Component,
  isRbacEnabled,
  inventoryRef,
  store,
  ...props
}) => {
  const { hasAccess } = usePermissionsWithContext(
    [GENERAL_HOSTS_READ_PERMISSIONS],
    true,
    false // omit RD check to find out if there are any inventory:hosts:read available
  );

  return (
    <Component
      {...props}
      {...(inventoryRef && {
        ref: inventoryRef,
      })}
      isRbacEnabled={isRbacEnabled}
      hasAccess={hasAccess}
      store={store}
    />
  );
};

RenderWrapper.propTypes = {
  cmp: PropTypes.any,
  inventoryRef: PropTypes.any,
  store: PropTypes.object,
  customRender: PropTypes.bool,
  isRbacEnabled: PropTypes.bool,
};

export default RenderWrapper;
