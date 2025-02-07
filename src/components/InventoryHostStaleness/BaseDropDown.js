import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Flex,
  FlexItem,
  MenuToggle,
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
  ouiaId,
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

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef) => {
    const getNameByValue = (value) => {
      const item = dropdownItems.find((obj) => obj.value === value);
      return item ? item.name : 'undefined';
    };
    return (
      <MenuToggle
        ref={toggleRef}
        onClick={onToggleClick}
        isExpanded={isOpen}
        isDisabled={disabled}
        style={{
          width: '200px',
        }}
        status={!isFormValid && 'danger'}
        ouiaId={ouiaId}
      >
        {getNameByValue(selected)}
      </MenuToggle>
    );
  };

  return (
    <React.Fragment>
      <Flex direction={{ default: 'column' }} gap={{ default: 'gapNone' }}>
        <FlexItem className="pf-v5-u-mb-sm">
          <Flex>
            <FlexItem spacer={{ default: 'spacerXs' }}>
              <p className="pf-v5-u-font-weight-bold pf-v5-u-font-size-sm">
                {title}
              </p>
            </FlexItem>
            <FlexItem>
              <Popover
                aria-label={`${title} popover`}
                headerContent={<div>{title}</div>}
                bodyContent={<div>{modalMessage}</div>}
              >
                <Button
                  className="pf-v5-u-ml-xs"
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
            toggle={toggle}
            selections={selected}
            isScrollable
            ouiaId={ouiaId}
          >
            {dropdownItems.map((item) => (
              <SelectOption
                isDisabled={disabled}
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
  currentItem: PropTypes.number,
  newFormValues: PropTypes.any,
  setNewFormValues: PropTypes.any,
  edit: PropTypes.bool,
  modalMessage: PropTypes.string,
  isFormValid: PropTypes.any,
  setIsFormValid: PropTypes.any,
  ouiaId: PropTypes.string,
};

export default BaseDropdown;
