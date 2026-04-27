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
  const { hasAccess: canModifyHostStalenessRbac } = useConditionalRBAC(
    REQUIRED_PERMISSIONS,
    true,
  );

  const canModifyHostStaleness =
    kesselCanModifyHostStaleness !== undefined
      ? kesselCanModifyHostStaleness
      : canModifyHostStalenessRbac;

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
