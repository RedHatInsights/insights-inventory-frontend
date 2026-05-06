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
  Badge,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import xor from 'lodash/xor';
import PropTypes from 'prop-types';
import { useWorkspaceGroupsInfiniteQuery } from '../../../../../../components/filters/useWorkspaceGroupsInfiniteQuery';

const UNGROUPED_HOSTS_LABEL = 'Ungrouped hosts';

const WorkspaceFilter = ({
  value: selectedWorkspaces = [],
  onChange: setSelectedWorkspaces,
}) => {
  const PAGE_SIZE = 50;
  const INITIAL_VISIBLE_SIZE = PAGE_SIZE;
  const DEBOUNCE_TIMEOUT = 300;
  const VIEW_MORE_SIZE = PAGE_SIZE;
  const LOADER_ID = 'loader';
  const hasAccess = true;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [visibleSize, setVisibleSize] = useState(INITIAL_VISIBLE_SIZE);
  const [focusedOption, setFocusedOption] = useState(0);

  const { data, fetchNextPage, hasNextPage, isFetching, isPending } =
    useWorkspaceGroupsInfiniteQuery(debouncedSearch, {
      enabled: hasAccess,
      pageSize: PAGE_SIZE,
    });

  const workspaceOptions = useMemo(() => {
    if (!data?.pages) return [];

    const flattened = data.pages.map((page) => page.results).flat();
    const ungroupedRow = flattened.find((g) => g.ungrouped === true);

    const items = flattened
      .filter((g) => !g.ungrouped)
      .map(({ id, name, host_count: hostCount }) => ({
        itemId: id,
        children: (
          <Flex alignItems={{ default: 'alignItemsCenter' }}>
            <FlexItem>{name}</FlexItem>
            <FlexItem>
              <Badge isRead>
                {typeof hostCount === 'number' ? hostCount : '—'}
              </Badge>
            </FlexItem>
          </Flex>
        ),
      }));

    const ungroupedOption =
      !debouncedSearch &&
      (ungroupedRow?.id
        ? {
            itemId: ungroupedRow.id,
            children: UNGROUPED_HOSTS_LABEL,
          }
        : {
            itemId: '',
            children: UNGROUPED_HOSTS_LABEL,
          });

    return [...(ungroupedOption ? [ungroupedOption] : []), ...items];
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
        isScrollable
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
                    {(option.itemId === '' ||
                      option.children === UNGROUPED_HOSTS_LABEL) && <Divider />}
                  </Fragment>
                );
              })}
              {hasNextPage && (
                <SelectOption
                  isLoading={isFetching}
                  isLoadButton={!isFetching}
                  style={{ overflow: 'visible' }}
                  isDisabled={isFetching}
                  onClick={onViewMoreClick}
                  itemId={LOADER_ID}
                >
                  {isFetching ? <Spinner size="lg" /> : 'Show more'}
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
