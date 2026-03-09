import React, { useMemo, useState, useRef, Ref } from 'react';
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
import { PER_PAGE } from '../../../constants';
import { useDebouncedValue } from '../../../Utilities/hooks/useDebouncedValue';

// TODO refactor these to constants
const STALENESS = ['fresh', 'stale', 'stale_warning'] as const;
const PAGE_SIZE = 50;
const INITIAL_VISIBLE_SIZE = PAGE_SIZE;
const LOADER_ID = 'loader';
const FILTER_DROPDOWN_WIDTH = '300px';
const DEBOUNCE_TIMEOUT_MS = 300;

interface TagsFilterProps {
  placeholder?: string;
  value?: string[];
  onChange?: (event?: React.MouseEvent, values?: string[]) => void;
}

export const TagsFilter = ({
  placeholder,
  value = [],
  onChange,
}: TagsFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [focusedOption, setFocusedOption] = useState(0);
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_TIMEOUT_MS);

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

  const total = data?.pages?.[0].total;

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
  const focusedOptionRef = useRef<HTMLOptionElement>();

  // TODO change this to footer action
  const onMoreTagsAvailable = async () => {
    // setFocusedOption(visibleSize);
  };

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
        onSelect={(event, selected) => {
          if (selected === LOADER_ID) return;
          onChange?.(event, xor(value, [selected]));
        }}
        onOpenChange={() => {
          setIsOpen(false);
          setSearch('');
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
                          isSelected={value.some(
                            (item) => item === `${namespace}/${tag.name}`,
                          )}
                          data-ouia-component-id="FilterByTagsOption"
                          ref={
                            index === focusedOption ? focusedOptionRef : null
                          }
                          hasCheckbox={true}
                        >
                          <Flex
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
                                <Badge isRead>{tag.count}</Badge>
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
                  onClick={onMoreTagsAvailable}
                  itemId={LOADER_ID}
                >
                  {isFetching || !total ? (
                    <Spinner size="lg" />
                  ) : hasNextPage ? (
                    `${total - PER_PAGE} more tags available`
                  ) : null}
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
