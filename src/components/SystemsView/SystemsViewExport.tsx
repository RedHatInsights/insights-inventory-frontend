import React, { useState, MouseEvent } from 'react';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  MenuToggle,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { ExportIcon } from '@patternfly/react-icons';
import useInventoryExport from '../InventoryTable/hooks/useInventoryExport/useInventoryExport';

export const SystemsViewExport = () => {
  const [isOpen, setIsOpen] = useState(false);

  type Format = 'csv' | 'json';
  interface ExportConfig {
    isDisabled: boolean;
    itemTexts: { csv: string; json: string };
    onSelect: (event: MouseEvent<Element> | undefined, format: Format) => void;
  }
  const exportConfig = useInventoryExport() as ExportConfig;

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event?: MouseEvent<Element>, value?: Format) => {
    setIsOpen(false);
    if (value) {
      exportConfig.onSelect(undefined, value);
    }
  };

  return (
    <ToolbarGroup variant="action-group-plain">
      <ToolbarItem>
        <Dropdown
          onSelect={onSelect}
          toggle={(toggleRef) => (
            <MenuToggle
              ref={toggleRef}
              aria-label="Persistent example overflow menu"
              variant="plain"
              onClick={onToggle}
              isExpanded={isOpen}
              icon={<ExportIcon />}
            />
          )}
          isOpen={isOpen}
          onOpenChange={(isOpen) => setIsOpen(isOpen)}
        >
          <DropdownList>
            <DropdownItem value="csv" isDisabled={exportConfig.isDisabled}>
              {exportConfig.itemTexts['csv']}
            </DropdownItem>
            <DropdownItem value="json" isDisabled={exportConfig.isDisabled}>
              {exportConfig.itemTexts['json']}
            </DropdownItem>
          </DropdownList>
        </Dropdown>
      </ToolbarItem>
    </ToolbarGroup>
  );
};
