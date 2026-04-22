import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { type BulkSelfAccessCheckNestedRelationsParams } from '@project-kessel/react-kessel-access-check/types';
import {
  KESSEL_WORKSPACE_REPORTER,
  WORKSPACE_RELATION_EDIT,
  WORKSPACE_RELATION_VIEW,
  WORKSPACE_RESOURCE_TYPE,
} from '../../constants';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';

/** Empty bulk payload when Kessel checks are skipped; SDK completes without network. */
const emptyBulkParams = {
  resources: [],
} as unknown as BulkSelfAccessCheckNestedRelationsParams;

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

  const viewAccessParams: BulkSelfAccessCheckNestedRelationsParams =
    appliesKesselWorkspaceChecks && workspaceId
      ? {
          resources: [
            {
              id: workspaceId,
              type: WORKSPACE_RESOURCE_TYPE,
              reporter: KESSEL_WORKSPACE_REPORTER,
              relation: WORKSPACE_RELATION_VIEW,
            },
          ],
        }
      : emptyBulkParams;

  const editAccessParams: BulkSelfAccessCheckNestedRelationsParams =
    appliesKesselWorkspaceChecks && workspaceId
      ? {
          resources: [
            {
              id: workspaceId,
              type: WORKSPACE_RESOURCE_TYPE,
              reporter: KESSEL_WORKSPACE_REPORTER,
              relation: WORKSPACE_RELATION_EDIT,
            },
          ],
        }
      : emptyBulkParams;

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
