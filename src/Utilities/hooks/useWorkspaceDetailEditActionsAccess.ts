import {
  NO_EDIT_WORKSPACE_KESSEL_TOOLTIP_MESSAGE,
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
  NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE,
} from '../../constants';

type Params = {
  workspaceKesselGateActive: boolean;
  workspaceKesselCanEdit: boolean | undefined;
  workspaceKesselPermissionsLoading: boolean;
  rbacCanModify: boolean;
};

/**
 * Merges RBAC workspace write with Kessel `edit` for workspace-details actions
 * (Add systems, Remove from workspace) when {@link Params.workspaceKesselGateActive} is true.
 *
 *  @param params                                   - See {@link Params}
 *  @param params.workspaceKesselGateActive         - Whether Kessel gate is active
 *  @param params.workspaceKesselCanEdit            - Kessel edit permission
 *  @param params.workspaceKesselPermissionsLoading - Loading state
 *  @param params.rbacCanModify                     - RBAC modify permission
 *  @returns                                        Edit access state and tooltip
 */
export const useWorkspaceDetailEditActionsAccess = ({
  workspaceKesselGateActive,
  workspaceKesselCanEdit,
  workspaceKesselPermissionsLoading,
  rbacCanModify,
}: Params) => {
  const isKesselEditGating =
    workspaceKesselGateActive === true &&
    typeof workspaceKesselCanEdit === 'boolean';

  const canModifyWorkspaceForActions = isKesselEditGating
    ? !workspaceKesselPermissionsLoading && workspaceKesselCanEdit
    : rbacCanModify;

  const noAccessEditTooltip = isKesselEditGating
    ? workspaceKesselPermissionsLoading
      ? NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE
      : NO_EDIT_WORKSPACE_KESSEL_TOOLTIP_MESSAGE
    : NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE;

  const kesselActionOverride = isKesselEditGating
    ? !workspaceKesselPermissionsLoading && workspaceKesselCanEdit
    : undefined;

  return {
    isKesselEditGating,
    canModifyWorkspaceForActions,
    noAccessEditTooltip,
    kesselActionOverride,
  };
};
