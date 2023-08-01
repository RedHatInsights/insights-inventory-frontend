import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Dropdown,
  DropdownItem,
  DropdownList,
  DropdownToggle,
  Flex,
  FlexItem,
  Tooltip,
} from '@patternfly/react-core';
import {
  CaretDownIcon,
  OutlinedQuestionCircleIcon,
} from '@patternfly/react-icons';

const BaseDropdown = ({ dropdownItems, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onSelect = (_event, value) => {
    console.log('selected', value);
    setIsOpen(false);
  };
  return (
    <React.Fragment>
      <Flex direction={{ default: 'column' }} gap={{ default: 'gapNone' }}>
        <FlexItem className="pf-u-mb-sm">
          <Flex>
            <FlexItem spacer={{ default: 'spacerXs' }}>
              <p className="pf-u-font-weight-bold pf-u-font-size-sm">
                System Staleness
              </p>
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
          <Dropdown
            isOpen={isOpen}
            onSelect={onSelect}
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
            toggle={
              <DropdownToggle
                onToggle={() => setIsOpen(!isOpen)}
                toggleIndicator={CaretDownIcon}
                isDisabled={disabled}
                className="dropdown-toggle"
              >
                {placeholder}
              </DropdownToggle>
            }
            ouiaId="BasicDropdown"
          >
            <DropdownList>
              {dropdownItems.map((item) => (
                <DropdownItem
                  key={item.name}
                  value={item.value}
                  onClick={(ev) => ev.preventDefault()}
                >
                  {item.name}
                </DropdownItem>
              ))}
            </DropdownList>
          </Dropdown>
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
};

export default BaseDropdown;
