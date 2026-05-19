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
import { type RbacFetchError } from '../kesselRbacFetchErrors';

export type WorkspacesPageKesselAccess = {
  /** Kessel migration flag is on — use RBAC default workspace + Kessel view to interpret empty group lists */
  isKesselGated: boolean;
  /** Wait before choosing empty vs no-access when Kessel is gated */
  isWorkspaceAccessLoading: boolean;
  /** When gated and settled: user may view the default workspace (undefined while loading or when not gated) */
  canViewDefaultWorkspace: boolean | undefined;
  /** Set when `fetchDefaultWorkspace` rejects (caller may choose ErrorState vs empty-state) */
  defaultWorkspaceFetchError: RbacFetchError;
  /** Kessel `checkself` failure after workspace id was resolved */
  kesselCheckError: { code?: number; message?: string } | undefined;
};

type RbacState =
  | { kind: 'disabled' }
  | { kind: 'loading' }
  | { kind: 'ready'; workspaceId: string }
  | { kind: 'error'; error: RbacFetchError };

const emptySelfAccessParams: BulkSelfAccessCheckNestedRelationsParams = {
  resources: [],
};

/**
 * Resolves default workspace id via RBAC and runs a Kessel self check for `view`.
 * Only used from the Workspaces (inventory groups) page — do not import elsewhere until intentionally reused.
 *  @returns Kessel gate state for the workspaces page (loading, permission, errors).
 */
export const useWorkspacesPageKesselAccess = (): WorkspacesPageKesselAccess => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();

  const [rbacState, setRbacState] = useState<RbacState>(() =>
    isKesselEnabled ? { kind: 'loading' } : { kind: 'disabled' },
  );

  useEffect(() => {
    if (!isKesselEnabled) {
      setRbacState({ kind: 'disabled' });
      return;
    }

    let cancelled = false;
    setRbacState({ kind: 'loading' });

    const base = typeof window !== 'undefined' ? window.location.origin : '';

    void (async () => {
      try {
        const workspace = await fetchDefaultWorkspace(base);
        if (!cancelled) {
          setRbacState({ kind: 'ready', workspaceId: workspace.id });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const e = err as { code?: number; message?: string };
          setRbacState({
            kind: 'error',
            error: { code: e?.code, message: e?.message },
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isKesselEnabled]);

  const selfAccessParams: BulkSelfAccessCheckNestedRelationsParams =
    useMemo(() => {
      if (!isKesselEnabled || rbacState.kind !== 'ready') {
        return emptySelfAccessParams;
      }

      return {
        resources: [
          {
            id: rbacState.workspaceId,
            type: WORKSPACE_RESOURCE_TYPE,
            relation: WORKSPACE_RELATION_VIEW,
            reporter: KESSEL_WORKSPACE_REPORTER,
          },
        ],
      };
    }, [isKesselEnabled, rbacState]);

  const {
    data: checks,
    loading: kesselCheckLoading,
    error: kesselCheckError,
  } = useSelfAccessCheck(selfAccessParams);

  const {
    isWorkspaceAccessLoading,
    canViewDefaultWorkspace,
    defaultWorkspaceFetchError,
  } = useMemo(() => {
    if (!isKesselEnabled || rbacState.kind === 'disabled') {
      return {
        isWorkspaceAccessLoading: false,
        canViewDefaultWorkspace: undefined,
        defaultWorkspaceFetchError: null,
      };
    }

    if (rbacState.kind === 'loading') {
      return {
        isWorkspaceAccessLoading: true,
        canViewDefaultWorkspace: undefined,
        defaultWorkspaceFetchError: null,
      };
    }

    if (rbacState.kind === 'error') {
      return {
        isWorkspaceAccessLoading: false,
        canViewDefaultWorkspace: undefined,
        defaultWorkspaceFetchError: rbacState.error,
      };
    }

    if (kesselCheckLoading || kesselCheckError) {
      return {
        isWorkspaceAccessLoading: !!kesselCheckLoading,
        canViewDefaultWorkspace: undefined,
        defaultWorkspaceFetchError: null,
      };
    }

    const viewCheck = checks?.find(
      (c) => c.relation === WORKSPACE_RELATION_VIEW,
    );

    return {
      isWorkspaceAccessLoading: false,
      canViewDefaultWorkspace: viewCheck ? viewCheck.allowed === true : false,
      defaultWorkspaceFetchError: null,
    };
  }, [
    isKesselEnabled,
    rbacState,
    kesselCheckLoading,
    kesselCheckError,
    checks,
  ]);

  return {
    isKesselGated: isKesselEnabled,
    isWorkspaceAccessLoading,
    canViewDefaultWorkspace,
    defaultWorkspaceFetchError,
    kesselCheckError,
  };
};
