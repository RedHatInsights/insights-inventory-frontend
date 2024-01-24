import React, { useEffect, useMemo, useState } from 'react';
import {
  Divider,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
  Select /* data-codemods */,
  SelectList /* data-codemods */,
  SelectOption /* data-codemods */,
} from '@patternfly/react-core';

import xor from 'lodash/xor';
import PropTypes from 'prop-types';

const SearchableGroupFilter = ({
  initialGroups,
  selectedGroupNames,
  setSelectedGroupNames,
  showNoGroupOption = false,
}) => {
  const initialValues = useMemo(
    () => [
      ...(showNoGroupOption
        ? [
            {
              itemId: '',
              children: 'No group',
            },
          ]
        : []),
      ...initialGroups.map(({ name }) => ({
        itemId: name, // group name is unique by design
        children: name,
      })),
    ],
    [initialGroups]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectOptions, setSelectOptions] = useState(initialValues);
  const [focusedItemIndex, setFocusedItemIndex] = useState(null);

  useEffect(() => {
    let newSelectOptions = initialValues;

    // filter menu items based on the text input value when one exists
    if (inputValue) {
      newSelectOptions = initialValues.filter((menuItem) =>
        String(menuItem.children)
          .toLowerCase()
          .includes(inputValue.toLowerCase())
      );

      // when no options are found after filtering, display 'No groups found'
      if (!newSelectOptions.length) {
        newSelectOptions = [{ isDisabled: true, children: 'No groups found' }];
      }
    }

    setSelectOptions(newSelectOptions);
    setFocusedItemIndex(0);
  }, [inputValue]);

  const handleMenuArrowKeys = (key) => {
    let indexToFocus;

    if (isOpen) {
      if (key === 'ArrowUp') {
        // when no index is set or at the first index, focus to the last, otherwise decrement focus index
        if (focusedItemIndex === null || focusedItemIndex === 0) {
          indexToFocus = selectOptions.length - 1;
        } else {
          indexToFocus = focusedItemIndex - 1;
        }
      }

      if (key === 'ArrowDown') {
        // when no index is set or at the last index, focus to the first, otherwise increment focus index
        if (
          focusedItemIndex === null ||
          focusedItemIndex === selectOptions.length - 1
        ) {
          indexToFocus = 0;
        } else {
          indexToFocus = focusedItemIndex + 1;
        }
      }

      setFocusedItemIndex(indexToFocus);
    }
  };

  const onInputKeyDown = (event) => {
    const enabledMenuItems = selectOptions.filter(
      (menuItem) => !menuItem.isDisabled
    );
    const [firstMenuItem] = enabledMenuItems;
    const focusedItem = focusedItemIndex
      ? enabledMenuItems[focusedItemIndex]
      : firstMenuItem;

    switch (event.key) {
      // select the first available option
      case 'Enter':
        if (!isOpen) {
          setIsOpen((prevIsOpen) => !prevIsOpen);
          setInputValue('');
        } else {
          onSelect(focusedItem.itemId);
        }
        break;
      case 'Tab':
      case 'Escape':
        setIsOpen(false);
        setInputValue('');
        break;
      case 'ArrowUp':
      case 'ArrowDown':
        handleMenuArrowKeys(event.key);
        break;
      default:
        !isOpen && setIsOpen(true);
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    setInputValue('');
  };

  const onTextInputChange = (_event, value) => {
    setInputValue(value);
  };

  const onSelect = (itemId) => {
    setSelectedGroupNames(xor(selectedGroupNames, [itemId]));
  };

  const toggle = (toggleRef) => (
    <MenuToggle
      variant="typeahead"
      onClick={onToggleClick}
      innerRef={toggleRef}
      isExpanded={isOpen}
      style={{ minWidth: '261px' }} // align width with the tags filter width
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onToggleClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id="multi-typeahead-select-input"
          autoComplete="off"
          placeholder="Filter by group"
        />
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <div data-ouia-component-id="FilterByGroup">
      <Select
        id="groups-filter-select"
        ouiaId="Filter by group"
        isOpen={isOpen}
        selected={selectedGroupNames}
        onSelect={(event, selection) => onSelect(selection)}
        onOpenChange={() => {
          setIsOpen(false);
          setInputValue('');
        }}
        toggle={toggle}
      >
        <SelectList isAriaMultiselectable>
          {selectOptions.length === 0 ? (
            <SelectOption key="none">No groups available</SelectOption>
          ) : (
            selectOptions.map((option, index) => (
              <div key={option.itemId || option.children}>
                <SelectOption
                  {...(!option.isDisabled && { hasCheck: true })}
                  isSelected={selectedGroupNames.includes(option.itemId)}
                  key={option.itemId || option.children}
                  isFocused={focusedItemIndex === index}
                  className={option.className}
                  data-ouia-component-id="FilterByGroupOption"
                  {...option}
                />
                {option.itemId === '' && <Divider />}
              </div>
            ))
          )}
        </SelectList>
      </Select>
    </div>
  );
};

SearchableGroupFilter.propTypes = {
  initialGroups: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string,
    }).isRequired
  ),
  selectedGroupNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedGroupNames: PropTypes.func.isRequired,
  showNoGroupOption: PropTypes.bool,
};

export default SearchableGroupFilter;
