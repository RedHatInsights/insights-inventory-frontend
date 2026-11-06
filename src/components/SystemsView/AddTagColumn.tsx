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

interface AddTagColumnProps {
  columns: readonly { key?: string | number }[];
  onAdd: (column: Column<InventoryBindableItem>) => void;
}

export const AddTagColumn = ({ columns, onAdd }: AddTagColumnProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
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
    () => matchingTagIdentities(data ?? [], search, takenColumnKeys),
    [data, search, takenColumnKeys],
  );

  const onSearchChange = (value: string) => {
    setSearch(value);
    setSelectedKey(undefined);
    setIsOpen(true);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <TypeaheadMenuToggle
      toggleRef={toggleRef}
      isExpanded={isOpen}
      onToggleClick={() => setIsOpen((open) => !open)}
      searchValue={search}
      onSearchChange={onSearchChange}
      placeholder="Search tags…"
      inputId="add-tag-column-search"
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
    setSearch('');
    setIsOpen(false);
  };

  return (
    <Flex
      alignItems={{ default: 'alignItemsFlexEnd' }}
      spaceItems={{ default: 'spaceItemsSm' }}
    >
      <FlexItem grow={{ default: 'grow' }}>
        <label htmlFor="add-tag-column-search">Tag to add as column</label>
        <Select
          isOpen={isOpen}
          selected={selectedKey}
          onSelect={(_event, value) => {
            const key = String(value);
            const identity = parseTagColumnKey(key);
            setSelectedKey(key);
            setSearch(
              identity ? tagIdentity(identity.namespace, identity.key) : key,
            );
            setIsOpen(false);
          }}
          onOpenChange={(open) => setIsOpen(open)}
          toggle={toggle}
          shouldFocusFirstItemOnOpen={false}
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
          Add
        </Button>
      </FlexItem>
    </Flex>
  );
};
