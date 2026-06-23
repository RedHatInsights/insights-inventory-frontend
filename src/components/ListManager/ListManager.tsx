/**
 * Vendored from PatternFly `react-component-groups` (ListManager).
 * Source: https://github.com/patternfly/react-component-groups/blob/main/packages/module/src/ListManager/ListManager.tsx
 * License: MIT (PatternFly / Red Hat)
 *
 * Copied locally for customization; keep in sync with upstream when upgrading PatternFly packages.
 * Drag-drop rows follow PatternFly's draggable DataList markup (checkbox in DataListControl with otherControls).
 */
import React, { useEffect, useState, type FunctionComponent } from 'react';
import {
  DataList,
  DataListItem,
  DataListItemRow,
  DataListCheck,
  DataListControl,
  DataListCell,
  DataListItemCells,
  Button,
  ButtonVariant,
  ActionList,
  ActionListItem,
  ActionListGroup,
} from '@patternfly/react-core';
import {
  DragDropSort,
  Droppable,
  type DraggableObject,
} from '@patternfly/react-drag-drop';
import {
  BulkSelect,
  type BulkSelectValue,
} from '@patternfly/react-component-groups';

export interface ListManagerItem {
  /** Internal identifier of a column by which table displayed columns are filtered. */
  key: string;
  /** The actual display name of the column possibly with a tooltip or icon. */
  title: React.ReactNode;
  /** If user changes checkboxes, the component will send back column array with this property altered. */
  isSelected?: boolean;
  /** Set to false if the column should be hidden initially */
  isShownByDefault: boolean;
  /** The checkbox will be disabled, this is applicable to columns which should not be toggleable by user */
  isUntoggleable?: boolean;
}

export interface ListManagerProps {
  /** Current column state */
  columns: ListManagerItem[];
  /** Custom OUIA ID */
  ouiaId?: string | number;
  /** Callback when a column is selected or deselected */
  onSelect?: (column: ListManagerItem) => void;
  /** Callback when all columns are selected or deselected */
  onSelectAll?: (columns: ListManagerItem[]) => void;
  /** Callback when the column order changes */
  onOrderChange?: (columns: ListManagerItem[]) => void;
  /** Callback to save the column state */
  onSave?: (columns: ListManagerItem[]) => void;
  /** Callback to close the modal */
  onCancel?: () => void;
  /** Enable drag and drop functionality for reordering items */
  enableDragDrop?: boolean;
  /** Custom aria-label for the DataList */
  dataListAriaLabel?: string;
  /** When false, Save/Cancel actions are omitted (e.g. when rendered in a ModalFooter). */
  showActions?: boolean;
}

