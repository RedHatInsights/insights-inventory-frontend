import { useMemo } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { type BulkSelfAccessCheckNestedRelationsParams } from '@project-kessel/react-kessel-access-check/types';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';
import {
  HOST_RESOURCE_TYPE,
  HOST_RESOURCE_TYPE_UPDATE,
  HOST_RESOURCE_TYPE_DELETE,
  WORKSPACE_RESOURCE_TYPE,
  WORKSPACE_RELATION_EDIT,
  KESSEL_REPORTER,
  KESSEL_WORKSPACE_REPORTER,
} from '../../constants';
import { System } from '../../components/SystemsView/hooks/useSystemsQuery';

interface HostPermissions {
  hasUpdate: boolean;
  hasDelete: boolean;
  hasWorkspaceEdit: boolean;
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
 * `permissions: { hasUpdate, hasDelete, hasWorkspaceEdit }`.
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

  // Unique workspace (group) IDs on this page — includes Ungrouped Hosts (`ungrouped: true`),
  // which still has an RBAC workspace id used for Kessel `workspace` + `edit` checks.
  const workspaceIds = useMemo(() => {
    if (!isKesselEnabled || !hosts?.length) return [];
    const ids = new Set<string>();
    for (const host of hosts) {
      const group = host?.groups?.[0];
      if (group?.id) {
        ids.add(group?.id);
      }
    }
    return Array.from(ids);
  }, [isKesselEnabled, hosts]);

  // Single bulk check: host update/delete + workspace edit for each unique workspace.
  const resources = useMemo(() => {
    const hostResources = hostIds.flatMap((id: string) => [
      {
        id,
        type: HOST_RESOURCE_TYPE,
        relation: HOST_RESOURCE_TYPE_UPDATE,
        reporter: KESSEL_REPORTER,
      },
      {
        id,
        type: HOST_RESOURCE_TYPE,
        relation: HOST_RESOURCE_TYPE_DELETE,
        reporter: KESSEL_REPORTER,
      },
    ]);
    const workspaceResources = workspaceIds.map((id) => ({
      id,
      type: WORKSPACE_RESOURCE_TYPE,
      relation: WORKSPACE_RELATION_EDIT,
      reporter: KESSEL_WORKSPACE_REPORTER,
    }));
    return [...hostResources, ...workspaceResources];
  }, [hostIds, workspaceIds]);

  const {
    data: checks,
    loading: permissionsLoading,
    error: permissionsError,
  } = useSelfAccessCheck({
    resources,
  } as BulkSelfAccessCheckNestedRelationsParams);

  const permissionsByHostId = useMemo(() => {
    const map = new Map<string, Omit<HostPermissions, 'hasWorkspaceEdit'>>();

    if (!checks?.length) {
      return map;
    }

    for (const check of checks) {
      const id = check.resource?.id;

      if (!id) {
        continue;
      }

      const current = map.get(id) ?? {
        hasUpdate: false,
        hasDelete: false,
      };

      if (check.relation === HOST_RESOURCE_TYPE_UPDATE) {
        map.set(id, { ...current, hasUpdate: check.allowed });
      } else if (check.relation === HOST_RESOURCE_TYPE_DELETE) {
        map.set(id, { ...current, hasDelete: check.allowed });
      }
    }

    return map;
  }, [checks]);

  const workspaceEditByWorkspaceId = useMemo(() => {
    const map = new Map<string, boolean>();
    if (!checks?.length) return map;
    for (const check of checks) {
      if (check.relation === WORKSPACE_RELATION_EDIT && check.resource?.id) {
        map.set(check.resource.id, check.allowed);
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
      hasWorkspaceEdit: false,
    };
    return hosts.map((host) => {
      const hostPerms = permissionsByHostId.get(host?.id as string) ?? {
        hasUpdate: false,
        hasDelete: false,
      };
      const group = host?.groups?.[0];
      // Same `workspace` + `edit` self-access as other workspaces; Ungrouped Hosts must not bypass Kessel.
      // Hosts with no group payload keep permissive default so legacy responses still allow move when unknown.
      const hasWorkspaceEdit = group?.id
        ? (workspaceEditByWorkspaceId.get(group.id) ?? false)
        : true;
      return {
        ...host,
        permissions: isKesselEnabled
          ? { ...hostPerms, hasWorkspaceEdit }
          : { ...defaultPermissions, hasWorkspaceEdit: true },
      };
    }) as SystemWithPermissions[];
  }, [hosts, isKesselEnabled, permissionsByHostId, workspaceEditByWorkspaceId]);

  return {
    hostIds,
    isKesselEnabled,
    hostsWithPermissions,
    permissionsLoading,
    permissionsError,
  };
};
