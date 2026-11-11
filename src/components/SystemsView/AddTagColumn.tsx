import React, { useMemo, useState, type Ref } from 'react';
import {
  Button,
  Flex,
  FlexItem,
  MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  Spinner,
} from '@patternfly/react-core';
import { TypeaheadMenuToggle } from './filters/TypeaheadMenuToggle';
import { useAccountTagCatalog } from '../InventoryViews/hooks/useAccountTagCatalog';
import {
  matchingTagIdentities,
  parseTagColumnKey,
  tagColumnKey,
  tagIdentity,
} from '../InventoryViews/tagKeys';
import { bindTagKeyColumns } from './columns/inventory/tagKeyColumns';
import type { InventoryBindableItem } from './columns/inventory/columnDefinitions';
import type { Column } from './columns/types';

/** PatternFly's scrollable menu cap. Keeps a long tag list inside the viewport. */
const TAG_MENU_MAX_HEIGHT = '18.75rem';

interface AddTagColumnProps {
  columns: readonly { key?: string | number }[];
  onAdd: (column: Column<InventoryBindableItem>) => void;
}

const labelForColumnKey = (columnKey: string): string => {
  const identity = parseTagColumnKey(columnKey);
  return identity ? tagIdentity(identity.namespace, identity.key) : columnKey;
};

export const AddTagColumn = ({ columns, onAdd }: AddTagColumnProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [selectedKey, setSelectedKey] = useState<string>();
  const { data, isLoading, isError } = useAccountTagCatalog();

  const takenColumnKeys = useMemo(
    () =>
      new Set(
        columns.flatMap((column) =>
          column.key == null ? [] : [String(column.key)],
        ),
      ),
    [columns],
  );
  const matches = useMemo(
    () => matchingTagIdentities(data ?? [], filterValue, takenColumnKeys),
    [data, filterValue, takenColumnKeys],
  );

  const onSearchChange = (value: string) => {
    setInputValue(value);
    setFilterValue(value);
    setIsOpen(true);
    if (selectedKey && value !== labelForColumnKey(selectedKey)) {
      setSelectedKey(undefined);
    }
  };

  const clearInput = () => {
    setSelectedKey(undefined);
    setInputValue('');
    setFilterValue('');
    setIsOpen(true);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <TypeaheadMenuToggle
      toggleRef={toggleRef}
      isExpanded={isOpen}
      onToggleClick={() => setIsOpen((open) => !open)}
      searchValue={inputValue}
      onSearchChange={onSearchChange}
      onClear={clearInput}
      placeholder="Add tag as a column..."
      inputId="add-tag-column-search"
      inputAriaLabel="Add tag as a column"
      data-testid="add-tag-column-search"
    />
  );

  const addSelected = () => {
    if (!selectedKey) return;
    const identity = parseTagColumnKey(selectedKey);
    if (!identity) return;
    const [column] = bindTagKeyColumns([identity]);
    onAdd({ ...column, isShown: true, isShownByDefault: true });
    setSelectedKey(undefined);
    setInputValue('');
    setFilterValue('');
    setIsOpen(false);
  };

  return (
    <Flex
      alignItems={{ default: 'alignItemsCenter' }}
      spaceItems={{ default: 'spaceItemsSm' }}
    >
      <FlexItem grow={{ default: 'grow' }}>
        <Select
          isOpen={isOpen}
          selected={selectedKey}
          onSelect={(_event, value) => {
            if (value == null) return;
            const key = String(value);
            setSelectedKey(key);
            // The field shows the choice. The filter stays empty so the menu
            // still lists the other tags, matching a PatternFly typeahead.
            setInputValue(labelForColumnKey(key));
            setFilterValue('');
            setIsOpen(false);
          }}
          onOpenChange={(open) => setIsOpen(open)}
          toggle={toggle}
          shouldFocusFirstItemOnOpen={false}
          isScrollable
          maxMenuHeight={TAG_MENU_MAX_HEIGHT}
          popperProps={{ preventOverflow: true }}
        >
          <SelectList>
            {isLoading && (
              <SelectOption isLoading>
                <Spinner size="lg" />
              </SelectOption>
            )}
            {isError && !isLoading && (
              <SelectOption isDisabled>Unable to load tags</SelectOption>
            )}
            {!isLoading && !isError && matches.length === 0 && (
              <SelectOption isDisabled>No matching tags</SelectOption>
            )}
            {matches.map((identity) => {
              const label = tagIdentity(identity.namespace, identity.key);
              const key = tagColumnKey(label);
              return (
                <SelectOption key={key} value={key}>
                  {label}
                </SelectOption>
              );
            })}
          </SelectList>
        </Select>
      </FlexItem>
      <FlexItem>
        <Button
          variant="secondary"
          onClick={addSelected}
          isDisabled={!selectedKey}
        >
          Add column
        </Button>
      </FlexItem>
    </Flex>
  );
};
