/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import HostStalenessCard from './HostStalenessCard';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { GENERAL_HOST_STALENESS_WRITE_PERMISSION } from './constants';

const REQUIRED_PERMISSIONS = [GENERAL_HOST_STALENESS_WRITE_PERMISSION];

const InventoryHostStaleness = () => {
  const { hasAccess: canModifyHostStaleness } =
    usePermissionsWithContext(REQUIRED_PERMISSIONS);

  return (
    <section>
      <HostStalenessCard canModifyHostStaleness={canModifyHostStaleness} />
    </section>
    //TBD : Table will go here
  );
};

export default InventoryHostStaleness;
