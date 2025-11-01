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
  value: selectedWorkspaces = [],
  onChange: setSelectedWorkspaces,
}) => {
  const INITIAL_VISIBLE_SIZE = 10;
  const DEBOUNCE_TIMEOUT = 300;
  const VIEW_MORE_SIZE = 10;
  const PAGE_SIZE = 50;
  const LOADER_ID = 'loader';
  // TODO plug in access control solution
  const hasAccess = true;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [visibleSize, setVisibleSize] = useState(INITIAL_VISIBLE_SIZE);
  const [focusedOption, setFocusedOption] = useState(0);

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

  const workspaceOptions = useMemo(() => {
    if (!data?.pages) return [];

    const items = data.pages
      .map((page) => page.results)
      .flat()
      .map(({ name }) => ({
        itemId: name,
        children: name,
      }));

    return [
      ...(debouncedSearch ? [] : [{ itemId: '', children: 'Ungrouped hosts' }]),
      ...items,
    ];
  }, [data, debouncedSearch]);

  const visibleOptions = workspaceOptions.slice(0, visibleSize);
  const debounceTimeoutRef = useRef(null);
  const focusedOptionRef = useRef(null);

  const onViewMoreClick = async () => {
    const nextVisibleSize = visibleSize + VIEW_MORE_SIZE;

    if (nextVisibleSize > workspaceOptions.length) {
      await fetchNextPage();
    }

    setVisibleSize(nextVisibleSize);
    setFocusedOption(visibleSize);
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
    debounceSearch(search);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [search, debounceSearch]);

  useEffect(() => {
    focusedOptionRef.current?.focus();
  }, [visibleSize]);

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
          value={search}
          onClick={onToggleClick}
          onChange={(_event, value) => {
            setSearch(value);
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
        selected={selectedWorkspaces}
        onSelect={(_event, value) => {
          if (value === LOADER_ID) return;
          setSelectedWorkspaces(xor(selectedWorkspaces, [value]));
        }}
        onOpenChange={() => {
          setIsOpen(false);
          setSearch('');
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
            <Fragment>
              {visibleOptions.map((option, index) => {
                return (
                  <Fragment key={option.itemId}>
                    <SelectOption
                      isSelected={selectedWorkspaces.includes(option.itemId)}
                      data-ouia-component-id="FilterByGroupOption"
                      ref={index === focusedOption ? focusedOptionRef : null}
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
                  itemId={LOADER_ID}
                >
                  {isFetching ? <Spinner size="lg" /> : 'View more'}
                </SelectOption>
              )}
            </Fragment>
          )}
        </SelectList>
      </Select>
    </div>
  );
};

WorkspaceFilter.propTypes = {
  value: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
};

export default WorkspaceFilter;
