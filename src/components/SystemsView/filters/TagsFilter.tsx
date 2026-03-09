import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
  Ref,
} from 'react';
import {
  MenuToggle,
  TextInputGroup,
  TextInputGroupMain,
  Select,
  SelectOption,
  Spinner,
  MenuToggleElement,
  SelectGroup,
  SelectList,
  Tooltip,
  Badge,
  Flex,
  FlexItem,
  Truncate,
} from '@patternfly/react-core';
import xor from 'lodash/xor';
import { useInfiniteQuery } from '@tanstack/react-query';
import { getTagList } from '../../../api/hostInventoryApiTyped';

// TODO refactor these to constants
const STALENESS = ['fresh', 'stale', 'stale_warning'] as const;
const PAGE_SIZE = 50;
const INITIAL_VISIBLE_SIZE = PAGE_SIZE;
const DEBOUNCE_TIMEOUT = 300;
const VIEW_MORE_SIZE = PAGE_SIZE;
const LOADER_ID = 'loader';
const FILTER_DROPDOWN_WIDTH = '300px';

interface TagsFilterProps {
  placeholder?: string;
  value?: string[];
  onChange?: (event: unknown, value: string[]) => void;
}

export const TagsFilter = ({
  placeholder,
  value = [],
  onChange,
}: TagsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [visibleSize, setVisibleSize] = useState(INITIAL_VISIBLE_SIZE);
  const [focusedOption, setFocusedOption] = useState(0);

  const { data, fetchNextPage, hasNextPage, isFetching, isPending } =
    useInfiniteQuery({
      queryKey: ['tags', debouncedSearch],
      queryFn: async ({ pageParam }) =>
        getTagList({
          page: pageParam,
          perPage: PAGE_SIZE,
          orderBy: 'tag',
          orderHow: 'ASC',
          staleness: [...STALENESS],
          ...(debouncedSearch && { search: debouncedSearch }),
        }),
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      initialPageParam: 1,
      getNextPageParam: (lastPage) => {
        return lastPage.per_page * lastPage.page < lastPage.total
          ? lastPage.page + 1
          : null;
      },
    });

  const tagsByNamespace = useMemo(() => {
    if (!data?.pages) {
      return {};
    } else {
      const result: Record<string, { name: string; count: number }[]> = {};
      data.pages
        .map((page) => page.results)
        .flat()
        .slice(0, INITIAL_VISIBLE_SIZE)
        .forEach(({ tag, count }) => {
          const { namespace, key, value } = tag;
          const tagDetails = { name: `${key}=${value}`, count: count ?? 0 };
          if (namespace) {
            if (result[namespace]) {
              result[namespace].push(tagDetails);
            } else {
              result[namespace] = [tagDetails];
            }
          }
        });
      return result;
    }
  }, [data]);

  const tagOptions = Object.entries(tagsByNamespace);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const focusedOptionRef = useRef<HTMLOptionElement>();

  // TODO change this to footer action
  const onViewMoreClick = async () => {
    const nextVisibleSize = visibleSize + VIEW_MORE_SIZE;

    if (nextVisibleSize > tagOptions.length) {
      await fetchNextPage();
    }

    setVisibleSize(nextVisibleSize);
    setFocusedOption(visibleSize);
  };

  // TODO refactor this to use useDebouncedValue hook
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
          id="multi-typeahead-select-tags-input"
          autoComplete="off"
          placeholder={placeholder ?? ''}
        />
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <div data-ouia-component-id="FilterByTags">
      <Select
        id="tags-filter-select"
        ouiaId="Filter by tags"
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
        popperProps={{
          width: FILTER_DROPDOWN_WIDTH,
        }}
      >
        <SelectList isAriaMultiselectable>
          {isPending && (
            <SelectOption isLoading={true}>
              <Spinner size="lg" />
            </SelectOption>
          )}
          {tagOptions.length === 0 && !isPending ? (
            <SelectOption isDisabled={true}>No tags available</SelectOption>
          ) : (
            <>
              {tagOptions.map(([namespace, tags], index) => {
                return (
                  <SelectGroup key={namespace} label={namespace}>
                    {tags.map((tag) => {
                      return (
                        <SelectOption
                          value={`${namespace}/${tag.name}`}
                          key={tag.name}
                          // TODO implement with help value.includes()
                          isSelected={false}
                          data-ouia-component-id="FilterByTagsOption"
                          ref={
                            index === focusedOption ? focusedOptionRef : null
                          }
                          hasCheckbox={true}
                        >
                          <Flex
                            justifyContent={{
                              default: 'justifyContentSpaceBetween',
                            }}
                            flexWrap={{
                              default: 'nowrap',
                            }}
                          >
                            <FlexItem>
                              <Truncate content={tag.name}>{tag.name}</Truncate>
                            </FlexItem>
                            <FlexItem>
                              <Tooltip
                                position="right"
                                enableFlip
                                content={`Applicable to ${tag.count} system${tag.count === 1 ? '' : 's'}.`}
                              >
                                <Badge isRead={tag.count <= 0}>
                                  {tag.count}
                                </Badge>
                              </Tooltip>
                            </FlexItem>
                          </Flex>
                        </SelectOption>
                      );
                    })}
                  </SelectGroup>
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
            </>
          )}
        </SelectList>
      </Select>
    </div>
  );
};

export default TagsFilter;
