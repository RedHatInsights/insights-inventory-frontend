import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  Fragment,
} from 'react';
import {
  Divider,
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
  Select,
  SelectList,
  SelectOption,
} from '@patternfly/react-core';

import xor from 'lodash/xor';
import PropTypes from 'prop-types';

const WorkspaceFilter = ({
  value: selectedGroupNames = [],
  onChange: setSelectedGroupNames,
  showNoGroupOption = true,
  items,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [focusedItemIndex, setFocusedItemIndex] = useState(null);
  const debounceTimeoutRef = useRef(null);
  const SEARCH_DELAY = 300;

  const noGroupOption = useMemo(() => {
    return showNoGroupOption && !searchValue
      ? [
          {
            itemId: '',
            children: 'Ungrouped hosts',
          },
        ]
      : [];
  }, [searchValue, showNoGroupOption]);

  const groupOptions = useMemo(
    () => [
      ...items.map(({ name }) => ({
        itemId: name, // group name is unique by design
        children: name,
      })),
    ],
    [items],
  );

  const [selectOptions, setSelectOptions] = useState([
    ...noGroupOption,
    ...groupOptions,
  ]);

  const debouncedSearch = useCallback((search, options) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      let newSelectOptions = options;

      if (search) {
        newSelectOptions = options.filter((menuItem) =>
          String(menuItem.children)
            .toLowerCase()
            .includes(search.toLowerCase()),
        );

        if (!newSelectOptions.length) {
          newSelectOptions = [
            {
              isDisabled: true,
              children: 'No workspace found',
            },
          ];
        }
      }

      setSelectOptions(newSelectOptions);
    }, SEARCH_DELAY);
  }, []);

  useEffect(() => {
    debouncedSearch(searchValue, [...noGroupOption, ...groupOptions]);
  }, [searchValue, groupOptions, noGroupOption, debouncedSearch]);

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
    const focusedItem =
      focusedItemIndex !== null
        ? enabledMenuItems[focusedItemIndex]
        : firstMenuItem;

    switch (event.key) {
      // select the first available option
      case 'Enter':
        if (!isOpen) {
          setIsOpen((prevIsOpen) => !prevIsOpen);
          setSearchValue('');
        } else {
          updateGroupNames(focusedItem.itemId);
        }
        break;
      case 'Tab':
      case 'Escape':
        setIsOpen(false);
        setSearchValue('');
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
    setSearchValue('');
  };

  const updateGroupNames = (itemId) => {
    setSelectedGroupNames(xor(selectedGroupNames, [itemId]));
  };

  const toggle = (toggleRef) => (
    <MenuToggle
      variant="typeahead"
      onClick={onToggleClick}
      innerRef={toggleRef}
      isExpanded={isOpen}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={searchValue}
          onClick={onToggleClick}
          onChange={(_event, value) => {
            setSearchValue(value);
          }}
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
        onSelect={(_event, selection) => updateGroupNames(selection)}
        onOpenChange={() => {
          setIsOpen(false);
          setFocusedItemIndex(null);
          setSearchValue('');
        }}
        toggle={toggle}
      >
        <SelectList isAriaMultiselectable>
          {selectOptions.filter((item) => item.itemId).length > 0 ? (
            selectOptions.map((option, index) => (
              <Fragment key={option.itemId || option.children}>
                <SelectOption
                  {...(!option.isDisabled && { hasCheckbox: true })}
                  isSelected={selectedGroupNames.includes(option.itemId)}
                  isFocused={focusedItemIndex === index}
                  className={option.className}
                  data-ouia-component-id="FilterByGroupOption"
                  {...option}
                />
                {option.itemId === '' && <Divider />}
              </Fragment>
            ))
          ) : (
            <SelectOption isDisabled={true}>
              No workspaces available
            </SelectOption>
          )}
        </SelectList>
      </Select>
    </div>
  );
};

WorkspaceFilter.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.string,
    }).isRequired,
  ),
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  showNoGroupOption: PropTypes.bool,
};

export default WorkspaceFilter;
