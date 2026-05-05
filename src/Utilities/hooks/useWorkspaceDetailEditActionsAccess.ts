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
 *  @param root0
 *  @param root0.workspaceKesselGateActive
 *  @param root0.workspaceKesselCanEdit
 *  @param root0.workspaceKesselPermissionsLoading
 *  @param root0.rbacCanModify
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