const ListManager: FunctionComponent<ListManagerProps> = ({
  columns,
  ouiaId = 'Column',
  onSelect,
  onSelectAll,
  onOrderChange,
  onSave,
  onCancel,
  enableDragDrop = true,
  dataListAriaLabel = 'Selected columns',
  showActions = true,
}: ListManagerProps) => {
  const [currentColumns, setCurrentColumns] = useState(() =>
    columns.map((column) => ({
      ...column,
      isSelected: column.isSelected ?? column.isShownByDefault,
      id: column.key,
    })),
  );

  useEffect(() => {
    setCurrentColumns(
      columns.map((column) => ({
        ...column,
        isSelected: column.isSelected ?? column.isShownByDefault,
        id: column.key,
      })),
    );
  }, [columns]);

  const handleChange = (columnKey: string) => {
    const newColumns = [...currentColumns];
    const index = newColumns.findIndex((col) => col.key === columnKey);
    if (index === -1) {
      return;
    }

    const changedColumn = { ...newColumns[index] };
    changedColumn.isSelected = !changedColumn.isSelected;
    newColumns[index] = changedColumn;

    setCurrentColumns(newColumns);
    onSelect?.(changedColumn);
  };

  const onDrag = (_event: unknown, newOrder: DraggableObject[]) => {
    const newColumns = newOrder.map((item: DraggableObject) => {
      const found = currentColumns.find((c) => c.key === String(item.id));
      if (!found) {
        throw new Error(`Column with key ${item.id} not found`);
      }
      return found;
    });
    setCurrentColumns(newColumns);
    onOrderChange?.(newColumns);
  };

  const handleSave = () => {
    onSave?.(currentColumns);
  };

  const handleBulkSelect = (value: BulkSelectValue) => {
    const allSelected = value === 'all' || value === 'page';
    handleSelectAll(allSelected);
  };

  const handleSelectAll = (select = true) => {
    const newColumns = currentColumns.map((c) => ({
      ...c,
      isSelected: c.isUntoggleable ? c.isSelected : select,
    }));
    setCurrentColumns(newColumns);
    onSelectAll?.(newColumns);
  };

  const renderColumnCheck = (
    column: ListManagerItem & { id: string },
    index: number,
    otherControls = false,
  ) => (
    <DataListCheck
      data-testid={`column-check-${column.key}`}
      otherControls={otherControls}
      isChecked={column.isSelected}
      onChange={() => handleChange(column.key)}
      isDisabled={column.isUntoggleable}
      ouiaId={`${ouiaId}-column-${index}-checkbox`}
      id={`${ouiaId}-column-${index}-checkbox`}
      aria-labelledby={`${ouiaId}-column-${index}-label`}
    />
  );

  const renderColumnCells = (
    column: ListManagerItem & { id: string },
    index: number,
  ) => (
    <DataListItemCells
      dataListCells={[
        <DataListCell
          key={column.key}
          data-ouia-component-id={`${ouiaId}-column-${index}-label`}
        >
          <label htmlFor={`${ouiaId}-column-${index}-checkbox`}>
            {column.title}
          </label>
        </DataListCell>,
      ]}
    />
  );

  const renderDataListItem = (
    column: ListManagerItem & { id: string },
    index: number,
  ) => (
    <DataListItemRow key={column.key}>
      {renderColumnCheck(column, index)}
      {renderColumnCells(column, index)}
    </DataListItemRow>
  );

  const renderDraggableDataListItem = (
    column: ListManagerItem & { id: string },
    index: number,
  ) => (
    <>
      <DataListControl>
        {renderColumnCheck(column, index, true)}
      </DataListControl>
      {renderColumnCells(column, index)}
    </>
  );

  return (
    <>
      <div style={{ paddingBlockEnd: 'var(--pf-t--global--spacer--md)' }}>
        <BulkSelect
          canSelectAll
          isDataPaginated={false}
          selectedCount={
            currentColumns.filter(({ isSelected }) => isSelected).length
          }
          totalCount={currentColumns.length}
          onSelect={handleBulkSelect}
          pageSelected={currentColumns.every((item) => item.isSelected)}
          pagePartiallySelected={
            currentColumns.some((item) => item.isSelected) &&
            !currentColumns.every((item) => item.isSelected)
          }
        />
      </div>
      {enableDragDrop ? (
        <DragDropSort
          variant="DataList"
          items={currentColumns.map((column, index) => ({
            id: column.key,
            content: renderDraggableDataListItem(column, index),
          }))}
          onDrop={onDrag}
          overlayProps={{ isCompact: true }}
        >
          <Droppable
            items={currentColumns.map((column) => ({
              id: column.key,
              content: column.title,
            }))}
            wrapper={
              <DataList
                aria-label={dataListAriaLabel}
                isCompact
                data-ouia-component-id={`${ouiaId}-column-list`}
              />
            }
          />
        </DragDropSort>
      ) : (
        <DataList
          aria-label={dataListAriaLabel}
          isCompact
          data-ouia-component-id={`${ouiaId}-column-list`}
        >
          {currentColumns.map((column, index) => (
            <DataListItem key={column.key}>
              {renderDataListItem(column, index)}
            </DataListItem>
          ))}
        </DataList>
      )}
      {showActions && (
        <ActionList
          style={{ paddingBlockStart: 'var(--pf-t--global--spacer--md)' }}
        >
          <ActionListGroup>
            <ActionListItem>
              <Button
                key="save"
                variant={ButtonVariant.primary}
                onClick={handleSave}
                ouiaId={`${ouiaId}-save-button`}
              >
                Save
              </Button>
            </ActionListItem>
            <ActionListItem>
              <Button
                key="cancel"
                variant={ButtonVariant.link}
                onClick={onCancel}
                ouiaId={`${ouiaId}-cancel-button`}
              >
                Cancel
              </Button>
            </ActionListItem>
          </ActionListGroup>
        </ActionList>
      )}
    </>
  );
};

export default ListManager;
