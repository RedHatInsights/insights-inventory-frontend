import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { GENERAL_HOSTS_READ_PERMISSIONS } from '../constants';
import { AccountStatContext } from '../Contexts';

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
    false, // omit RD check to find out if there are any inventory:hosts:read available
  );
  const statContext = useContext(AccountStatContext);
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
      isKesselFFEnabled={statContext.isKesselEnabled}
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
