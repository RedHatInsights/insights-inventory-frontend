import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import { useKesselMigration } from '../../Contexts/KesselMigrationContext';

/**
 * Conditional RBAC hook that skips RBAC checks when Kessel migration is enabled.
 * When Kessel is enabled, returns default access (hasAccess: true) to bypass legacy RBAC.
 * When Kessel is disabled, uses the standard usePermissionsWithContext hook.
 *
 *  @param   {Array}   requiredPermissions      - Array of permission objects or strings
 *  @param   {boolean} checkAll                 - Whether all permissions must be fulfilled
 *  @param   {boolean} checkResourceDefinitions - Whether to check resource definitions
 *  @returns {object}                           Object with hasAccess and isOrgAdmin properties
 */
export const useConditionalRBAC = (
  requiredPermissions,
  checkAll = false,
  checkResourceDefinitions = true,
) => {
  const isKesselMigrationEnabled = useKesselMigration();

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
