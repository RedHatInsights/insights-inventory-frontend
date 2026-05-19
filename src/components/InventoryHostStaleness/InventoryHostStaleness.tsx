import React from 'react';
import HostStalenessCard from './HostStalenessCard';
import { useConditionalRBAC } from '../../Utilities/hooks/useConditionalRBAC';
import {
  GENERAL_HOST_STALENESS_READ_PERMISSION,
  GENERAL_HOST_STALENESS_WRITE_PERMISSION,
} from './constants';
import {
  asPermissionList,
  GENERAL_HOSTS_READ_PERMISSIONS,
  GENERAL_HOSTS_WRITE_PERMISSIONS,
} from '../../constants';

const REQUIRED_MODIFY_PERMISSIONS = [
  GENERAL_HOST_STALENESS_WRITE_PERMISSION,
  GENERAL_HOST_STALENESS_READ_PERMISSION,
  ...asPermissionList(GENERAL_HOSTS_READ_PERMISSIONS),
  ...asPermissionList(GENERAL_HOSTS_WRITE_PERMISSIONS),
];

interface InventoryHostStalenessProps {
  /** When set (Kessel migration), overrides RBAC for whether the user may edit staleness. */
  kesselCanModifyHostStaleness?: boolean;
  /** Optional tooltip when Edit is disabled (e.g. Kessel read-only). */
  editDisabledTooltip?: string;
}

const InventoryHostStaleness = ({
  kesselCanModifyHostStaleness,
  editDisabledTooltip,
}: InventoryHostStalenessProps) => {
  const { hasAccess: hasStalenessAndHostsWriteRbac } = useConditionalRBAC(
    REQUIRED_MODIFY_PERMISSIONS,
    true,
  );

  const canModifyHostStaleness =
    kesselCanModifyHostStaleness !== undefined
      ? kesselCanModifyHostStaleness
      : hasStalenessAndHostsWriteRbac;

  return (
    <section>
      <HostStalenessCard
        canModifyHostStaleness={canModifyHostStaleness}
        editDisabledTooltip={editDisabledTooltip}
      />
    </section>
  );
};

export default InventoryHostStaleness;
