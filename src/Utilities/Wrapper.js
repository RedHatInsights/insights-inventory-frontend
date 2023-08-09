import React from 'react';
import PropTypes from 'prop-types';
import { usePermissions } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';

const RenderWrapper = ({
  cmp: Component,
  isRbacEnabled,
  inventoryRef,
  store,
  ...props
}) => {
  const { hasAccess } = usePermissions('inventory', ['inventory:hosts:read']);

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
