import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Flex,
  FlexItem,
  Popover,
  Select,
  SelectOption,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';
import { conditionalDropdownError, formValidation } from './constants';

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
    formValidation(newFormValues, setIsFormValid);
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
                aria-label={`${title} popover`}
                headerContent={<div>{title}</div>}
                bodyContent={<div>{modalMessage}</div>}
              >
                <Button
                  className="pf-u-ml-xs"
                  variant="plain"
                  style={{ padding: 0 }}
                >
                  <OutlinedQuestionCircleIcon />
                </Button>
              </Popover>
            </FlexItem>
          </Flex>
        </FlexItem>
        <FlexItem>
          <Select
            isOpen={isOpen}
            onSelect={onSelect}
            onToggle={() => setIsOpen(!isOpen)}
            isDisabled={disabled}
            selections={selected}
            width={'150px'}
            validated={!isFormValid && 'error'}
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
          {conditionalDropdownError(newFormValues, dropdownItems)}
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
  currentItem: PropTypes.any,
  filter: PropTypes.object,
  newFormValues: PropTypes.any,
  setNewFormValues: PropTypes.any,
  edit: PropTypes.bool,
  modalMessage: PropTypes.string,
  isFormValid: PropTypes.any,
  setIsFormValid: PropTypes.any,
};

export default BaseDropdown;
