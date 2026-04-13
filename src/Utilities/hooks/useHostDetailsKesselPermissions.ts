import { useMemo } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { type BulkSelfAccessCheckNestedRelationsParams } from '@project-kessel/react-kessel-access-check/types';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';
import {
  HOST_RESOURCE_TYPE,
  HOST_RESOURCE_TYPE_VIEW,
  HOST_RESOURCE_TYPE_UPDATE,
  HOST_RESOURCE_TYPE_DELETE,
  KESSEL_REPORTER,
} from '../../constants';

export type HostDetailsKesselPermission = boolean | undefined;

export interface HostDetailsKesselPermissions {
  /** When Kessel is off, undefined (use RBAC). When on, whether the user may view this host. */
  canView: HostDetailsKesselPermission;
  /** When Kessel is off, undefined (use RBAC). When on, whether the user may update this host (e.g. display name). */
  canUpdate: HostDetailsKesselPermission;
  /** When Kessel is off, undefined (use RBAC). When on, whether the user may delete this host. */
  canDelete: HostDetailsKesselPermission;
  isLoading: boolean;
}

/**
 * Single bulk Kessel self-access check for the system details page: view, update, and delete
 * on one host. When the Kessel migration flag is off, returns undefined flags and isLoading false
 * so callers use RBAC instead.
 *  @param hostId - Inventory host id for the current details page, or undefined when not available
 *  @returns      Kessel permission flags (`canView`, `canUpdate`, `canDelete`) and `isLoading`; when Kessel is off, permission fields are undefined
 */
export const useHostDetailsKesselPermissions = (
  hostId: string | undefined,
): HostDetailsKesselPermissions => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();

  const resources = useMemo(() => {
    if (!isKesselEnabled || !hostId) {
      return [];
    }
    return [
      {
        id: hostId,
        type: HOST_RESOURCE_TYPE,
        relation: HOST_RESOURCE_TYPE_VIEW,
        reporter: KESSEL_REPORTER,
      },
      {
        id: hostId,
        type: HOST_RESOURCE_TYPE,
        relation: HOST_RESOURCE_TYPE_UPDATE,
        reporter: KESSEL_REPORTER,
      },
      {
        id: hostId,
        type: HOST_RESOURCE_TYPE,
        relation: HOST_RESOURCE_TYPE_DELETE,
        reporter: KESSEL_REPORTER,
      },
    ];
  }, [isKesselEnabled, hostId]);

  const { data: checks, loading } = useSelfAccessCheck({
    resources,
  } as BulkSelfAccessCheckNestedRelationsParams);

  if (!isKesselEnabled) {
    return {
      canView: undefined,
      canUpdate: undefined,
      canDelete: undefined,
      isLoading: false,
    };
  }

  if (!hostId) {
    return {
      canView: false,
      canUpdate: false,
      canDelete: false,
      isLoading: false,
    };
  }

  const byRelation: Record<string, boolean> = {};
  if (checks?.length) {
    for (const check of checks) {
      const rel = check.relation;
      if (rel) {
        byRelation[rel] = check.allowed === true;
      }
    }
  }

  return {
    canView: byRelation[HOST_RESOURCE_TYPE_VIEW] ?? false,
    canUpdate: byRelation[HOST_RESOURCE_TYPE_UPDATE] ?? false,
    canDelete: byRelation[HOST_RESOURCE_TYPE_DELETE] ?? false,
    isLoading: loading,
  };
};
