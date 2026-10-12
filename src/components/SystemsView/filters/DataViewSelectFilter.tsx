import {
  Badge,
  Menu,
  MenuContent,
  MenuItem,
  MenuList,
  MenuToggle,
  Popper,
  ToolbarFilter,
} from '@patternfly/react-core';
import type { MenuProps, ToolbarLabel } from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import React, {
  type FC,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FilterOption as DataViewFilterOption } from './types';

const isToolbarLabel = (label: string | ToolbarLabel): label is ToolbarLabel =>
  typeof label === 'object' && 'key' in label;

export const isDataViewFilterOption = (
  obj: unknown,
): obj is DataViewFilterOption =>
  !!obj &&
  typeof obj === 'object' &&
  'label' in obj &&
  'value' in obj &&
  typeof (obj as DataViewFilterOption).value === 'string';

export interface DataViewSelectFilterProps extends Omit<
  MenuProps,
  'onSelect' | 'onChange'
> {
  /** Unique key for the filter attribute */
  filterId: string;
  /** Array of current filter values */
  value?: string[];
  /** Filter title displayed in the toolbar */
  title: string;
  /** Label for the applied filter chip / category; defaults to title */
  chipTitle?: string;
  /** Placeholder text of the menu */
  placeholder?: string;
  /** Filter options displayed */
  options: (DataViewFilterOption | string)[];
  /** Callback for updating when item selection changes. */
  onChange?: (event?: React.MouseEvent, values?: string[]) => void;
  /** Menu selection handler for the active selection mode */
  onSelect: (event?: ReactMouseEvent, itemId?: string | number) => void;
  /** Controls visibility of the filter in the toolbar */
  showToolbarItem?: boolean;
  /** Controls visibility of the filter icon */
  showIcon?: boolean;
  /** Controls visibility of the selected items badge */
  showBadge?: boolean;
  /** Controls selection mode between single-select and multi-select */
  selectionMode: 'single' | 'multi';
  /** Custom OUIA ID */
  ouiaId?: string;
}

export const DataViewSelectFilter: FC<DataViewSelectFilterProps> = ({
  filterId,
  title,
  chipTitle,
  value = [],
  onChange,
  onSelect,
  placeholder,
  options = [],
  showToolbarItem,
  showIcon = !placeholder,
  showBadge = !placeholder,
  selectionMode,
  ouiaId = 'DataViewSelectFilter',
  ...props
}: DataViewSelectFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const categoryName = chipTitle ?? title;
  const isSingleSelect = selectionMode === 'single';

  const normalizeOptions = useMemo(
    () =>
      options.map((option) =>
        typeof option === 'string' ? { label: option, value: option } : option,
      ),
    [options],
  );

  const handleToggleClick = (event: ReactMouseEvent) => {
    event.stopPropagation();
    setTimeout(() => {
      const firstElement = menuRef.current?.querySelector(
        'li > button:not(:disabled)',
      ) as HTMLElement;
      firstElement?.focus();
    }, 0);
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (event?: ReactMouseEvent, itemId?: string | number) => {
    onSelect(event, itemId);
    if (isSingleSelect) {
      setIsOpen(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) =>
    isOpen &&
    menuRef.current &&
    toggleRef.current &&
    !menuRef.current.contains(event.target as Node) &&
    !toggleRef.current.contains(event.target as Node) &&
    setIsOpen(false);

  useEffect(() => {
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ToolbarFilter
      key={ouiaId}
      data-ouia-component-id={ouiaId}
      labels={value.map((item) => {
        const activeOption = normalizeOptions.find(
          (option) => option.value === item,
        );
        return {
          key: activeOption?.value as string,
          node: activeOption?.label,
        };
      })}
      deleteLabel={(_, label) =>
        onChange?.(
          undefined,
          value.filter(
            (item) => item !== (isToolbarLabel(label) ? label.key : label),
          ),
        )
      }
      categoryName={categoryName}
      showToolbarItem={showToolbarItem}
    >
      <Popper
        trigger={
          <MenuToggle
            ouiaId={`${ouiaId}-toggle`}
            ref={toggleRef}
            onClick={handleToggleClick}
            isExpanded={isOpen}
            icon={showIcon ? <FilterIcon /> : undefined}
            badge={
              value.length > 0 && showBadge ? (
                <Badge data-ouia-component-id={`${ouiaId}-badge`} isRead>
                  {value.length}
                </Badge>
              ) : undefined
            }
            style={{ width: '200px' }}
          >
            {placeholder ?? title}
          </MenuToggle>
        }
        triggerRef={toggleRef}
        popper={
          <Menu
            ref={menuRef}
            ouiaId={`${ouiaId}-menu`}
            onSelect={handleSelect}
            selected={value}
            {...props}
          >
            <MenuContent>
              <MenuList>
                {normalizeOptions.map((option) => (
                  <MenuItem
                    data-ouia-component-id={`${ouiaId}-filter-item-${option.value}`}
                    key={option.value}
                    itemId={option.value}
                    isSelected={value.includes(option.value)}
                    hasCheckbox={!isSingleSelect}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </MenuList>
            </MenuContent>
          </Menu>
        }
        popperRef={menuRef}
        appendTo={containerRef.current || undefined}
        aria-label={`${title ?? filterId} filter`}
        isVisible={isOpen}
      />
    </ToolbarFilter>
  );
};

export default DataViewSelectFilter;
