import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import type { Access } from '@redhat-cloud-services/rbac-client/types';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';

/** Permission can be a string (e.g. 'inventory:hosts:read') or an object with resource definitions. */
export type Permission = string | Access;

/**
 * Conditional RBAC hook that skips RBAC checks when Kessel migration is enabled.
 * When Kessel is enabled, returns default access (hasAccess: true) to bypass legacy RBAC.
 * When Kessel is disabled, uses the standard usePermissionsWithContext hook.
 *
 *  @param requiredPermissions      - Array of permission objects or strings
 *  @param checkAll                 - Whether all permissions must be fulfilled
 *  @param checkResourceDefinitions - Whether to check resource definitions
 *  @returns                        Object with hasAccess and isOrgAdmin properties
 */
export const useConditionalRBAC = (
  requiredPermissions: Permission[],
  checkAll = false,
  checkResourceDefinitions = true,
) => {
  const isKesselMigrationEnabled = useKesselMigrationFeatureFlag();

  const rbacResult = usePermissionsWithContext(
    isKesselMigrationEnabled ? [] : requiredPermissions,
    isKesselMigrationEnabled ? false : checkAll,
    isKesselMigrationEnabled ? false : checkResourceDefinitions,
  );

  if (isKesselMigrationEnabled) {
    return { hasAccess: true, isOrgAdmin: false };
  }

  return rbacResult;
};
