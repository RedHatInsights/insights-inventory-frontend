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
 */
export const useWorkspaceDetailEditActionsAccess = ({
  workspaceKesselGateActive,
  workspaceKesselCanEdit,
  workspaceKesselPermissionsLoading,
  rbacCanModify,
}: Params) => {
  const useKesselEditGate =
    workspaceKesselGateActive === true &&
    typeof workspaceKesselCanEdit === 'boolean';

  const canModifyWorkspaceForActions = useKesselEditGate
    ? !workspaceKesselPermissionsLoading && workspaceKesselCanEdit
    : rbacCanModify;

  const noAccessEditTooltip = useKesselEditGate
    ? workspaceKesselPermissionsLoading
      ? NO_WORKSPACE_PERMISSIONS_LOADING_TOOLTIP_MESSAGE
      : NO_EDIT_WORKSPACE_KESSEL_TOOLTIP_MESSAGE
    : NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE;

  const kesselActionOverride = useKesselEditGate
    ? !workspaceKesselPermissionsLoading && workspaceKesselCanEdit
    : undefined;

  return {
    useKesselEditGate,
    canModifyWorkspaceForActions,
    noAccessEditTooltip,
    kesselActionOverride,
  };
};
