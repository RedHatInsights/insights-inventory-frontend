import React, { Ref, useId, useMemo, useState, useEffect, useRef } from 'react';
import {
  Checkbox,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import menuStyles from '@patternfly/react-styles/css/components/Menu/menu';
import xor from 'lodash/xor';
import { useDebouncedValue } from '../../../Utilities/hooks/useDebouncedValue';
import { useOperatingSystemsQuery } from '../hooks/useOperatingSystemsQuery';
import {
  buildOperatingSystemSelectGroups,
  buildOsFilterTokens,
  mapOperatingSystemApiResultsToVersionRows,
  serializeOperatingSystemFilterValue,
} from '../utils/operatingSystemSelectOptions';
import { FILTER_DROPDOWN_WIDTH } from '../constants';
import { DEBOUNCE_TIMEOUT_MS } from '../../../constants';

interface OperatingSystemsFilterProps {
  placeholder?: string;
  value?: string[];
  onChange?: (event?: React.MouseEvent, values?: string[]) => void;
}

/* PF MenuItem doesn't support indeterminate checkbox state,
 so we've re-created custom OsFilterOption which does */
const OsFilterOption = ({
  id,
  text,
  isChecked,
  onCheckboxChange,
  listItemClassName,
}: {
  id: string;
  text: string;
  isChecked: boolean | null;
  onCheckboxChange: (
    event: React.FormEvent<HTMLInputElement>,
    checked: boolean,
  ) => void;
  listItemClassName?: string;
}) => (
  <li
    className={css(menuStyles.menuListItem, listItemClassName)}
    role="option"
    aria-selected={isChecked === true}
  >
    <label className={css(menuStyles.menuItem)} htmlFor={id} tabIndex={-1}>
      <span className={css(menuStyles.menuItemMain)}>
        <span className={css(menuStyles.menuItemCheck)}>
          <Checkbox
            id={id}
            component="span"
            isChecked={isChecked}
            onChange={onCheckboxChange}
            aria-label={text}
          />
        </span>
        <span className={css(menuStyles.menuItemText)}>{text}</span>
      </span>
    </label>
  </li>
);

export const OperatingSystemsFilter = ({
  placeholder,
  value = [],
  onChange,
}: OperatingSystemsFilterProps) => {
  const idPrefix = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, DEBOUNCE_TIMEOUT_MS);
  const textInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, isFetched } = useOperatingSystemsQuery({
    enabled: isOpen,
  });

  const groups = useMemo(() => {
    const rows = mapOperatingSystemApiResultsToVersionRows(data);
    return buildOperatingSystemSelectGroups(rows);
  }, [data]);

  // Filter groups and items based on search text
  const filteredGroups = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return groups;
    }

    const searchLower = debouncedSearch.toLowerCase();

    return groups
      .map((group) => {
        // Check if group label matches search
        const groupMatches = group.label.toLowerCase().includes(searchLower);

        // Filter items that match search
        const matchedItems = group.items.filter((item) =>
          item.label.toLowerCase().includes(searchLower),
        );

        // Include group if group name matches OR if any items match
        if (groupMatches || matchedItems.length > 0) {
          return {
            ...group,
            // If group matches, show all items; otherwise show only matched items
            items: groupMatches ? group.items : matchedItems,
          };
        }

        return null;
      })
      .filter((group): group is NonNullable<typeof group> => group !== null);
  }, [groups, debouncedSearch]);

  // Auto-open when user starts typing (if closed)
  useEffect(() => {
    if (search && !isOpen) {
      setIsOpen(true);
    }
  }, [search, isOpen]);

  const onToggleClick = () => {
    // Toggle button should open/close the dropdown
    if (!isOpen) {
      setIsOpen(true);
      textInputRef.current?.focus();
    } else {
      setIsOpen(false);
      // Reset search when closing via toggle
      setSearch('');
    }
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
          ref={textInputRef}
          value={search}
          onClick={(e) => {
            // Clicks in the input should only open the menu, not toggle it closed
            e.stopPropagation();
            setIsOpen(true);
          }}
          onChange={(_event, value) => {
            setSearch(value);
          }}
          onFocus={() => {
            // Open dropdown when input gains focus
            if (!isOpen) {
              setIsOpen(true);
            }
          }}
          id={`${idPrefix}-os-filter-typeahead-input`}
          autoComplete="off"
          placeholder={placeholder ?? 'Filter by operating system'}
        />
      </TextInputGroup>
    </MenuToggle>
  );

  const notifyChange = (next: string[]) => {
    onChange?.(undefined, next);
    // After selection, refocus the input so user can keep typing
    // Small delay to let the checkbox interaction complete
    setTimeout(() => {
      textInputRef.current?.focus();
    }, 0);
  };

  return (
    <Select
      id="operating-systems-filter-select"
      isOpen={isOpen}
      selected={value}
      onOpenChange={(open) => {
        // Don't let PatternFly auto-close when clicking inside the menu
        // We control the open state explicitly
        if (!open) {
          setIsOpen(false);
          setSearch('');
        }
      }}
      toggle={toggle}
      isScrollable
      shouldFocusFirstItemOnOpen={false}
      popperProps={{
        width: FILTER_DROPDOWN_WIDTH,
      }}
    >
      <SelectList isAriaMultiselectable>
        {isLoading && (
          <SelectOption isLoading>
            <Spinner size="lg" />
          </SelectOption>
        )}
        {isError && !isLoading && (
          <SelectOption isDisabled>
            Unable to load operating systems
          </SelectOption>
        )}
        {!isLoading && !isError && isFetched && groups.length === 0 && (
          <SelectOption isDisabled>No versions available</SelectOption>
        )}
        {!isLoading &&
          !isError &&
          isFetched &&
          filteredGroups.length === 0 &&
          debouncedSearch && (
            <SelectOption isDisabled>
              No matching operating systems
            </SelectOption>
          )}
        {!isLoading &&
          !isError &&
          filteredGroups.map((group, groupIndex) => {
            const tokens = buildOsFilterTokens(group);
            const selectedCount = tokens.filter((t) =>
              value.includes(t),
            ).length;
            const allSelected =
              tokens.length > 0 && selectedCount === tokens.length;
            const someSelected = selectedCount > 0 && !allSelected;
            const majorChecked: boolean | null = allSelected
              ? true
              : someSelected
                ? null
                : false;

            return (
              <React.Fragment key={group.label}>
                <OsFilterOption
                  id={`${idPrefix}-major-${groupIndex}`}
                  text={group.label}
                  isChecked={majorChecked}
                  onCheckboxChange={(_event, checked) => {
                    if (!tokens.length) {
                      return;
                    }
                    // if indeterminate, we clear the group instead
                    if (someSelected) {
                      notifyChange(value.filter((t) => !tokens.includes(t)));
                      return;
                    }
                    const next = checked
                      ? [...new Set([...value, ...tokens])]
                      : value.filter((t) => !tokens.includes(t));
                    notifyChange(next);
                  }}
                />
                {group.items.map((item, itemIndex) => {
                  const token = serializeOperatingSystemFilterValue(
                    group.value,
                    item.value,
                  );
                  return (
                    <OsFilterOption
                      key={token}
                      id={`${idPrefix}-g${groupIndex}-i${itemIndex}`}
                      text={item.label}
                      isChecked={value.includes(token)}
                      listItemClassName="pf-v6-u-pl-lg"
                      onCheckboxChange={() => {
                        notifyChange(xor(value, [token]));
                      }}
                    />
                  );
                })}
              </React.Fragment>
            );
          })}
      </SelectList>
    </Select>
  );
};

export default OperatingSystemsFilter;
