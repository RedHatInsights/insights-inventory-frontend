import { useEffect, useMemo, useState } from 'react';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  fetchRootWorkspace,
  useSelfAccessCheck,
} from '@project-kessel/react-kessel-access-check';
import { type BulkSelfAccessCheckNestedRelationsParams } from '@project-kessel/react-kessel-access-check/types';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';
import {
  KESSEL_WORKSPACE_REPORTER,
  WORKSPACE_RESOURCE_TYPE,
} from '../../constants';

type AppName =
  | 'vulnerability'
  | 'advisor'
  | 'compliance'
  | 'content'
  | 'remediations'
  | 'malware';

interface AppServicePermissionConfig {
  rbacPermission: string;
  kesselRelation: string;
}

const APP_SERVICE_PERMISSIONS: Record<AppName, AppServicePermissionConfig> = {
  vulnerability: {
    rbacPermission: 'vulnerability:vulnerability_results:read',
    kesselRelation: 'vulnerability_vulnerability_results_view',
  },
  advisor: {
    rbacPermission: 'advisor:*:read',
    kesselRelation: 'advisor_recommendation_results_view',
  },
  compliance: {
    rbacPermission: 'compliance:system:read',
    kesselRelation: 'compliance_system_view',
  },
  content: {
    rbacPermission: 'patch:*:read',
    kesselRelation: 'patch_system_view',
  },
  remediations: {
    rbacPermission: 'remediations:remediation:read',
    kesselRelation: 'remediations_view_remediation',
  },
  malware: {
    rbacPermission: 'malware-detection:*:read',
    kesselRelation: 'malware_malware_view',
  },
};

const APP_NAMES = Object.keys(APP_SERVICE_PERMISSIONS) as AppName[];

export type AppServicePermissions = Record<AppName, boolean>;

interface UseAppServicePermissionsResult {
  permissions: AppServicePermissions | null;
  isLoading: boolean;
}

/**
 * Checks per-service RBAC permissions for each downstream service whose
 * data appears in the Inventory Views columns.
 *
 * RBAC v1 (Kessel OFF): one {@link usePermissionsWithContext} call per service.
 * Kessel v2 (Kessel ON): workspace-level bulk check via {@link useSelfAccessCheck}.
 */
export const useAppServicePermissions = (): UseAppServicePermissionsResult => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();
  const skipRbac = isKesselEnabled;

  // --- RBAC v1 path ---
  const vulnerabilityAccess = usePermissionsWithContext(
    skipRbac ? [] : [APP_SERVICE_PERMISSIONS.vulnerability.rbacPermission],
    false,
    false,
  );
  const advisorAccess = usePermissionsWithContext(
    skipRbac ? [] : [APP_SERVICE_PERMISSIONS.advisor.rbacPermission],
    false,
    false,
  );
  const complianceAccess = usePermissionsWithContext(
    skipRbac ? [] : [APP_SERVICE_PERMISSIONS.compliance.rbacPermission],
    false,
    false,
  );
  const contentAccess = usePermissionsWithContext(
    skipRbac ? [] : [APP_SERVICE_PERMISSIONS.content.rbacPermission],
    false,
    false,
  );
  const remediationsAccess = usePermissionsWithContext(
    skipRbac ? [] : [APP_SERVICE_PERMISSIONS.remediations.rbacPermission],
    false,
    false,
  );
  const malwareAccess = usePermissionsWithContext(
    skipRbac ? [] : [APP_SERVICE_PERMISSIONS.malware.rbacPermission],
    false,
    false,
  );

  const rbacResults = {
    vulnerability: vulnerabilityAccess,
    advisor: advisorAccess,
    compliance: complianceAccess,
    content: contentAccess,
    remediations: remediationsAccess,
    malware: malwareAccess,
  };

  const isAnyOrgAdmin = Object.values(rbacResults).some((r) => r.isOrgAdmin);

  // --- Kessel v2 path ---
  const [workspaceId, setWorkspaceId] = useState<string | undefined>();
  const [workspaceLoading, setWorkspaceLoading] = useState(isKesselEnabled);

  useEffect(() => {
    if (!isKesselEnabled || typeof window === 'undefined') {
      setWorkspaceId(undefined);
      setWorkspaceLoading(false);
      return;
    }

    let cancelled = false;
    setWorkspaceLoading(true);

    fetchRootWorkspace(window.location.origin, undefined, undefined)
      .then((ws) => {
        if (cancelled) return;
        setWorkspaceId(ws?.id ?? undefined);
        setWorkspaceLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setWorkspaceId(undefined);
        setWorkspaceLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isKesselEnabled]);

  const kesselResources = useMemo(() => {
    if (!isKesselEnabled || !workspaceId) return [];
    return APP_NAMES.map((appName) => ({
      id: workspaceId,
      type: WORKSPACE_RESOURCE_TYPE,
      reporter: KESSEL_WORKSPACE_REPORTER,
      relation: APP_SERVICE_PERMISSIONS[appName].kesselRelation,
    }));
  }, [isKesselEnabled, workspaceId]);

  const { data: kesselChecks, loading: kesselChecksLoading } =
    useSelfAccessCheck({
      resources: kesselResources,
    } as BulkSelfAccessCheckNestedRelationsParams);

  // --- Build result ---
  return useMemo((): UseAppServicePermissionsResult => {
    if (isKesselEnabled) {
      if (workspaceLoading || kesselChecksLoading) {
        return { permissions: null, isLoading: true };
      }

      const permissions = {} as AppServicePermissions;
      for (const appName of APP_NAMES) {
        const relation = APP_SERVICE_PERMISSIONS[appName].kesselRelation;
        const check = kesselChecks?.find((c) => c.relation === relation);
        permissions[appName] = check?.allowed ?? false;
      }
      return { permissions, isLoading: false };
    }

    // RBAC v1
    if (isAnyOrgAdmin) {
      const permissions = {} as AppServicePermissions;
      for (const appName of APP_NAMES) {
        permissions[appName] = true;
      }
      return { permissions, isLoading: false };
    }

    const permissions = {} as AppServicePermissions;
    for (const appName of APP_NAMES) {
      permissions[appName] = rbacResults[appName].hasAccess;
    }
    return { permissions, isLoading: false };
  }, [
    isKesselEnabled,
    workspaceLoading,
    kesselChecksLoading,
    kesselChecks,
    isAnyOrgAdmin,
    rbacResults.vulnerability.hasAccess,
    rbacResults.advisor.hasAccess,
    rbacResults.compliance.hasAccess,
    rbacResults.content.hasAccess,
    rbacResults.remediations.hasAccess,
    rbacResults.malware.hasAccess,
  ]);
};
