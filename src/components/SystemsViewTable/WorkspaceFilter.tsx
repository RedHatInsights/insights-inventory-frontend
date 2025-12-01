import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  Fragment,
  Ref,
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
  MenuToggleElement,
} from '@patternfly/react-core';
import xor from 'lodash/xor';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getGroupList } from '../../api/hostInventoryApiTyped';

interface WorkspaceFilterProps {
  placeholder?: string;
  value: string[];
  // eslint-disable-next-line no-unused-vars
  onChange?: (event: unknown, value: string[]) => void;
}

export const WorkspaceFilter = ({
  placeholder,
  value = [],
  onChange,
}: WorkspaceFilterProps) => {
  const PAGE_SIZE = 50;
  const INITIAL_VISIBLE_SIZE = PAGE_SIZE;
  const DEBOUNCE_TIMEOUT = 300;
  const VIEW_MORE_SIZE = PAGE_SIZE;
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
        getGroupList({
          page: pageParam,
          perPage: PAGE_SIZE,
          ...(debouncedSearch && { name: debouncedSearch }),
        }),
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
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const focusedOptionRef = useRef<HTMLOptionElement>();

  const onViewMoreClick = async () => {
    const nextVisibleSize = visibleSize + VIEW_MORE_SIZE;

    if (nextVisibleSize > workspaceOptions.length) {
      await fetchNextPage();
    }

    setVisibleSize(nextVisibleSize);
    setFocusedOption(visibleSize);
  };

  const debounceSearch = useCallback((value: string) => {
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

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
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
          placeholder={placeholder ?? ''}
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
        selected={value}
        onSelect={(event, selected) => {
          if (selected === LOADER_ID) return;
          onChange?.(event, xor(value, [selected]));
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
                      isSelected={
                        option?.itemId !== undefined &&
                        value.includes(option.itemId)
                      }
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
                  // overflow:visible prevents this option's height from collapsing to 0px
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

export default WorkspaceFilter;
