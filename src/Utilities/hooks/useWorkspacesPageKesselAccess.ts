import { useEffect, useMemo, useState } from 'react';
import {
  fetchDefaultWorkspace,
  useSelfAccessCheck,
} from '@project-kessel/react-kessel-access-check';
import { type BulkSelfAccessCheckNestedRelationsParams } from '@project-kessel/react-kessel-access-check/types';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';
import {
  WORKSPACE_RESOURCE_TYPE,
  WORKSPACE_RELATION_VIEW,
  KESSEL_WORKSPACE_REPORTER,
} from '../../constants';

export type WorkspacesPageKesselAccess = {
  /** Kessel migration flag is on — use RBAC default workspace + Kessel view to interpret empty group lists */
  isKesselGated: boolean;
  /** Wait before choosing empty vs no-access when Kessel is gated */
  isWorkspaceAccessLoading: boolean;
  /** When gated and settled: user may view the default workspace (undefined while loading or when not gated) */
  canViewDefaultWorkspace: boolean | undefined;
  /** Set when `fetchDefaultWorkspace` rejects (caller may choose ErrorState vs empty-state) */
  defaultWorkspaceFetchError: { code?: number; message?: string } | null;
  /** Kessel `checkself` failure after workspace id was resolved */
  kesselCheckError: { code?: number; message?: string } | undefined;
};

/**
 * Resolves default workspace id via RBAC and runs a Kessel self check for `view`.
 * Only used from the Workspaces (inventory groups) page — do not import elsewhere until intentionally reused.
 *  @returns Kessel gate state for the workspaces page (loading, permission, errors).
 */
export const useWorkspacesPageKesselAccess = (): WorkspacesPageKesselAccess => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();

  const [rbacPhase, setRbacPhase] = useState<
    'disabled' | 'loading' | 'ready' | 'error'
  >(() => (isKesselEnabled ? 'loading' : 'disabled'));
  const [defaultWorkspaceId, setDefaultWorkspaceId] = useState<string | null>(
    null,
  );
  const [defaultWorkspaceFetchError, setDefaultWorkspaceFetchError] = useState<{
    code?: number;
    message?: string;
  } | null>(null);

  useEffect(() => {
    if (!isKesselEnabled) {
      setRbacPhase('disabled');
      setDefaultWorkspaceId(null);
      setDefaultWorkspaceFetchError(null);
      return;
    }

    let cancelled = false;
    setRbacPhase('loading');
    setDefaultWorkspaceFetchError(null);
    setDefaultWorkspaceId(null);

    const base = typeof window !== 'undefined' ? window.location.origin : '';

    // prefix it with void: void (async () => { ... })(); so ESLint treats it as an intentional fire-and-forget async effect.
    void (async () => {
      try {
        const workspace = await fetchDefaultWorkspace(base);
        if (!cancelled) {
          setDefaultWorkspaceId(workspace.id);
          setDefaultWorkspaceFetchError(null);
          setRbacPhase('ready');
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const e = err as { code?: number; message?: string };
          setDefaultWorkspaceId(null);
          setDefaultWorkspaceFetchError({
            code: e?.code,
            message: e?.message,
          });
          setRbacPhase('error');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isKesselEnabled]);

  const resources = useMemo(() => {
    if (!isKesselEnabled || !defaultWorkspaceId) {
      return [];
    }
    return [
      {
        id: defaultWorkspaceId,
        type: WORKSPACE_RESOURCE_TYPE,
        relation: WORKSPACE_RELATION_VIEW,
        reporter: KESSEL_WORKSPACE_REPORTER,
      },
    ];
  }, [isKesselEnabled, defaultWorkspaceId]);

  const {
    data: checks,
    loading: kesselCheckLoading,
    error: kesselCheckError,
  } = useSelfAccessCheck({
    resources,
  } as BulkSelfAccessCheckNestedRelationsParams);

  const canViewDefaultWorkspace = useMemo((): boolean | undefined => {
    if (!isKesselEnabled) {
      return undefined;
    }
    if (rbacPhase === 'error') {
      return false;
    }
    if (rbacPhase !== 'ready' || !defaultWorkspaceId) {
      return undefined;
    }
    if (kesselCheckLoading) {
      return undefined;
    }
    if (kesselCheckError) {
      return undefined;
    }
    const viewCheck = checks?.find(
      (c) => c.relation === WORKSPACE_RELATION_VIEW,
    );
    if (!viewCheck) {
      return false;
    }
    return viewCheck.allowed === true;
  }, [
    isKesselEnabled,
    rbacPhase,
    defaultWorkspaceId,
    kesselCheckLoading,
    kesselCheckError,
    checks,
  ]);

  const isKesselGated = isKesselEnabled;

  const isWorkspaceAccessLoading =
    isKesselGated &&
    (rbacPhase === 'loading' ||
      (rbacPhase === 'ready' && !!defaultWorkspaceId && kesselCheckLoading));

  return {
    isKesselGated,
    isWorkspaceAccessLoading,
    canViewDefaultWorkspace,
    defaultWorkspaceFetchError:
      rbacPhase === 'error' ? defaultWorkspaceFetchError : null,
    kesselCheckError,
  };
};
