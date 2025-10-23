// @ts-check
import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  Fragment,
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
import { useInfiniteQuery } from '@tanstack/react-query';
import { getGroups } from '../../../../../../components/InventoryGroups/utils/api';

const WorkspaceFilter = ({
  value: selectedGroupNames = [],
  onChange: setSelectedGroupNames,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimeoutRef = useRef(null);
  const DEBOUNCE_TIMEOUT = 300;
  const INITIAL_OPTIONS_COUNT = 10;
  const VIEW_MORE_INCREMENT = 10;
  const PAGE_SIZE = 50;
  // TODO plug in access control solution
  const hasAccess = true;

  const { data, fetchNextPage, hasNextPage, isFetching, isPending } =
    useInfiniteQuery({
      queryKey: ['groups', debouncedSearch],
      queryFn: async ({ pageParam }) =>
        getGroups(
          {
            type: 'standard',
            ...(debouncedSearch && { name: debouncedSearch }),
          },
          {
            page: pageParam,
            per_page: PAGE_SIZE,
          },
        ),
      enabled: hasAccess,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.per_page * lastPage.page < lastPage.total
          ? lastPage.page + 1
          : null;
      },
    });

  const groupOptions = useMemo(() => {
    if (!data?.pages) return [];

    const items = data.pages
      .map((page) => page.results)
      .flat()
      .map(({ name }) => ({
        itemId: name,
        children: name,
      }));

    return [
      ...(!debouncedSearch
        ? [{ itemId: '', children: 'Ungrouped hosts' }]
        : []),
      ...items,
    ];
  }, [data, debouncedSearch]);

  const [visibleCount, setVisibleCount] = useState(INITIAL_OPTIONS_COUNT);
  const visibleOptions = groupOptions.slice(0, visibleCount);
  const [activeItem, setActiveItem] = useState(0);

  const activeItemRef = useRef(null);

  const onViewMoreClick = async () => {
    const nextVisibleCount = visibleCount + VIEW_MORE_INCREMENT;

    if (nextVisibleCount > groupOptions.length) {
      await fetchNextPage();
    }

    setVisibleCount(nextVisibleCount);
    setActiveItem(visibleCount);
  };

  const debounceSearch = useCallback((value) => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      if (value) {
        setIsOpen(true);
      }
    }, DEBOUNCE_TIMEOUT);
  }, []);

  useEffect(() => {
    debounceSearch(searchValue);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [searchValue, debounceSearch]);

  useEffect(() => {
    activeItemRef.current?.focus();
  }, [visibleCount]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
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
          setVisibleSize(INITIAL_VISIBLE_SIZE);
        }}
        toggle={toggle}
      >
        <SelectList isAriaMultiselectable>
          {isPending && (
            <SelectOption isLoading={true}>
              <Spinner size="lg" />
            </SelectOption>
          )}
          {visibleOptions.length === 0 && !isPending ? (
            <SelectOption isDisabled={true}>
              No workspaces available
            </SelectOption>
          ) : (
            <>
              {visibleOptions.map((option, index) => {
                return (
                  <Fragment key={option.itemId}>
                    <SelectOption
                      isSelected={selectedGroupNames.includes(option.itemId)}
                      key={option.itemId}
                      data-ouia-component-id="FilterByGroupOption"
                      ref={index === activeItem ? activeItemRef : null}
                      hasCheckbox={true}
                      {...option}
                    />
                    {option.itemId === '' && <Divider />}
                  </Fragment>
                );
              })}
              {hasNextPage && (
                <SelectOption
                  isLoading={isFetching}
                  isLoadButton={!isFetching}
                  isDisabled={isFetching}
                  onClick={onViewMoreClick}
                  itemId="loader"
                >
                  {isFetching ? <Spinner size="lg" /> : 'View more'}
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
