import React from 'react';
import HostStalenessCard from './HostStalenessCard';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
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
  const { hasAccess: canModifyHostStaleness } = useConditionalRBAC(
    REQUIRED_PERMISSIONS,
    true,
  );

  return (
    <section>
      <HostStalenessCard canModifyHostStaleness={canModifyHostStaleness} />
    </section>
    //TBD : Table will go here
  );
};

export default InventoryHostStaleness;
