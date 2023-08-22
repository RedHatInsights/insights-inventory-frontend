import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Flex,
  FlexItem,
  Popover,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';
import { conditionalDropdownError } from './constants';

const BaseDropdown = ({
  dropdownItems,
  currentItem,
  disabled,
  title,
  newFormValues,
  setNewFormValues,
  edit,
  modalMessage,
  isFormValid,
  setIsFormValid,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(currentItem);
  const onSelect = (event, value) => {
    let select = dropdownItems.find((item) => item.value === value);
    setSelected(select.name);
    setIsOpen(false);
  };

  const updateFilter = (item) => {
    setNewFormValues({ ...newFormValues, [item.apiKey]: item.value });
  };

  useEffect(() => {
    setSelected(currentItem);
  }, [edit, currentItem]);

  return (
    <React.Fragment>
      <Flex direction={{ default: 'column' }} gap={{ default: 'gapNone' }}>
        <FlexItem className="pf-u-mb-sm">
          <Flex>
            <FlexItem spacer={{ default: 'spacerXs' }}>
              <p className="pf-u-font-weight-bold pf-u-font-size-sm">{title}</p>
            </FlexItem>
            <FlexItem>
              <Popover
                aria-label="Basic popover"
                headerContent={<div>{title}</div>}
                bodyContent={<div>{modalMessage}</div>}
              >
                <OutlinedQuestionCircleIcon className="pf-u-ml-xs" />
              </Popover>
            </FlexItem>
          </Flex>
        </FlexItem>
        <FlexItem>
          <Select
            id="single-select"
            isOpen={isOpen}
            onSelect={onSelect}
            onToggle={() => setIsOpen(!isOpen)}
            isDisabled={disabled}
            selections={selected}
            width={'150px'}
          >
            {dropdownItems.map((item) => (
              <SelectOption
                key={item.name}
                value={item.value}
                onClick={() => updateFilter(item)}
              >
                {item.name}
              </SelectOption>
            ))}
          </Select>
          {conditionalDropdownError(
            dropdownItems[0].apiKey,
            newFormValues,
            dropdownItems,
            isFormValid,
            setIsFormValid
          )}
        </FlexItem>
      </Flex>
    </React.Fragment>
  );
};

BaseDropdown.propTypes = {
  dropdownItems: PropTypes.array,
  disabled: PropTypes.bool,
  onSelect: PropTypes.bool,
  placeholder: PropTypes.string,
  title: PropTypes.string,
  currentItem: PropTypes.string,
  filter: PropTypes.object,
  newFormValues: PropTypes.any,
  setNewFormValues: PropTypes.any,
  edit: PropTypes.bool,
  modalMessage: PropTypes.string,
  isFormValid: PropTypes.any,
  setIsFormValid: PropTypes.any,
};

export default BaseDropdown;
