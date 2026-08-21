import React, { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleAction,
  MenuToggleElement,
} from '@patternfly/react-core';

export interface ManageViewButtonProps {
  /** Current view ID (null for system views) */
  currentViewId?: string | null;
  /** Whether current view is a system view (non-editable) */
  isSystemView?: boolean;
  /** Whether the view is dirty */
  isViewDirty?: boolean;
  isOwner?: boolean;
  /** Callback when Save As is clicked */
  onSaveAs: () => void;
  /** Callback when Rename is clicked */
  onRename: () => void;
  /** Callback when Delete is clicked */
  onDelete: () => void;
  /** Callback when Save is clicked */
  onSave?: () => void;
}

export interface PrimaryAction {
  label: string;
  onClick?: () => void;
}

export const getPrimaryAction = (
  isViewDirty: boolean,
  isSystemView: boolean,
  isOwner: boolean,
  onSave?: () => void,
): PrimaryAction | null => {
  if (!isViewDirty) return null;
  if (isSystemView) return null; // System views (incl. All systems) have no view to overwrite
  if (!isOwner) return null; // Only owners can save
  return { label: 'Save', onClick: onSave };
};

export const ManageViewButton = ({
  currentViewId,
  isSystemView = true,
  isViewDirty = false,
  isOwner = false,
  onSaveAs,
  onRename,
  onDelete,
  onSave,
}: ManageViewButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const onSelect = () => {
    setIsOpen(false);
  };

  const primaryAction = getPrimaryAction(
    isViewDirty,
    isSystemView,
    isOwner,
    onSave,
  );

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) =>
        primaryAction ? (
          <MenuToggle
            variant="primary"
            ref={toggleRef}
            onClick={onToggle}
            isExpanded={isOpen}
            aria-label="Manage view actions"
            data-testid="manage-view-toggle"
            splitButtonItems={[
              <MenuToggleAction
                key="primary-action"
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </MenuToggleAction>,
            ]}
          />
        ) : (
          <MenuToggle
            variant="secondary"
            ref={toggleRef}
            onClick={onToggle}
            isExpanded={isOpen}
            aria-label="Manage view actions"
            data-testid="manage-view-toggle"
            splitButtonItems={[
              <MenuToggleAction key="manage-view" onClick={onToggle}>
                Manage view
              </MenuToggleAction>,
            ]}
          />
        )
      }
    >
      <DropdownList>
        <DropdownItem key="save-as" onClick={onSaveAs}>
          Save as
        </DropdownItem>
        <DropdownItem key="rename" onClick={onRename} isDisabled={isSystemView}>
          Rename
        </DropdownItem>
        <DropdownItem key="delete" onClick={onDelete} isDisabled={isSystemView}>
          Delete
        </DropdownItem>
        <DropdownItem
          key="save"
          onClick={onSave}
          isDisabled={!isViewDirty || isSystemView || !isOwner}
        >
          Save
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default ManageViewButton;
