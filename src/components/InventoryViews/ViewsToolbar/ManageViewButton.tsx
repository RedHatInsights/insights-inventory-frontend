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
  /** Callback when Save As is clicked */
  onSaveAs: () => void;
  /** Callback when Rename is clicked */
  onRename: () => void;
  /** Callback when Delete is clicked */
  onDelete: () => void;
}

export const ManageViewButton = ({
  currentViewId,
  isSystemView = true,
  isViewDirty = false,
  onSaveAs,
  onRename,
  onDelete,
}: ManageViewButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const onSelect = () => {
    setIsOpen(false);
  };

  console.log(isViewDirty, 'isViewDirty test');

  // Determine the primary action based on view type and dirty state
  const primaryAction = isViewDirty
    ? isSystemView
      ? { label: 'Save as', onClick: onSaveAs } // System view → Save as new view
      : { label: 'Save', onClick: onSaveAs } // Custom view → Save changes (TODO: implement onSave)
    : null;

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
      </DropdownList>
    </Dropdown>
  );
};

export default ManageViewButton;
