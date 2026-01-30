import React from 'react';
import PropTypes from 'prop-types';
import { useConditionalRBAC } from './hooks/useConditionalRBAC';
import { GENERAL_HOSTS_READ_PERMISSIONS } from '../constants';

const RenderWrapper = ({
  cmp: Component,
  isRbacEnabled,
  inventoryRef,
  store,
  ...props
}) => {
  const { hasAccess } = useConditionalRBAC(
    [GENERAL_HOSTS_READ_PERMISSIONS],
    true,
    false, // omit RD check to find out if there are any inventory:hosts:read available
  );
  const loadChromelessInventory =
    props?.tableProps?.envContext?.loadChromeless || false;
  return (
    <Component
      {...props}
      {...(inventoryRef && {
        ref: inventoryRef,
      })}
      isRbacEnabled={isRbacEnabled}
      hasAccess={props?.tableProps?.envContext?.loadChromeless || hasAccess}
      store={store}
      loadChromelessInventory={loadChromelessInventory}
    />
  );
};

RenderWrapper.propTypes = {
  cmp: PropTypes.elementType,
  inventoryRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  store: PropTypes.object,
  customRender: PropTypes.bool,
  isRbacEnabled: PropTypes.bool,
  tableProps: PropTypes.shape({
    envContext: PropTypes.shape({
      loadChromeless: PropTypes.bool,
    }),
  }),
};

export default RenderWrapper;
