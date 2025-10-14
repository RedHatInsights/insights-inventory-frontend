import React, { useState } from 'react';
import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  Split,
  SplitItem,
} from '@patternfly/react-core';
import { LAST_SEEN_OPTIONS as selectOptions } from '../helpers';
import PropTypes from 'prop-types';

const LastSeenFilter = ({ value, onChange }) => {
  const selectedLabel = value?.label;
  const [isOpen, setIsOpen] = useState(false);
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (_event, value) => {
    if (value === selectedLabel) {
      setIsOpen(false);
      return;
    }

    const selectedOption = selectOptions.find(
      (option) => option.label === value,
    );
    onChange({ ...selectedOption.value, label: selectedOption.label });
    setIsOpen(false);
  };

  const toggle = (toggleRef) => (
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

LastSeenFilter.propTypes = {
  value: PropTypes.shape({
    start: PropTypes.string,
    end: PropTypes.string,
    label: PropTypes.string,
  }),
  onChange: PropTypes.func.isRequired,
};

export default LastSeenFilter;
