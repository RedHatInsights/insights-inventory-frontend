import { useMemo } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import {
  type BulkSelfAccessCheckNestedRelationsParams,
  type SelfAccessCheckResource,
  type SelfAccessCheckResourceWithRelation,
} from '@project-kessel/react-kessel-access-check/types';
import {
  KESSEL_WORKSPACE_REPORTER,
  WORKSPACE_RELATION_EDIT,
  WORKSPACE_RELATION_VIEW,
  WORKSPACE_RESOURCE_TYPE,
} from '../../constants';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';

/**
 * Nested bulk params only — keeps `useSelfAccessCheck` on one overload so TypeScript is satisfied.
 * When `run` is false, `resources` is empty and the SDK completes immediately (no network).
 * When `run` is true, a single `{ ...resource, relation }` entry avoids bulk index/order bugs vs two relations in one request.
 *
 *  @param run      - Whether to include the workspace resource in `resources`
 *  @param resource - Workspace resource without relation, or null when idle
 *  @param relation - Kessel relation for the single bulk item
 *  @returns        Params for `useSelfAccessCheck` nested bulk overload
 */
function workspaceNestedBulkParams(
  run: boolean,
  resource: SelfAccessCheckResource | null,
  relation: string,
): BulkSelfAccessCheckNestedRelationsParams {
  if (!run || !resource) {
    return {
      resources: [],
    } as unknown as BulkSelfAccessCheckNestedRelationsParams;
  }
  const withRelation: SelfAccessCheckResourceWithRelation = {
    ...resource,
    relation,
  };
  return { resources: [withRelation] };
}

export type WorkspaceDetailKesselPermissions = {
  /** When false, callers should use RBAC only (Kessel off or ungrouped hosts workspace). */
  appliesKesselWorkspaceChecks: boolean;
  canView: boolean | undefined;
  canEdit: boolean | undefined;
  isLoading: boolean;
};

/**
 * Kessel self-access checks for a single workspace on the workspace details page: `view` and `edit`.
 *
 * Uses **two** `useSelfAccessCheck` calls, each with nested bulk params containing **one** resource
 * (one relation per request), so `checkselfbulk` cannot mis-associate pairs when the API returns
 * items out of order (see `transformBulkResponse` in the SDK).
 *
 * When the Kessel migration flag is off, or `skipKessel` is true (e.g. ungrouped hosts),
 * returns inactive flags so callers fall back to RBAC.
 *
 *  @param workspaceId      - RBAC workspace id from the route
 *  @param root0            - Options object
 *  @param root0.skipKessel - When true, no API checks are made (ungrouped workspace)
 *  @returns                View/edit flags, loading, and whether Kessel should gate the page
 */
export const useWorkspaceDetailKesselPermissions = (
  workspaceId: string | undefined,
  { skipKessel = false }: { skipKessel?: boolean } = {},
): WorkspaceDetailKesselPermissions => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();
  const appliesKesselWorkspaceChecks =
    isKesselEnabled === true && skipKessel !== true;

  const workspaceResource = useMemo(
    () =>
      workspaceId
        ? {
            id: workspaceId,
            type: WORKSPACE_RESOURCE_TYPE,
            reporter: KESSEL_WORKSPACE_REPORTER,
          }
        : null,
    [workspaceId],
  );

  const runSingleChecks =
    appliesKesselWorkspaceChecks && workspaceResource != null;

  const viewAccessParams = useMemo(
    () =>
      workspaceNestedBulkParams(
        runSingleChecks,
        workspaceResource,
        WORKSPACE_RELATION_VIEW,
      ),
    [runSingleChecks, workspaceResource],
  );

  const editAccessParams = useMemo(
    () =>
      workspaceNestedBulkParams(
        runSingleChecks,
        workspaceResource,
        WORKSPACE_RELATION_EDIT,
      ),
    [runSingleChecks, workspaceResource],
  );

  const viewCheck = useSelfAccessCheck(viewAccessParams);
  const editCheck = useSelfAccessCheck(editAccessParams);

  if (!appliesKesselWorkspaceChecks) {
    return {
      appliesKesselWorkspaceChecks: false,
      canView: undefined,
      canEdit: undefined,
      isLoading: false,
    };
  }

  if (!workspaceId) {
    return {
      appliesKesselWorkspaceChecks: true,
      canView: false,
      canEdit: false,
      isLoading: false,
    };
  }

  const viewAllowed = viewCheck.data?.[0]?.allowed === true;
  const editAllowed = editCheck.data?.[0]?.allowed === true;

  return {
    appliesKesselWorkspaceChecks: true,
    canView: viewAllowed,
    canEdit: editAllowed,
    isLoading: viewCheck.loading || editCheck.loading,
  };
};
