import React, { Ref, useState } from 'react';
import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  Split,
  SplitItem,
  MenuToggleElement,
} from '@patternfly/react-core';
import {
  LAST_SEEN_OPTIONS as selectOptions,
  type LastSeenKey,
} from '../constants';

export interface LastSeenFilterProps {
  value?: LastSeenKey | '';
  onChange?: (event?: React.MouseEvent, values?: LastSeenKey | '') => void;
}

const LastSeenFilter = ({ value = '', onChange }: LastSeenFilterProps) => {
  const selectedKey = value || undefined;
  const selectedOption = selectedKey
    ? selectOptions.find((option) => option.key === selectedKey)
    : undefined;
  const selectedLabel = selectedOption?.label;

  const [isOpen, setIsOpen] = useState(false);
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event: unknown, label: string) => {
    if (label === selectedLabel) {
      setIsOpen(false);
      return;
    }

    const option = selectOptions.find((o) => o.label === label);

    if (option) {
      onChange?.(undefined, option.key);
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
