import React, { useState, Ref } from 'react';
import {
  Button,
  Flex,
  FlexItem,
  MenuToggle,
  Popover,
  Select,
  SelectOption,
  SelectList,
  MenuToggleElement,
} from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { useEffect } from 'react';
import { conditionalDropdownError, formValidation } from './constants';

interface DropdownItem {
  name: string;
  value: number;
  apiKey: string;
  title: string;
  modalMessage?: string;
}

interface BaseDropdownProps {
  dropdownItems: DropdownItem[];
  isDisabled?: boolean;
  title: string;
  currentItem: number;
  newFormValues: Record<string, number>;
  setNewFormValues: (values: Record<string, number>) => void;
  edit?: boolean;
  modalMessage?: string;
  isFormValid: boolean;
  setIsFormValid: (isValid: boolean) => void;
  ouiaId?: string;
}

const BaseDropdown = ({
  dropdownItems,
  currentItem,
  isDisabled,
  title,
  newFormValues,
  setNewFormValues,
  edit,
  modalMessage,
  isFormValid,
  setIsFormValid,
  ouiaId,
}: BaseDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(currentItem);

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: number,
  ) => {
    setSelected(value);
    setIsOpen(false);
  };

  const updateFilter = (item: DropdownItem) => {
    setNewFormValues({ ...newFormValues, [item.apiKey]: item.value });
  };

  useEffect(() => {
    setSelected(currentItem);
    formValidation(newFormValues, setIsFormValid);
  }, [edit, currentItem, newFormValues, setIsFormValid]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => {
    const getNameByValue = (value: number) => {
      const item = dropdownItems.find((obj) => obj.value === value);
      return item?.name;
    };

    return (
      <MenuToggle
        ref={toggleRef}
        onClick={onToggleClick}
        isExpanded={isOpen}
        isDisabled={isDisabled}
        style={{
          width: '200px',
        }}
        status={isFormValid ? undefined : 'danger'}
        ouiaId={ouiaId}
      >
        {getNameByValue(selected)}
      </MenuToggle>
    );
  };

  return (
    <React.Fragment>
      <Flex direction={{ default: 'column' }} gap={{ default: 'gapNone' }}>
        <FlexItem className="pf-v6-u-mb-sm">
          <Flex>
            <FlexItem spacer={{ default: 'spacerXs' }}>
              <p className="pf-v6-u-font-weight-bold pf-v6-u-font-size-sm">
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
                  icon={<OutlinedQuestionCircleIcon />}
                  className="pf-v6-u-ml-xs"
                  variant="plain"
                  style={{ padding: 0 }}
                />
              </Popover>
            </FlexItem>
          </Flex>
        </FlexItem>
        <FlexItem>
          <Select
            isOpen={isOpen}
            onSelect={onSelect}
            toggle={toggle}
            selected={selected}
            onOpenChange={(isOpen) => setIsOpen(isOpen)}
            isScrollable
            ouiaId={ouiaId}
          >
            <SelectList>
              {dropdownItems.map((item) => (
                <SelectOption
                  isDisabled={isDisabled}
                  key={item.name}
                  value={item.value}
                  onClick={() => updateFilter(item)}
                >
                  {item.name}
                </SelectOption>
              ))}
            </SelectList>
          </Select>
          {conditionalDropdownError(newFormValues, dropdownItems)}
        </FlexItem>
      </Flex>
    </React.Fragment>
  );
};

export default BaseDropdown;
