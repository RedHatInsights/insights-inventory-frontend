import React, { useState } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  MenuToggleElement,
} from '@patternfly/react-core';

export interface ManageViewButtonProps {
  /** Current view ID (null for system views) */
  currentViewId?: string | null;
  /** Whether current view is a system view (non-editable) */
  isSystemView?: boolean;
  /** Callback when Save As is clicked */
  onSaveAs?: () => void;
}

export const ManageViewButton = ({
  currentViewId,
  isSystemView = true,
  onSaveAs,
}: ManageViewButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const onToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const onSelect = () => {
    setIsOpen(false);
  };

  return (
    <Dropdown
      isOpen={isOpen}
      onSelect={onSelect}
      onOpenChange={(isOpen: boolean) => setIsOpen(isOpen)}
      toggle={(toggleRef: React.Ref<MenuToggleElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={onToggle}
          isExpanded={isOpen}
          aria-label="Manage view actions"
        >
          Manage view
        </MenuToggle>
      )}
    >
      <DropdownList>
        <DropdownItem key="save-as" onClick={onSaveAs}>
          Save as
        </DropdownItem>
      </DropdownList>
    </Dropdown>
  );
};

export default ManageViewButton;
