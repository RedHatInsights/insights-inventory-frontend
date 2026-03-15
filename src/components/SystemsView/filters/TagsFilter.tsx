import React, { useMemo, useState, Ref } from 'react';
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
import { useDebouncedValue } from '../../../Utilities/hooks/useDebouncedValue';
import { useSystemActionModalsContext } from '../SystemActionModalsContext';
import { useTagsQuery } from '../hooks/useTagsQuery';
import { DEBOUNCE_TIMEOUT_MS, PER_PAGE } from '../../../constants';

const LOADER_ID = 'loader';
const FILTER_DROPDOWN_WIDTH = '300px';

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
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_TIMEOUT_MS);
  const { openTagsModal } = useSystemActionModalsContext();

  const { data, total, isLoading, isFetching } = useTagsQuery({
    search: debouncedSearch,
  });

  const hasMoreTags = typeof total === 'number' && total > PER_PAGE;

  const tagsByNamespace = useMemo(() => {
    if (!data?.length) {
      return {};
    } else {
      const result: Record<string, { name: string; count: number }[]> = {};
      data.slice(0, PER_PAGE).forEach(({ tag, count }) => {
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

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onOpenChange = () => {
    setIsOpen(false);
    setSearch('');
  };

  const onMoreTagsAvailable = () => {
    openTagsModal([], {
      initialTagSearch: debouncedSearch,
    });
    onOpenChange();
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
        onOpenChange={onOpenChange}
        toggle={toggle}
        isScrollable
        popperProps={{
          width: FILTER_DROPDOWN_WIDTH,
        }}
      >
        <SelectList isAriaMultiselectable>
          {isLoading && (
            <SelectOption isLoading={true}>
              <Spinner size="lg" />
            </SelectOption>
          )}
          {tagOptions.length === 0 && !isLoading ? (
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
              {hasMoreTags && (
                <SelectOption
                  isLoading={isFetching}
                  isLoadButton={!isFetching}
                  style={{ overflow: 'visible' }}
                  isDisabled={isFetching || total == null}
                  onClick={() => onMoreTagsAvailable()}
                  itemId={LOADER_ID}
                >
                  {isFetching || total == null ? (
                    <Spinner size="lg" />
                  ) : (
                    `${total - PER_PAGE} more tags available`
                  )}
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
