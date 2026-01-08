import React, { FC, Ref, useState } from 'react';
import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  Split,
  SplitItem,
  MenuToggleElement,
} from '@patternfly/react-core';
import { LAST_SEEN_OPTIONS as selectOptions } from '../../routes/Systems/components/SystemsTable/components/helpers';

export interface LastSeenFilterItem {
  label: string;
  start?: string;
  end?: string;
}

export interface LastSeenFilterProps {
  value?: LastSeenFilterItem;
  onChange?: (event: unknown, value: LastSeenFilterItem | undefined) => void;
}
const LastSeenFilter: FC<LastSeenFilterProps> = ({ value, onChange }) => {
  const selectedLabel = value?.label;
  const [isOpen, setIsOpen] = useState(false);
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: unknown, value: string) => {
    if (value === selectedLabel) {
      setIsOpen(false);
      return;
    }

    const selectedOption = selectOptions.find(
      (option) => option.label === value,
    );

    if (selectedOption) {
      onChange?.(undefined, {
        ...selectedOption.value,
        label: selectedOption.label,
      });
    }
    setIsOpen(false);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen}>
      {selectedLabel ?? 'Filter by last seen'}
    </MenuToggle>
  );

  return (
    <Split>
      <SplitItem>
        <Select
          id="single-select"
          isOpen={isOpen}
          selected={selectedLabel}
          onSelect={onSelect}
          onOpenChange={(isOpen) => setIsOpen(isOpen)}
          toggle={toggle}
          shouldFocusToggleOnSelect
        >
          <SelectList>
            {selectOptions.map((option) => (
              <SelectOption key={option.label} value={option.label}>
                {option.label}
              </SelectOption>
            ))}
          </SelectList>
        </Select>
      </SplitItem>
    </Split>
  );
};

export default LastSeenFilter;
