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
import {
  conditionalDropdownError,
  formValidation,
  HostStalenessApiKey,
} from './constants';
import { Staleness } from './HostStalenessCard';

interface DropdownItem {
  name: string;
  value: number;
}

interface BaseDropdownProps {
  items: DropdownItem[];
  apiKey: HostStalenessApiKey;
  isDisabled?: boolean;
  title: string;
  currentItem?: number;
  staleness: Staleness;
  setStaleness: React.Dispatch<React.SetStateAction<Staleness>>;
  modalMessage?: string;
  isStalenessValid: boolean;
  setIsStalenessValid: React.Dispatch<React.SetStateAction<boolean>>;
  ouiaId?: string;
}

const BaseDropdown = ({
  items,
  apiKey,
  currentItem,
  isDisabled,
  title,
  staleness,
  setStaleness,
  modalMessage,
  isStalenessValid,
  setIsStalenessValid,
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
    setStaleness({ ...staleness, [apiKey]: item.value });
  };

  useEffect(() => {
    setSelected(currentItem);
    formValidation(staleness, setIsStalenessValid);
  }, [currentItem, staleness, setIsStalenessValid]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => {
    const getNameByValue = (value?: number) => {
      if (value === undefined) return '';
      const item = items.find((obj) => obj.value === value);
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
        status={isStalenessValid ? undefined : 'danger'}
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
                  aria-label={`${title} help`}
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
              {items.map((item) => (
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
          {conditionalDropdownError(staleness, apiKey)}
        </FlexItem>
      </Flex>
    </React.Fragment>
  );
};

export default BaseDropdown;
