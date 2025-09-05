import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import DateRangeSelector from '../DateRangeSelector';
import { CUSTOM_LABEL, LAST_SEEN_OPTIONS as selectOptions } from '../helpers';
import PropTypes from 'prop-types';

const LastSeenFilter = ({ value, onChange }) => {
  const filterValue = value;
  const selectedLabel = filterValue?.label;
  const [dateRange, setDateRange] = useState({
    start: filterValue?.start,
    end: filterValue?.end,
  });
  const [isOpen, setIsOpen] = useState(false);
  const isCustomSelected = selectedLabel === CUSTOM_LABEL;
  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (dateRange?.start || dateRange?.end) {
      onChange({ ...dateRange, label: CUSTOM_LABEL });
    }
  }, [onChange, dateRange]);

  const onSelect = (_event, value) => {
    debugger;
    if (value === selectedLabel) {
      setIsOpen(false);
      return;
    }

    if (value === CUSTOM_LABEL) {
      setDateRange({});
      onChange({ label: CUSTOM_LABEL });
    } else {
      const optionSelected = selectOptions.find(
        (option) => option.label === value,
      );
      onChange({ ...optionSelected.value, label: optionSelected.label });
    }
    setIsOpen(false);
  };

  const toggle = (toggleRef) => (
    <MenuToggle
      ref={toggleRef}
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={{
        width: '200px',
      }}
    >
      {selectedLabel ?? 'Select a value'}
    </MenuToggle>
  );

  return (
    <Flex gap={{ default: 'gapSm' }}>
      <FlexItem>
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
      </FlexItem>
      {isCustomSelected && (
        <FlexItem>
          <DateRangeSelector
            dateRange={dateRange}
            setDateRange={setDateRange}
          />
        </FlexItem>
      )}
    </Flex>
  );
};

LastSeenFilter.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        start: PropTypes.string,
        end: PropTypes.string,
        label: PropTypes.string,
      }),
      PropTypes.bool,
    ]),
  ),
  onChange: PropTypes.func.isRequired,
};

export default LastSeenFilter;
