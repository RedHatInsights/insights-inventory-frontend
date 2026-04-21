import { useEffect, useMemo, useState } from 'react';
import {
  fetchDefaultWorkspace,
  useSelfAccessCheck,
} from '@project-kessel/react-kessel-access-check';
import { type BulkSelfAccessCheckNestedRelationsParams } from '@project-kessel/react-kessel-access-check/types';
import {
  HOST_WORKSPACE_RELATION_UPDATE,
  HOST_WORKSPACE_RELATION_VIEW,
  KESSEL_WORKSPACE_REPORTER,
  STALENESS_WORKSPACE_RELATION_UPDATE,
  STALENESS_WORKSPACE_RELATION_VIEW,
  WORKSPACE_RESOURCE_TYPE,
} from '../../constants';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';

type WorkspaceState = {
  id?: string;
  loading: boolean;
  error: boolean;
};

export type HostStalenessKesselAccess =
  | { mode: 'rbac' }
  | {
      mode: 'kessel';
      isLoading: boolean;
      /** `staleness_staleness_view` + `inventory_host_view` on the Default workspace (`rbac/workspace`). */
      canViewPage: boolean;
      /** `staleness_staleness_update` + `inventory_host_update` on the Default workspace. */
      canEditStaleness: boolean;
      editDisabledTooltip?: string;
    };

/**
 * Kessel migration gating for the Staleness and Deletion page.
 *
 * Follows **Fetching Workspace IDs for Access Checks** in
 * [kessel-sdk-browser `react-kessel-access-check` README](https://github.com/project-kessel/kessel-sdk-browser/tree/master/packages/react-kessel-access-check#fetching-workspace-ids-for-access-checks):
 * resolve the Default workspace UUID with {@link fetchDefaultWorkspace}, then use it as `resource.id`
 * with `type: {@link WORKSPACE_RESOURCE_TYPE}` and `reporter: {@link KESSEL_WORKSPACE_REPORTER}`.
 *
 * Permissions are modeled on **`rbac/workspace`** in RedHatInsights/rbac-config `configs/stage/schemas/schema.zed`
 * (not a separate `staleness` or `hosts` resource type):
 * - **Staleness**: `staleness_staleness_view` (read / `inventory:staleness:read`–class access) and
 * `staleness_staleness_update` (write / update, includes `staleness_staleness_write` in schema).
 * - **Hosts in workspace**: `inventory_host_view` and `inventory_host_update` (inventory hosts read/write
 * for that workspace). Per-host checks use `type: 'host'` elsewhere; here everything uses the workspace object.
 *
 * Four nested bulk items, same `id`, same `type`/`reporter`, different `relation`.
 */
export const useHostStalenessKesselAccess = (): HostStalenessKesselAccess => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();

  const [workspace, setWorkspace] = useState<WorkspaceState>({
    id: undefined,
    loading: false,
    error: false,
  });

  useEffect(() => {
    if (!isKesselEnabled || typeof window === 'undefined') {
      setWorkspace({ id: undefined, loading: false, error: false });
      return;
    }

    let cancelled = false;
    setWorkspace((prev) => ({ ...prev, loading: true, error: false }));

    fetchDefaultWorkspace(window.location.origin, undefined, undefined)
      .then((ws) => {
        if (cancelled) return;
        if (ws?.id) {
          setWorkspace({ id: ws.id, loading: false, error: false });
        } else {
          setWorkspace({ id: undefined, loading: false, error: true });
        }
      })
      .catch(() => {
        if (cancelled) return;
        setWorkspace({ id: undefined, loading: false, error: true });
      });

    return () => {
      cancelled = true;
    };
  }, [isKesselEnabled]);

  const resources = useMemo(() => {
    if (!isKesselEnabled || !workspace.id) {
      return [];
    }
    const base = {
      id: workspace.id,
      type: WORKSPACE_RESOURCE_TYPE,
      reporter: KESSEL_WORKSPACE_REPORTER,
    };
    return [
      { ...base, relation: STALENESS_WORKSPACE_RELATION_VIEW },
      { ...base, relation: STALENESS_WORKSPACE_RELATION_UPDATE },
      { ...base, relation: HOST_WORKSPACE_RELATION_VIEW },
      { ...base, relation: HOST_WORKSPACE_RELATION_UPDATE },
    ];
  }, [isKesselEnabled, workspace.id]);

  const { data: checks, loading: checksLoading } = useSelfAccessCheck({
    resources,
  } as BulkSelfAccessCheckNestedRelationsParams);

  const isLoading =
    isKesselEnabled &&
    (workspace.loading || checksLoading || (!workspace.id && !workspace.error));

  const byRelation = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const check of checks ?? []) {
      if (!check?.relation) continue;
      map.set(check.relation, check.allowed === true);
    }
    return map;
  }, [checks]);

  const stalenessReadAllowed =
    byRelation.get(STALENESS_WORKSPACE_RELATION_VIEW) ?? false;
  const stalenessWriteAllowed =
    byRelation.get(STALENESS_WORKSPACE_RELATION_UPDATE) ?? false;
  const hostsReadAllowed =
    byRelation.get(HOST_WORKSPACE_RELATION_VIEW) ?? false;
  const hostsWriteAllowed =
    byRelation.get(HOST_WORKSPACE_RELATION_UPDATE) ?? false;

  return useMemo<HostStalenessKesselAccess>(() => {
    if (!isKesselEnabled) {
      return { mode: 'rbac' };
    }

    if (isLoading) {
      return {
        mode: 'kessel',
        isLoading: true,
        canViewPage: false,
        canEditStaleness: false,
      };
    }

    if (!workspace.id || workspace.error) {
      return {
        mode: 'kessel',
        isLoading: false,
        canViewPage: false,
        canEditStaleness: false,
      };
    }

    const canViewPage = stalenessReadAllowed && hostsReadAllowed;
    const canEditStaleness = stalenessWriteAllowed && hostsWriteAllowed;
    const editDisabledTooltip =
      canViewPage && !canEditStaleness
        ? 'You can view these settings, but editing requires staleness update and inventory host update permissions on the Default workspace.'
        : undefined;

    return {
      mode: 'kessel',
      isLoading: false,
      canViewPage,
      canEditStaleness,
      editDisabledTooltip,
    };
  }, [
    isKesselEnabled,
    isLoading,
    workspace.id,
    workspace.error,
    stalenessReadAllowed,
    stalenessWriteAllowed,
    hostsReadAllowed,
    hostsWriteAllowed,
  ]);
};
