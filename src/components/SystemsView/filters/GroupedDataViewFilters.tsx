import React, {
  Children,
  Fragment,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Divider,
  Menu,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuList,
  MenuToggle,
  Popper,
  ToolbarGroup,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

/** A labelled group of filters in the attribute menu. */
export interface DataViewFilterGroup {
  /** Stable identifier for the group. */
  id: string;
  /** Heading rendered above this group's items. */
  label: React.ReactNode;
  /** filterIds belonging to this group, in display order. */
  filterIds: string[];
}

interface DataViewFilterIdentifiers {
  filterId: string;
  title: string;
}

interface DataViewResolvedFilterGroup {
  id: string;
  label?: React.ReactNode;
  items: DataViewFilterIdentifiers[];
}

/**
 * Partitions the attribute menu into renderable sections.
 *
 * With no groups, returns a single unlabelled section holding every filter — which renders the
 * same flat `MenuList` the component has always produced.
 */
const resolveFilterGroups = (
  filterItems: DataViewFilterIdentifiers[],
  groups: DataViewFilterGroup[] | undefined,
  ungroupedPosition: 'start' | 'end',
): DataViewResolvedFilterGroup[] => {
  if (!groups?.length) {
    return [{ id: 'default', items: filterItems }];
  }

  const byFilterId = new Map(filterItems.map((item) => [item.filterId, item]));
  const claimed = new Set<string>();

  const labelled = groups
    .map((group) => ({
      id: group.id,
      label: group.label,
      items: group.filterIds
        .filter(
          (filterId) => byFilterId.has(filterId) && !claimed.has(filterId),
        )
        .map((filterId) => {
          claimed.add(filterId);
          return byFilterId.get(filterId) as DataViewFilterIdentifiers;
        }),
    }))
    .filter((group) => group.items.length > 0);

  const ungrouped = filterItems.filter((item) => !claimed.has(item.filterId));
  if (ungrouped.length === 0) {
    return labelled;
  }

  const ungroupedSection = { id: 'ungrouped', items: ungrouped };
  return ungroupedPosition === 'start'
    ? [ungroupedSection, ...labelled]
    : [...labelled, ungroupedSection];
};

type FilterChildProps = {
  filterId: string;
  title: string;
};

export interface GroupedDataViewFiltersProps<T extends object> {
  /** `DataViewTextFilter` / `DataViewCheckboxFilter` / ... elements */
  children: React.ReactNode;
  /** Fired when any filter's value changes */
  onChange?: (key: string, newValues: Partial<T>) => void;
  /** Current values, keyed by `filterId` */
  values?: T;
  /** Groups the attribute menu under headings. Omit for a flat list. */
  groups?: DataViewFilterGroup[];
  /** Heading level for group labels. Defaults to 'h3'. */
  groupLabelHeadingLevel?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Where filters absent from every group render. Defaults to 'start'. */
  ungroupedPosition?: 'start' | 'end';
  /** Custom OUIA ID */
  ouiaId?: string;
}

export const GroupedDataViewFilters = <T extends object>({
  children,
  onChange,
  values,
  groups,
  groupLabelHeadingLevel = 'h3',
  ungroupedPosition = 'start',
  ouiaId = 'DataViewFilters',
}: GroupedDataViewFiltersProps<T>) => {
  const filterItems: DataViewFilterIdentifiers[] = useMemo(
    () =>
      Children.toArray(children)
        .map((child) =>
          isValidElement<{ filterId: unknown; title: unknown }>(child)
            ? {
                filterId: String(child.props.filterId),
                title: String(child.props.title),
              }
            : undefined,
        )
        .filter((item): item is DataViewFilterIdentifiers => !!item),
    [children],
  );

  const resolvedGroups = useMemo(
    () => resolveFilterGroups(filterItems, groups, ungroupedPosition),
    [filterItems, groups, ungroupedPosition],
  );

  // Seed synchronously — avoids the accessible-name-on-first-render bug (#680).
  const [activeFilterId, setActiveFilterId] = useState<string>(
    () => filterItems[0]?.filterId ?? '',
  );
  const [isAttributeMenuOpen, setIsAttributeMenuOpen] = useState(false);

  const attributeToggleRef = useRef<HTMLButtonElement>(null);
  const attributeMenuRef = useRef<HTMLDivElement>(null);
  const attributeContainerRef = useRef<HTMLDivElement>(null);

  const activeTitle =
    filterItems.find((item) => item.filterId === activeFilterId)?.title ?? '';

  // Recover if the active filter is removed from the list.
  useEffect(() => {
    if (
      filterItems.length > 0 &&
      !filterItems.some((item) => item.filterId === activeFilterId)
    ) {
      setActiveFilterId(filterItems[0].filterId);
    }
  }, [filterItems, activeFilterId]);

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        isAttributeMenuOpen &&
        !attributeMenuRef.current?.contains(event.target as Node) &&
        !attributeToggleRef.current?.contains(event.target as Node)
      ) {
        setIsAttributeMenuOpen(false);
      }
    },
    [isAttributeMenuOpen],
  );

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [handleClickOutside]);

  const attributeToggle = (
    <MenuToggle
      ref={attributeToggleRef}
      onClick={() => setIsAttributeMenuOpen(!isAttributeMenuOpen)}
      isExpanded={isAttributeMenuOpen}
      icon={<FilterIcon />}
    >
      {activeTitle}
    </MenuToggle>
  );

  const attributeMenu = (
    <Menu
      ref={attributeMenuRef}
      onSelect={(_ev, itemId) => {
        if (
          itemId !== undefined &&
          filterItems.some((item) => item.filterId === itemId)
        ) {
          setActiveFilterId(String(itemId));
        }
        setIsAttributeMenuOpen(false);
      }}
    >
      <MenuContent>
        {resolvedGroups.map((group, index) => {
          const list = (
            <MenuList>
              {group.items.map((item) => (
                <MenuItem key={item.filterId} itemId={item.filterId}>
                  {item.title}
                </MenuItem>
              ))}
            </MenuList>
          );

          return (
            <Fragment key={group.id}>
              {index > 0 && <Divider />}
              {group.label ? (
                <MenuGroup
                  label={group.label}
                  labelHeadingLevel={groupLabelHeadingLevel}
                >
                  {list}
                </MenuGroup>
              ) : (
                list
              )}
            </Fragment>
          );
        })}
      </MenuContent>
    </Menu>
  );

  return (
    <ToolbarToggleGroup
      data-ouia-component-id={ouiaId}
      toggleIcon={<FilterIcon />}
      breakpoint="xl"
    >
      <ToolbarGroup variant="filter-group">
        <div ref={attributeContainerRef}>
          <Popper
            trigger={attributeToggle}
            triggerRef={attributeToggleRef}
            popper={attributeMenu}
            popperRef={attributeMenuRef}
            appendTo={attributeContainerRef.current || undefined}
            isVisible={isAttributeMenuOpen}
          />
        </div>
        {Children.map(children, (child) =>
          isValidElement<FilterChildProps>(child)
            ? cloneElement(child, {
                showToolbarItem: child.props.filterId === activeFilterId,
                onChange: (_event?: React.MouseEvent, value?: unknown) =>
                  onChange?.(child.props.filterId, {
                    [child.props.filterId]: value,
                  } as Partial<T>),
                value: values?.[child.props.filterId as keyof T],
                ...child.props,
              } as Partial<FilterChildProps>)
            : child,
        )}
      </ToolbarGroup>
    </ToolbarToggleGroup>
  );
};

export default GroupedDataViewFilters;
