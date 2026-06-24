/**
 * Vendored from PatternFly `react-component-groups` (ColumnManagementModal).
 * Source: https://github.com/patternfly/react-component-groups/blob/main/packages/module/src/ColumnManagementModal/ColumnManagementModal.tsx
 * License: MIT (PatternFly / Red Hat)
 *
 * Copied locally for customization; keep in sync with upstream when upgrading PatternFly packages.
 * ListManager is also vendored locally in this folder.
 */
import React, { useEffect, useMemo, useState } from 'react';
import type { ModalProps } from '@patternfly/react-core';
import {
  Button,
  ButtonVariant,
  Content,
  ContentVariants,
  Flex,
  FlexItem,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from '@patternfly/react-core';
import ListManager, { type ListManagerItem } from '../ListManager/ListManager';

export interface ColumnManagementModalColumn {
  /** Internal identifier of a column by which table displayed columns are filtered. */
  key: string;
  /** The actual display name of the column possibly with a tooltip or icon. */
  title: React.ReactNode;
  /** If user changes checkboxes, the component will send back column array with this property altered. */
  isShown?: boolean;
  /** Set to false if the column should be hidden initially */
  isShownByDefault: boolean;
  /** The checkbox will be disabled, this is applicable to columns which should not be toggleable by user */
  isUntoggleable?: boolean;
  /** Optional app identifier displayed alongside the column title. */
  appName?: string;
}

/** extends ModalProps */
export interface ColumnManagementModalProps<
  T extends ColumnManagementModalColumn = ColumnManagementModalColumn,
> extends Omit<ModalProps, 'ref' | 'children'> {
  /** Flag to show the modal */
  isOpen?: boolean;
  /** Invoked when modal visibility is changed */
  onClose?: (event: KeyboardEvent | React.MouseEvent) => void;
  /** Current column state */
  appliedColumns: T[];
  /** Canonical default column order and visibility for "Reset to default" */
  defaultColumns?: T[];
  /** Invoked with new column state after save button is clicked */
  applyColumns: (newColumns: T[]) => void;
  /* Modal description text */
  description?: string;
  /* Modal title text */
  title?: string;
  /** Custom OUIA ID */
  ouiaId?: string | number;
  /** Enable drag and drop functionality for reordering columns */
  enableDragDrop?: boolean;
}

const getColumnSnapshot = <
  T extends ColumnManagementModalColumn = ColumnManagementModalColumn,
>(
  columns: T[],
) =>
  columns.map((column) => ({
    key: column.key,
    isShown: column.isShown ?? column.isShownByDefault,
  }));

export function ColumnManagementModal<
  T extends ColumnManagementModalColumn = ColumnManagementModalColumn,
>({
  title = 'Manage columns',
  description = 'Selected categories will be displayed in the table.',
  isOpen = false,
  onClose = () => undefined,
  appliedColumns,
  defaultColumns,
  applyColumns,
  ouiaId = 'ColumnManagementModal',
  enableDragDrop = false,
  ...props
}: ColumnManagementModalProps<T>) {
  const [currentColumns, setCurrentColumns] = useState<T[]>(() =>
    appliedColumns.map((column) => ({
      ...column,
      isShown: column.isShown ?? column.isShownByDefault,
    })),
  );

  // Sync with appliedColumns when they change
  useEffect(() => {
    setCurrentColumns(
      appliedColumns.map((column) => ({
        ...column,
        isShown: column.isShown ?? column.isShownByDefault,
      })),
    );
  }, [appliedColumns]);

  const hasChanges = useMemo(() => {
    const applied = getColumnSnapshot(appliedColumns);
    const current = getColumnSnapshot(currentColumns);

    if (applied.length !== current.length) {
      return true;
    }

    return applied.some(
      (column, index) =>
        column.key !== current[index].key ||
        column.isShown !== current[index].isShown,
    );
  }, [appliedColumns, currentColumns]);

  // Convert ColumnManagementModalColumn to ListManagerItem
  const listManagerItems: ListManagerItem[] = currentColumns.map((column) => ({
    key: column.key,
    title: column.title,
    isSelected: column.isShown,
    isShownByDefault: column.isShownByDefault,
    isUntoggleable: column.isUntoggleable,
    appName: column.appName,
  }));

  const resetToDefault = () => {
    const orderSource = defaultColumns ?? appliedColumns;
    const currentByKey = new Map(
      currentColumns.map((column) => [column.key, column]),
    );

    const resetColumns: T[] = [];

    for (const defaultColumn of orderSource) {
      const column = currentByKey.get(defaultColumn.key);
      if (column) {
        resetColumns.push({
          ...column,
          isShown: defaultColumn.isShownByDefault ?? false,
        });
      }
    }

    setCurrentColumns(resetColumns);
  };

  const updateColumns = (items: ListManagerItem[]) => {
    const newColumns = currentColumns.map((column) => {
      const matchingItem = items.find((item) => item.key === column.key);
      return matchingItem
        ? {
            ...column,
            isShown: matchingItem.isSelected ?? column.isShownByDefault,
          }
        : column;
    });
    setCurrentColumns(newColumns);
  };

  const handleSelect = (item: ListManagerItem) => {
    updateColumns([item]);
  };

  const handleSelectAll = (items: ListManagerItem[]) => {
    updateColumns(items);
  };

  const handleOrderChange = (items: ListManagerItem[]) => {
    // Update the order of currentColumns based on the new order from ListManager
    const newColumns = items.map((item) => {
      const originalColumn = currentColumns.find((col) => col.key === item.key);
      if (!originalColumn) {
        throw new Error(`Column with key ${item.key} not found`);
      }
      return {
        ...originalColumn,
        isShown: item.isSelected ?? originalColumn.isShownByDefault,
      };
    });
    setCurrentColumns(newColumns);
  };

  const handleSave = (items: ListManagerItem[]) => {
    const updatedColumns = items.map((item) => {
      const originalColumn = currentColumns.find((col) => col.key === item.key);
      if (!originalColumn) {
        throw new Error(`Column with key ${item.key} not found`);
      }
      return {
        ...originalColumn,
        isShown: item.isSelected,
      };
    });
    applyColumns(updatedColumns);
    onClose({} as KeyboardEvent);
  };

  const handleCancel = () => {
    onClose({} as KeyboardEvent);
  };

  const handleSaveClick = () => {
    handleSave(listManagerItems);
  };

  return (
    <Modal
      onClose={onClose}
      isOpen={isOpen}
      variant="small"
      ouiaId={ouiaId}
      {...props}
    >
      <ModalHeader
        title={title}
        description={
          <>
            <Content component={ContentVariants.p}>{description}</Content>
            <Button
              isInline
              onClick={resetToDefault}
              variant={ButtonVariant.link}
              ouiaId={`${ouiaId}-reset-button`}
            >
              Reset to default
            </Button>
          </>
        }
      />
      <ModalBody tabIndex={0} aria-label="Column selection list">
        <ListManager
          columns={listManagerItems}
          ouiaId={ouiaId}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          onOrderChange={handleOrderChange}
          onSave={handleSave}
          onCancel={handleCancel}
          enableDragDrop={enableDragDrop}
          showActions={false}
        />
      </ModalBody>
      <ModalFooter>
        <Flex>
          <FlexItem>
            <Button
              variant={ButtonVariant.primary}
              onClick={handleSaveClick}
              isDisabled={!hasChanges}
              ouiaId={`${ouiaId}-save-button`}
            >
              Save
            </Button>
          </FlexItem>
          <FlexItem>
            <Button
              variant={ButtonVariant.link}
              onClick={handleCancel}
              ouiaId={`${ouiaId}-cancel-button`}
            >
              Cancel
            </Button>
          </FlexItem>
        </Flex>
      </ModalFooter>
    </Modal>
  );
}

export default ColumnManagementModal;
