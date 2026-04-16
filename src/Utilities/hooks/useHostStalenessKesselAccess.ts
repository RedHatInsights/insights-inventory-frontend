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

type DefaultWorkspaceStatus = 'idle' | 'loading' | 'ready' | 'error';

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

  const [defaultWorkspaceStatus, setDefaultWorkspaceStatus] =
    useState<DefaultWorkspaceStatus>('idle');
  const [defaultWorkspaceId, setDefaultWorkspaceId] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (!isKesselEnabled || typeof window === 'undefined') {
      setDefaultWorkspaceStatus('idle');
      setDefaultWorkspaceId(undefined);
      return;
    }

    let cancelled = false;
    setDefaultWorkspaceStatus('loading');
    fetchDefaultWorkspace(window.location.origin, undefined, undefined)
      .then((ws) => {
        if (!cancelled) {
          if (ws?.id) {
            setDefaultWorkspaceId(ws.id);
            setDefaultWorkspaceStatus('ready');
          } else {
            setDefaultWorkspaceId(undefined);
            setDefaultWorkspaceStatus('error');
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDefaultWorkspaceId(undefined);
          setDefaultWorkspaceStatus('error');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isKesselEnabled]);

  const resources = useMemo(() => {
    if (
      !isKesselEnabled ||
      defaultWorkspaceStatus !== 'ready' ||
      !defaultWorkspaceId
    ) {
      return [];
    }
    const id = defaultWorkspaceId;
    const base = {
      id,
      type: WORKSPACE_RESOURCE_TYPE,
      reporter: KESSEL_WORKSPACE_REPORTER,
    };
    return [
      { ...base, relation: STALENESS_WORKSPACE_RELATION_VIEW },
      { ...base, relation: STALENESS_WORKSPACE_RELATION_UPDATE },
      { ...base, relation: HOST_WORKSPACE_RELATION_VIEW },
      { ...base, relation: HOST_WORKSPACE_RELATION_UPDATE },
    ];
  }, [isKesselEnabled, defaultWorkspaceStatus, defaultWorkspaceId]);

  const { data: checks, loading: checksLoading } = useSelfAccessCheck({
    resources,
  } as BulkSelfAccessCheckNestedRelationsParams);

  return useMemo((): HostStalenessKesselAccess => {
    if (!isKesselEnabled) {
      return { mode: 'rbac' };
    }

    const isLoading =
      defaultWorkspaceStatus === 'idle' ||
      defaultWorkspaceStatus === 'loading' ||
      (resources.length > 0 && checksLoading);

    if (isLoading) {
      return {
        mode: 'kessel',
        isLoading: true,
        canViewPage: false,
        canEditStaleness: false,
      };
    }

    if (defaultWorkspaceStatus === 'error' || !defaultWorkspaceId) {
      return {
        mode: 'kessel',
        isLoading: false,
        canViewPage: false,
        canEditStaleness: false,
      };
    }

    let stalenessReadAllowed = false;
    let stalenessWriteAllowed = false;
    let hostsReadAllowed = false;
    let hostsWriteAllowed = false;

    for (const check of checks ?? []) {
      if (check.resource?.id !== defaultWorkspaceId) {
        continue;
      }
      switch (check.relation) {
        case STALENESS_WORKSPACE_RELATION_VIEW:
          stalenessReadAllowed = check.allowed === true;
          break;
        case STALENESS_WORKSPACE_RELATION_UPDATE:
          stalenessWriteAllowed = check.allowed === true;
          break;
        case HOST_WORKSPACE_RELATION_VIEW:
          hostsReadAllowed = check.allowed === true;
          break;
        case HOST_WORKSPACE_RELATION_UPDATE:
          hostsWriteAllowed = check.allowed === true;
          break;
        default:
          break;
      }
    }

    const canViewPage = stalenessReadAllowed && hostsReadAllowed;
    const canEditStaleness = stalenessWriteAllowed && hostsWriteAllowed;

    const isReadOnlyGranular = canViewPage && !canEditStaleness;

    const editDisabledTooltip = isReadOnlyGranular
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
    defaultWorkspaceStatus,
    defaultWorkspaceId,
    resources.length,
    checksLoading,
    checks,
  ]);
};
