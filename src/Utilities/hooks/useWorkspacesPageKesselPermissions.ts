import { useEffect, useMemo, useState } from 'react';
import {
  fetchRootWorkspace,
  useSelfAccessCheck,
} from '@project-kessel/react-kessel-access-check';
import { type BulkSelfAccessCheckNestedRelationsParams } from '@project-kessel/react-kessel-access-check/types';
import {
  KESSEL_WORKSPACE_REPORTER,
  WORKSPACE_RELATION_DELETE,
  WORKSPACE_RELATION_EDIT,
  WORKSPACE_RESOURCE_TYPE,
} from '../../constants';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';

export type WorkspaceRowKesselPermissions = {
  canEdit: boolean;
  canDelete: boolean;
};

type GroupLike = { id?: string; ungrouped?: boolean };

/**
 * Bulk Kessel self-access checks for each workspace row on the Workspaces page:
 * `edit` (rename) and `delete`, per the Kessel SDK workspace examples.
 * Ungrouped rows are excluded (they are not standard workspaces).
 *
 *  @param groups - Table rows from inventory groups API (uses `id` and `ungrouped`).
 *  @returns      Row permission map, loading flag, and Kessel feature flag state.
 */
export const useWorkspaceTableRowKesselPermissions = (
  groups: GroupLike[] | undefined,
) => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();

  const workspaceIds = useMemo(() => {
    if (!isKesselEnabled || !groups?.length) {
      return [];
    }
    const ids: string[] = [];
    for (const g of groups) {
      if (g?.id && !g.ungrouped) {
        ids.push(g.id);
      }
    }
    return ids;
  }, [isKesselEnabled, groups]);

  const resources = useMemo(() => {
    if (!isKesselEnabled) {
      return [];
    }
    return workspaceIds.flatMap((id) => [
      {
        id,
        type: WORKSPACE_RESOURCE_TYPE,
        relation: WORKSPACE_RELATION_EDIT,
        reporter: KESSEL_WORKSPACE_REPORTER,
      },
      {
        id,
        type: WORKSPACE_RESOURCE_TYPE,
        relation: WORKSPACE_RELATION_DELETE,
        reporter: KESSEL_WORKSPACE_REPORTER,
      },
    ]);
  }, [isKesselEnabled, workspaceIds]);

  const {
    data: checks,
    loading: permissionsLoading,
    error: permissionsError,
  } = useSelfAccessCheck({
    resources,
  } as BulkSelfAccessCheckNestedRelationsParams);

  const workspacePermissionById = useMemo(() => {
    const record: Record<string, WorkspaceRowKesselPermissions> = {};
    for (const id of workspaceIds) {
      record[id] = { canEdit: false, canDelete: false };
    }
    if (!checks?.length) {
      return record;
    }
    for (const check of checks) {
      const id = check.resource?.id;
      if (!id || !(id in record)) {
        continue;
      }
      const current = record[id];
      if (check.relation === WORKSPACE_RELATION_EDIT) {
        record[id] = { ...current, canEdit: check.allowed === true };
      } else if (check.relation === WORKSPACE_RELATION_DELETE) {
        record[id] = { ...current, canDelete: check.allowed === true };
      }
    }
    return record;
  }, [checks, workspaceIds]);

  return {
    isKesselEnabled,
    workspacePermissionById,
    permissionsLoading: isKesselEnabled && permissionsLoading,
    permissionsError,
  };
};

type RootFetchStatus = 'idle' | 'loading' | 'ready' | 'error';

/**
 * Whether the user may create a new workspace under Kessel.
 * Uses self-access `edit` on the organization root workspace (RBAC workspace API),
 * matching the product expectation that creation is gated like other workspace mutations.
 *
 *  @returns `canCreateWorkspace` (undefined when Kessel is off) and loading state for the toolbar.
 */
export const useKesselCanCreateWorkspace = () => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();
  const [rootWorkspaceId, setRootWorkspaceId] = useState<string | undefined>();
  const [rootFetchStatus, setRootFetchStatus] =
    useState<RootFetchStatus>('idle');

  useEffect(() => {
    if (!isKesselEnabled) {
      setRootFetchStatus('idle');
      setRootWorkspaceId(undefined);
      return;
    }
    if (typeof window === 'undefined') {
      return;
    }
    let cancelled = false;
    setRootFetchStatus('loading');
    fetchRootWorkspace(window.location.origin, undefined, undefined)
      .then((ws) => {
        if (!cancelled && ws?.id) {
          setRootWorkspaceId(ws.id);
          setRootFetchStatus('ready');
        } else if (!cancelled) {
          setRootFetchStatus('error');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setRootFetchStatus('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [isKesselEnabled]);

  const resources = useMemo(() => {
    if (!isKesselEnabled || rootFetchStatus !== 'ready' || !rootWorkspaceId) {
      return [];
    }
    return [
      {
        id: rootWorkspaceId,
        type: WORKSPACE_RESOURCE_TYPE,
        relation: WORKSPACE_RELATION_EDIT,
        reporter: KESSEL_WORKSPACE_REPORTER,
      },
    ];
  }, [isKesselEnabled, rootFetchStatus, rootWorkspaceId]);

  const { data: checks, loading: checkLoading } = useSelfAccessCheck({
    resources,
  } as BulkSelfAccessCheckNestedRelationsParams);

  const canCreateWorkspace = useMemo(() => {
    if (!isKesselEnabled) {
      return undefined;
    }
    if (rootFetchStatus === 'error') {
      return false;
    }
    if (rootFetchStatus !== 'ready' || !rootWorkspaceId) {
      return false;
    }
    if (checkLoading) {
      return false;
    }
    return checks?.some(
      (c) =>
        c.relation === WORKSPACE_RELATION_EDIT &&
        c.resource?.id === rootWorkspaceId &&
        c.allowed === true,
    );
  }, [isKesselEnabled, rootFetchStatus, rootWorkspaceId, checkLoading, checks]);

  const createPermissionLoading =
    isKesselEnabled &&
    (rootFetchStatus === 'idle' ||
      rootFetchStatus === 'loading' ||
      (rootFetchStatus === 'ready' && checkLoading));

  return { canCreateWorkspace, createPermissionLoading };
};
