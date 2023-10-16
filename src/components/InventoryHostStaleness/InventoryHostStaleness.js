/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import HostStalenessCard from './HostStalenessCard';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  GENERAL_HOST_STALENESS_READ_PERMISSION,
  GENERAL_HOST_STALENESS_WRITE_PERMISSION,
} from './constants';
import {
  GENERAL_HOSTS_READ_PERMISSIONS,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
} from '../../constants';

const REQUIRED_PERMISSIONS = [
  GENERAL_HOST_STALENESS_WRITE_PERMISSION,
  GENERAL_HOST_STALENESS_READ_PERMISSION,
  GENERAL_HOSTS_READ_PERMISSIONS,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
];

const InventoryHostStaleness = () => {
  const { hasAccess: canModifyHostStaleness } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS,
    true
  );

  return (
    <section>
      <HostStalenessCard canModifyHostStaleness={canModifyHostStaleness} />
    </section>
    //TBD : Table will go here
  );
};

export default InventoryHostStaleness;
