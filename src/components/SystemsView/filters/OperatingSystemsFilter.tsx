import React, { Ref, useMemo, useState } from 'react';
import {
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  MenuToggleElement,
} from '@patternfly/react-core';
import xor from 'lodash/xor';
import { useOperatingSystemsQuery } from '../hooks/useOperatingSystemsQuery';
import {
  buildOperatingSystemSelectGroups,
  mapOperatingSystemApiResultsToVersionRows,
  type OperatingSystemSelectGroup,
} from '../utils/operatingSystemSelectOptions';

const MAJOR_TOKEN_PREFIX = '__major__|';
const FILTER_DROPDOWN_WIDTH = '300px';

interface OperatingSystemsFilterProps {
  placeholder?: string;
  value?: string[];
  onChange?: (event?: React.MouseEvent, values?: string[]) => void;
}

const majorSelectValue = (group: OperatingSystemSelectGroup) =>
  `${MAJOR_TOKEN_PREFIX}${group.label}`;

const groupTokens = (group: OperatingSystemSelectGroup): string[] =>
  group.items.map((item) => `${group.value}:${item.value}`);

export const OperatingSystemsFilter = ({
  placeholder,
  value = [],
  onChange,
}: OperatingSystemsFilterProps) => {
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

  const onSelect = (
    _event: React.MouseEvent | undefined,
    selected: string | number | undefined,
  ) => {
    if (selected === undefined) {
      return;
    }
    const selectedStr = String(selected);
    if (selectedStr.startsWith(MAJOR_TOKEN_PREFIX)) {
      const label = selectedStr.slice(MAJOR_TOKEN_PREFIX.length);
      const group = groups.find((g) => g.label === label);
      if (!group) {
        return;
      }
      const tokens = groupTokens(group);
      if (!tokens.length) {
        return;
      }
      const allSelected = tokens.every((t) => value.includes(t));
      const next = allSelected
        ? value.filter((t) => !tokens.includes(t))
        : [...new Set([...value, ...tokens])];
      onChange?.(_event, next);
      return;
    }
    onChange?.(_event, xor(value, [selectedStr]));
  };

  return (
    <Select
      id="operating-systems-filter-select"
      isOpen={isOpen}
      selected={value}
      onSelect={onSelect}
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
          groups.map((group) => {
            const tokens = groupTokens(group);
            const selectedCount = tokens.filter((t) =>
              value.includes(t),
            ).length;
            const allSelected =
              tokens.length > 0 && selectedCount === tokens.length;
            const someSelected = selectedCount > 0 && !allSelected;

            return (
              <React.Fragment key={group.label}>
                <SelectOption
                  value={majorSelectValue(group)}
                  hasCheckbox
                  isSelected={allSelected}
                  {...(someSelected ? { isIndeterminate: true } : {})}
                >
                  {group.label}
                </SelectOption>
                {group.items.map((item) => {
                  const token = `${group.value}:${item.value}`;
                  return (
                    <SelectOption
                      key={token}
                      value={token}
                      hasCheckbox
                      isSelected={value.includes(token)}
                      className="pf-v6-u-pl-lg"
                    >
                      {item.label}
                    </SelectOption>
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
