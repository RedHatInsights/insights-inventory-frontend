import React, { useEffect, useMemo, useState } from 'react';
import {
  Divider,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
  Select /* data-codemods */,
  SelectList /* data-codemods */,
  SelectOption /* data-codemods */,
  Spinner,
} from '@patternfly/react-core';

import xor from 'lodash/xor';
import PropTypes from 'prop-types';

const VISIBLE_LIMIT = 10;

const SearchableGroupFilter = ({
  inputValue,
  setInputValue,
  isFetchingNextPage,
  hasNextPage,
  groups,
  fetchNextPage,
  selectedGroupNames,
  setSelectedGroupNames,
  showNoGroupOption,
  isKesselEnabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedItemIndex, setFocusedItemIndex] = useState(null);
  const [visibleCount, setVisibleCount] = useState(VISIBLE_LIMIT);
  const [selectOptions, setSelectOptions] = useState([]);

  const prefixOptions = useMemo(
    () =>
      showNoGroupOption || isKesselEnabled
        ? [
            {
              itemId: '',
              children: isKesselEnabled ? 'Ungrouped hosts' : 'No workspace',
            },
          ]
        : [],
    [showNoGroupOption, isKesselEnabled],
  );

  const groupOptions = useMemo(
    () => groups.map(({ name }) => ({ itemId: name, children: name })),
    [groups],
  );

  const allValues = useMemo(
    () => [...prefixOptions, ...groupOptions],
    [prefixOptions, groupOptions],
  );

  useEffect(() => {
    let newSelectOptions = [
      ...prefixOptions,
      ...groupOptions.slice(0, visibleCount),
    ];

    // filter menu items based on the text input value when one exists
    if (inputValue) {
      newSelectOptions = allValues.filter((menuItem) =>
        String(menuItem.children)
          .toLowerCase()
          .includes(inputValue.toLowerCase()),
      );

      // when no options are found after filtering, display 'No workspace found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            isDisabled: true,
            children: 'No workspace found',
          },
        ];
      }
    }

    setFocusedItemIndex(0);
    setSelectOptions(newSelectOptions);
  }, [
    inputValue,
    prefixOptions,
    groupOptions,
    visibleCount,
    hasNextPage,
    isFetchingNextPage,
    setSelectOptions,
  ]);

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
      (menuItem) => !menuItem.isDisabled,
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
        if (!isOpen) setIsOpen(true);
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    setInputValue('');
  };

  const onTextInputChange = (_event, value) => {
    setInputValue(value);
  };

  const onSelect = async (itemId) => {
    if (itemId === '__load_more__') {
      return;
    }

    setSelectedGroupNames(xor(selectedGroupNames, [itemId]));
  };

  const onViewMoreClick = () => {
    setVisibleCount((c) => c + VISIBLE_LIMIT);
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
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
          placeholder="Filter by workspace"
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
            <SelectOption key="none">No workspaces available</SelectOption>
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
                  hasCheckbox
                  {...option}
                />
                {option.itemId === '' && <Divider />}
              </div>
            ))
          )}
          {(isFetchingNextPage ||
            (!inputValue &&
              (groupOptions.length > visibleCount || hasNextPage))) && (
            <SelectOption
              itemId="__load_more__"
              onClick={onViewMoreClick}
              isLoadButton={!isFetchingNextPage}
              isLoading={isFetchingNextPage}
            >
              {isFetchingNextPage ? <Spinner size="lg" /> : 'View more'}
            </SelectOption>
          )}
        </SelectList>
      </Select>
    </div>
  );
};

SearchableGroupFilter.propTypes = {
  inputValue: PropTypes.string.isRequired,
  setInputValue: PropTypes.func.isRequired,
  isFetchingNextPage: PropTypes.bool.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  fetchNextPage: PropTypes.func.isRequired,
  groups: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedGroupNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedGroupNames: PropTypes.func.isRequired,
  showNoGroupOption: PropTypes.bool,
  isKesselEnabled: PropTypes.bool,
};

export default SearchableGroupFilter;
