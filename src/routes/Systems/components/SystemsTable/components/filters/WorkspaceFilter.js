// @ts-check
import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from 'react';
import {
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Divider,
} from '@patternfly/react-core';
import xor from 'lodash/xor';
import PropTypes from 'prop-types';

const WorkspaceFilter = ({
  value: selectedGroupNames = [],
  onChange: setSelectedGroupNames,
  items,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const debounceTimeoutRef = useRef(null);
  const SEARCH_DELAY = 300;
  const INITIAL_OPTIONS_COUNT = 10;
  const VIEW_MORE_INCREMENT = 10;

  const groupOptions = useMemo(
    () => [
      ...items.map(({ name }) => ({
        itemId: name, // is unique by design
        children: name,
      })),
    ],
    [items],
  );

  const [selectOptions, setSelectOptions] = useState([...groupOptions]);
  const [numOptions, setNumOptions] = useState(INITIAL_OPTIONS_COUNT);
  const visibleOptions = selectOptions.slice(0, numOptions);
  const [activeItem, setActiveItem] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // FIXME set loading on fetch
  const onViewMoreClick = () => {
    setIsLoading(true);
    setTimeout(() => loadMoreOptions(), 2000);
  };

  const getNextValidItem = (startIndex, maxLength) => {
    let validItem;
    for (let i = startIndex; i < maxLength; i++) {
      if (selectOptions[i].isDisabled) {
        continue;
      } else {
        validItem = i;
        break;
      }
    }
    return validItem;
  };

  const loadMoreOptions = () => {
    const newLength =
      numOptions + VIEW_MORE_INCREMENT <= selectOptions.length
        ? numOptions + VIEW_MORE_INCREMENT
        : selectOptions.length;

    const prevPosition = numOptions;
    const nextItem = getNextValidItem(prevPosition, newLength);
    setIsLoading(false);
    setNumOptions(newLength);
    setActiveItem(nextItem);
  };

  const activeItemRef = useRef(null);

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
      } else {
        newSelectOptions = [
          { itemId: '', children: 'Ungrouped hosts' },
          ...options,
        ];
      }

      setSelectOptions(newSelectOptions);
    }, SEARCH_DELAY);
  }, []);

  useEffect(() => {
    debouncedSearch(searchValue, [...groupOptions]);
  }, [searchValue, groupOptions, debouncedSearch]);

  useEffect(() => {
    activeItemRef.current?.focus();
  }, [numOptions]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    setSearchValue('');
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
        onSelect={(_event, value) => {
          if (value === 'loader') return;
          setSelectedGroupNames(xor(selectedGroupNames, [value]));
        }}
        onOpenChange={() => {
          setIsOpen(false);
          setSearchValue('');
        }}
        toggle={toggle}
      >
        <SelectList isAriaMultiselectable>
          {visibleOptions.length === 0 && !isLoading ? (
            <SelectOption isDisabled={true}>
              No workspaces available
            </SelectOption>
          ) : (
            <>
              {visibleOptions.map((option, index) => {
                return (
                  <>
                    <SelectOption
                      isSelected={selectedGroupNames.includes(option.itemId)}
                      key={option.itemId}
                      data-ouia-component-id="FilterByGroupOption"
                      ref={index === activeItem ? activeItemRef : null}
                      hasCheckbox={!option.isDisabled}
                      {...option}
                    />
                    {option.itemId === '' && <Divider />}
                  </>
                );
              })}
              {numOptions !== selectOptions.length && (
                <SelectOption
                  isLoading={isLoading}
                  isLoadButton={!isLoading}
                  onClick={onViewMoreClick}
                  itemId="loader"
                >
                  {isLoading ? <Spinner size="lg" /> : 'View more'}
                </SelectOption>
              )}
            </>
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
};

export default WorkspaceFilter;
