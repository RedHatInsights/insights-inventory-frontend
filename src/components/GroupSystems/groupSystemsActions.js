import React from 'react';
import { MOVE_SYSTEMS_MENU_TEXT } from '../../constants';
import { ActionDropdownItem } from '../InventoryTable/ActionWithRBAC';
import {
  getGroupSystemsBulkActionDisabled,
  isKesselMoveSystemRowDisabled,
} from '../InventoryTable/helpers';
import { MoveSystemActionDropdownItem } from '../InventoryTable/MoveSystemActionDropdownItem';

export const openModalForSystems = (
  systems,
  setCurrentSystem,
  setModalOpen,
) => {
  setCurrentSystem(systems);
  setModalOpen(true);
};

export const getRowActionItem = ({
  row,
  isKesselEnabled,
  ungrouped,
  canModifyWorkspaceForActions,
  noAccessEditTooltip,
  kesselActionOverride,
  removeLabel,
  requiredPermissions,
  setCurrentSystem,
  setMoveSystemsToWorkspaceModalOpen,
  setRemoveHostsFromGroupModalOpen,
}) => {
  const commonProps = {
    requiredPermissions,
    noAccessTooltip: noAccessEditTooltip,
    override: kesselActionOverride,
    ...(!canModifyWorkspaceForActions && {
      tooltipProps: { content: noAccessEditTooltip },
    }),
  };

  if (isKesselEnabled) {
    return (
      <MoveSystemActionDropdownItem
        key={`${row.id}-move-system`}
        isAriaDisabled={isKesselMoveSystemRowDisabled(
          row,
          canModifyWorkspaceForActions,
        )}
        {...commonProps}
        onClick={() =>
          openModalForSystems(
            [row],
            setCurrentSystem,
            setMoveSystemsToWorkspaceModalOpen,
          )
        }
      />
    );
  }

  return (
    <ActionDropdownItem
      key={`${row.id}-remove-from-workspace`}
      isAriaDisabled={ungrouped || !canModifyWorkspaceForActions}
      {...commonProps}
      onClick={() =>
        openModalForSystems(
          [row],
          setCurrentSystem,
          setRemoveHostsFromGroupModalOpen,
        )
      }
    >
      {removeLabel}
    </ActionDropdownItem>
  );
};

export const getBulkActionConfig = ({
  isKesselEnabled,
  ungrouped,
  canModifyWorkspaceForActions,
  selectedCount,
  selectedSystemsList,
  removeLabel,
  setCurrentSystem,
  setMoveSystemsToWorkspaceModalOpen,
  setRemoveHostsFromGroupModalOpen,
}) => {
  const isDisabled = getGroupSystemsBulkActionDisabled({
    isKesselEnabled,
    workspaceActionsAllowed: canModifyWorkspaceForActions,
    ungrouped,
    selectedCount,
    selectedHosts: selectedSystemsList,
  });

  if (isKesselEnabled) {
    return {
      label: MOVE_SYSTEMS_MENU_TEXT,
      isDisabled,
      onClick: () =>
        openModalForSystems(
          selectedSystemsList,
          setCurrentSystem,
          setMoveSystemsToWorkspaceModalOpen,
        ),
    };
  }

  return {
    label: removeLabel,
    isDisabled,
    onClick: () =>
      openModalForSystems(
        selectedSystemsList,
        setCurrentSystem,
        setRemoveHostsFromGroupModalOpen,
      ),
  };
};
