import React, {
  useContext,
  useMemo,
  useState,
  useEffect,
  useRef,
  Fragment,
  Ref,
} from 'react';
import {
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Divider,
  MenuToggleElement,
  Badge,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { TypeaheadMenuToggle } from '../../TypeaheadMenuToggle';
import xor from 'lodash/xor';
import { useDebouncedValue } from '../../../../../Utilities/hooks/useDebouncedValue';
import { useWorkspaceGroupsInfiniteQuery } from '../../../../filters/useWorkspaceGroupsInfiniteQuery';
import { DEBOUNCE_TIMEOUT_MS } from '../../../../../constants';
import { UNGROUPED_HOSTS_LABEL } from '../../../constants';
import { DataViewFiltersContext } from '../../../DataViewFiltersContext';

/** `id` stores workspace UUIDs (`group_id`). `name` stores group names (`group_name`). */
export type WorkspaceFilterValueKey = 'id' | 'name';

/** Extra props a caller may pass through `catalog.workspace` `filterProps`. */
export type WorkspaceFilterExtraProps = {
  /**
   * Value written into filter state. Defaults to `id`.
   * `name` emits the workspace name, or `''` for ungrouped hosts.
   */
  valueKey?: WorkspaceFilterValueKey;
};

type WorkspaceFilterProps = {
  placeholder?: string;
  value?: string[];
  onChange?: (event?: React.MouseEvent, values?: string[]) => void;
} & WorkspaceFilterExtraProps;

type WorkspaceGroup = {
  id: string;
  name: string;
  ungrouped?: boolean;
};

type WorkspaceSelectOption = {
  itemId: string;
  selectionValue: string;
  children: React.ReactNode;
};

const workspaceSelectionValue = (
  group: WorkspaceGroup,
  valueKey: WorkspaceFilterValueKey,
) => {
  if (valueKey === 'name') {
    return group.ungrouped ? '' : group.name;
  }
  return group.id;
};

export const WorkspaceFilter = ({
  placeholder,
  value = [],
  onChange,
  valueKey = 'id',
}: WorkspaceFilterProps) => {
  const dataViewCtx = useContext(DataViewFiltersContext);
  const ungroupedWorkspaceIdHint = dataViewCtx?.ungroupedWorkspaceId;

  const PAGE_SIZE = 50;
  const INITIAL_VISIBLE_SIZE = PAGE_SIZE;
  const VIEW_MORE_SIZE = PAGE_SIZE;
  const LOADER_ID = 'loader';
  const hasAccess = true;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_TIMEOUT_MS);
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

    const items: WorkspaceSelectOption[] = flattened
      .filter((g) => !g.ungrouped)
      .map(({ id, name, host_count: hostCount }) => ({
        itemId: id,
        selectionValue: workspaceSelectionValue({ id, name }, valueKey),
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

    const ungroupedOptionId =
      ungroupedRow?.id ?? ungroupedWorkspaceIdHint ?? '';

    const ungroupedOption: WorkspaceSelectOption | false = !debouncedSearch && {
      itemId: ungroupedOptionId,
      selectionValue: workspaceSelectionValue(
        {
          id: ungroupedOptionId,
          name: UNGROUPED_HOSTS_LABEL,
          ungrouped: true,
        },
        valueKey,
      ),
      children: UNGROUPED_HOSTS_LABEL,
    };

    return [...(ungroupedOption ? [ungroupedOption] : []), ...items];
  }, [data, debouncedSearch, ungroupedWorkspaceIdHint, valueKey]);

  const selectedItemIds = useMemo(
    () =>
      workspaceOptions
        .filter((option) => value.includes(option.selectionValue))
        .map((option) => option.itemId),
    [workspaceOptions, value],
  );

  const visibleOptions = workspaceOptions.slice(0, visibleSize);
  const focusedOptionRef = useRef<HTMLOptionElement>();

  const onViewMoreClick = async () => {
    const nextVisibleSize = visibleSize + VIEW_MORE_SIZE;

    if (nextVisibleSize > workspaceOptions.length) {
      await fetchNextPage();
    }

    setVisibleSize(nextVisibleSize);
    setFocusedOption(visibleSize);
  };

  useEffect(() => {
    focusedOptionRef.current?.focus();
  }, [visibleSize]);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <TypeaheadMenuToggle
      toggleRef={toggleRef}
      isExpanded={isOpen}
      onToggleClick={onToggleClick}
      searchValue={search}
      onSearchChange={setSearch}
      placeholder={placeholder ?? ''}
      inputId="multi-typeahead-select-input"
    />
  );

  return (
    <div data-ouia-component-id="FilterByGroup">
      <Select
        id="groups-filter-select"
        ouiaId="Filter by group"
        isOpen={isOpen}
        selected={selectedItemIds}
        onSelect={(event, selected) => {
          if (selected === undefined || selected === LOADER_ID) return;
          const option = workspaceOptions.find(
            (item) => item.itemId === selected,
          );
          if (!option) return;
          onChange?.(event, xor(value, [option.selectionValue]));
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
                const { selectionValue, ...selectOption } = option;
                return (
                  <Fragment key={option.itemId}>
                    <SelectOption
                      isSelected={value.includes(selectionValue)}
                      data-ouia-component-id="FilterByGroupOption"
                      ref={index === focusedOption ? focusedOptionRef : null}
                      hasCheckbox={true}
                      {...selectOption}
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

/** Workspace dropdown that stores group names, including `''` for ungrouped hosts. */
export const WorkspaceNameFilter = (props: WorkspaceFilterProps) => (
  <WorkspaceFilter {...props} valueKey="name" />
);

export default WorkspaceFilter;
