import { useMemo } from 'react';
import {
  useSelfAccessCheck,
  type NotEmptyArray,
  type SelfAccessCheckResourceWithRelation,
} from '@project-kessel/react-kessel-access-check';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';
import {
  HOST_RESOURCE_TYPE,
  PLACEHOLDER_ID,
  HOST_RESOURCE_TYPE_UPDATE,
  HOST_RESOURCE_TYPE_DELETE,
} from '../../constants';
import { System } from '../../components/SystemsView/hooks/useSystemsQuery';

/** Reporter for access checks; README recommends { type: 'rbac' } for RBAC-based authorization. */
const REPORTER = { type: 'hbi' as const };

interface HostPermissions {
  hasUpdate: boolean;
  hasDelete: boolean;
}

export interface SystemWithPermissions extends System {
  permissions: HostPermissions;
}

/**
 * Extracts host IDs from the current table host data, fetches edit/delete permissions
 * via the Kessel SDK (one bulk check with edit and delete relations), and returns hosts with permissions injected.
 * Gated behind the Kessel migration feature flag.
 *
 * Use in both the legacy InventoryTable and the new SystemsView. Returned
 * `hostsWithPermissions` can replace the GET /hosts response so each host has
 * `permissions: { hasUpdate, hasDelete }`.
 *
 *  @param hosts - Current page of host records (array of objects with at least an optional `id`)
 *  @returns     Object with hostIds, isKesselEnabled, hostsWithPermissions, permissionsLoading, permissionsError
 */
export const useHostIdsWithKessel = (hosts: System[] | undefined) => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();

  const hostIds = useMemo(() => {
    if (!isKesselEnabled || !hosts?.length) {
      return [];
    }
    return hosts
      .map((host) => host?.id)
      .filter((id): id is string => typeof id === 'string' && id.length > 0);
  }, [isKesselEnabled, hosts]);

  // Single bulk check with edit + delete per host (nested relations); placeholder when no hosts.
  const resources =
    useMemo((): NotEmptyArray<SelfAccessCheckResourceWithRelation> => {
      const ids = hostIds.length > 0 ? hostIds : [PLACEHOLDER_ID];
      const items = ids.flatMap((id) => [
        {
          id,
          type: HOST_RESOURCE_TYPE,
          relation: HOST_RESOURCE_TYPE_UPDATE,
          reporter: REPORTER,
        },
        {
          id,
          type: HOST_RESOURCE_TYPE,
          relation: HOST_RESOURCE_TYPE_DELETE,
          reporter: REPORTER,
        },
      ]);
      // flatMap returns T[]; NotEmptyArray is [T, ...T[]]. We always pass at least one id (PLACEHOLDER_ID), so items is non-empty.
      return items as unknown as NotEmptyArray<SelfAccessCheckResourceWithRelation>;
    }, [hostIds]);

  const {
    data: checks,
    loading: permissionsLoading,
    error: permissionsError,
  } = useSelfAccessCheck({
    resources,
  });

  const permissionsByHostId = useMemo(() => {
    const map = new Map<string, HostPermissions>();

    if (!checks?.length) {
      return map;
    }

    for (const check of checks) {
      const id = check.resource?.id;

      if (!id || id === PLACEHOLDER_ID) {
        continue;
      }

      const current = map.get(id) ?? { hasUpdate: false, hasDelete: false };

      if (check.relation === HOST_RESOURCE_TYPE_UPDATE) {
        map.set(id, { ...current, hasUpdate: check.allowed });
      } else if (check.relation === HOST_RESOURCE_TYPE_DELETE) {
        map.set(id, { ...current, hasDelete: check.allowed });
      }
    }

    return map;
  }, [checks]);

  const hostsWithPermissions = useMemo(():
    | SystemWithPermissions[]
    | undefined => {
    if (!hosts) return undefined;
    const defaultPermissions: HostPermissions = {
      hasUpdate: false,
      hasDelete: false,
    };
    return hosts.map((host) => ({
      ...host,
      permissions: isKesselEnabled
        ? (permissionsByHostId.get(host?.id as string) ?? defaultPermissions)
        : defaultPermissions,
    })) as SystemWithPermissions[];
  }, [hosts, isKesselEnabled, permissionsByHostId]);

  return {
    hostIds,
    isKesselEnabled,
    hostsWithPermissions,
    permissionsLoading,
    permissionsError,
  };
};
