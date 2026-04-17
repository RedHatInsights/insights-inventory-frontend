import React, { Ref, useId, useMemo, useState } from 'react';
import {
  Checkbox,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  MenuToggleElement,
} from '@patternfly/react-core';
import { css } from '@patternfly/react-styles';
import menuStyles from '@patternfly/react-styles/css/components/Menu/menu';
import xor from 'lodash/xor';
import { useOperatingSystemsQuery } from '../hooks/useOperatingSystemsQuery';
import {
  buildOperatingSystemSelectGroups,
  buildOsFilterTokens,
  mapOperatingSystemApiResultsToVersionRows,
  serializeOperatingSystemFilterValue,
} from '../utils/operatingSystemSelectOptions';
import { FILTER_DROPDOWN_WIDTH } from '../constants';

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
  const { data, isLoading, isError, isFetched } = useOperatingSystemsQuery({
    enabled: isOpen,
  });

  const groups = useMemo(() => {
    const rows = mapOperatingSystemApiResultsToVersionRows(data);
    return buildOperatingSystemSelectGroups(rows);
  }, [data]);

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      onClick={() => setIsOpen(!isOpen)}
      isExpanded={isOpen}
    >
      {placeholder ?? 'Filter by operating system'}
    </MenuToggle>
  );

  const notifyChange = (next: string[]) => {
    onChange?.(undefined, next);
  };

  return (
    <Select
      id="operating-systems-filter-select"
      isOpen={isOpen}
      selected={value}
      onOpenChange={(open) => setIsOpen(open)}
      toggle={toggle}
      isScrollable
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
          groups.map((group, groupIndex) => {
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
