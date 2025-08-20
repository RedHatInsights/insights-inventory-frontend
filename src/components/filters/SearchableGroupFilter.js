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
  searchQuery,
  setSearchQuery,
  isLoading,
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

  // Reset visible count when search query changes
  useEffect(() => {
    setVisibleCount(VISIBLE_LIMIT);
    setFocusedItemIndex(null);
  }, [searchQuery]);

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

  const groupOptions = useMemo(() => {
    const g = groups.slice(0, visibleCount);
    return g.map(({ name }) => ({ itemId: name, children: name }));
  }, [groups, visibleCount]);

  useEffect(() => {
    let newSelectOptions = [
      ...(searchQuery ? [] : prefixOptions),
      ...groupOptions,
    ];

    setFocusedItemIndex(null);
    setSelectOptions(newSelectOptions);
  }, [
    searchQuery,
    prefixOptions,
    groupOptions,
    setSelectOptions,
    setFocusedItemIndex,
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
          setSearchQuery('');
        } else {
          onSelect(focusedItem.itemId);
        }
        break;
      case 'Tab':
      case 'Escape':
        setIsOpen(false);
        setSearchQuery('');
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
    setSearchQuery('');
  };

  const onTextInputChange = (_event, value) => {
    setSearchQuery(value);
  };

  const onSelect = (itemId) => {
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
          value={searchQuery}
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

  const shouldShowViewMore = groupOptions.length > visibleCount || hasNextPage;

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
          setSearchQuery('');
        }}
        toggle={toggle}
      >
        <SelectList isAriaMultiselectable>
          {selectOptions.length === 0 && !isLoading ? (
            <SelectOption key="none">{`${searchQuery ? 'No workspaces found' : 'No workspaces available'}`}</SelectOption>
          ) : (
            selectOptions.map((option, index) => (
              <div key={option.itemId || option.children}>
                <SelectOption
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
          {
            // Show spinner when loading more, "View more" when there is more to load
            (isFetchingNextPage || isLoading || shouldShowViewMore) && (
              <SelectOption
                itemId="__load_more__"
                onClick={onViewMoreClick}
                isLoadButton={!isFetchingNextPage && !isLoading}
                isLoading={isFetchingNextPage || isLoading}
              >
                {isFetchingNextPage || isLoading ? (
                  <Spinner size="lg" />
                ) : (
                  'View more'
                )}
              </SelectOption>
            )
          }
        </SelectList>
      </Select>
    </div>
  );
};

SearchableGroupFilter.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isFetchingNextPage: PropTypes.bool.isRequired,
  hasNextPage: PropTypes.bool.isRequired,
  fetchNextPage: PropTypes.func.isRequired,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  ).isRequired,
  selectedGroupNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  setSelectedGroupNames: PropTypes.func.isRequired,
  showNoGroupOption: PropTypes.bool,
  isKesselEnabled: PropTypes.bool,
};

export default SearchableGroupFilter;
