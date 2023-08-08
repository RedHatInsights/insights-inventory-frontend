import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Flex,
  FlexItem,
  Select,
  SelectOption,
  Tooltip,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';

const BaseDropdown = ({
  dropdownItems,
  currentItem,
  disabled,
  title,
  newFormValues,
  setNewFormValues,
  edit,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  //manipulate currItem on load so that it matches the name format on dropdown
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
  }, [edit]);
  return (
    <React.Fragment>
      <Flex direction={{ default: 'column' }} gap={{ default: 'gapNone' }}>
        <FlexItem className="pf-u-mb-sm">
          <Flex>
            <FlexItem spacer={{ default: 'spacerXs' }}>
              <p className="pf-u-font-weight-bold pf-u-font-size-sm">{title}</p>
            </FlexItem>
            <FlexItem>
              <Tooltip content={'testing testing 123'}>
                <OutlinedQuestionCircleIcon
                  className="pf-u-ml-xs"
                  color="var(--pf-global--Color--200)"
                />
              </Tooltip>
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
  filter: PropTypes.string,
  newFormValues: PropTypes.any,
  setNewFormValues: PropTypes.any,
  edit: PropTypes.bool,
};

export default BaseDropdown;
