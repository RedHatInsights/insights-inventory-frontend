import React, { useCallback, useContext, useMemo, useState } from 'react';
import { ColumnManagementModal } from '../ColumnManagementModal';
import useTagKeyColumnsFeatureFlag from '../../Utilities/useTagKeyColumnsFeatureFlag';
import { AddTagColumn } from './AddTagColumn';
import type { Column } from './columns/types';

interface SystemsViewColumnManagementContextValue {
  openColumnManagementModal: () => void;
}
const ColumnManagementModalContext =
  React.createContext<SystemsViewColumnManagementContextValue | null>(null);

export const useColumnManagementModalContext = () => {
  const context = useContext(ColumnManagementModalContext);
  if (!context) {
    throw new Error(
      'hook useColumnManagementModalContext must be used within ColumnManagementModalProvider',
    );
  }

  return context;
};

interface ColumnManagementModalProviderProps<TItem = unknown> {
  children: React.ReactNode;
  columns: readonly Column<TItem>[];
  defaultColumns: readonly Column<TItem>[];
  setColumns: React.Dispatch<React.SetStateAction<readonly Column<TItem>[]>>;
}

export const ColumnManagementModalProvider = <TItem,>({
  children,
  columns,
  defaultColumns,
  setColumns,
}: ColumnManagementModalProviderProps<TItem>) => {
  const isTagKeyColumnsEnabled = useTagKeyColumnsFeatureFlag();
  const [isOpen, setIsOpen] = useState(false);
  const openColumnManagementModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const contextValue: SystemsViewColumnManagementContextValue = useMemo(
    () => ({
      openColumnManagementModal,
    }),
    [openColumnManagementModal],
  );

  return (
    <ColumnManagementModalContext.Provider value={contextValue}>
      {children}
      {isOpen && (
        <ColumnManagementModal
          appliedColumns={columns}
          defaultColumns={defaultColumns}
          applyColumns={setColumns}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          enableDragDrop={true}
          title="Manage columns"
          description="Select which columns you would like to see in your Systems table using the checkboxes. Re-order them using the drag and drop."
          listFooter={
            isTagKeyColumnsEnabled
              ? ({ columns: draftColumns, addColumn }) => (
                  <AddTagColumn
                    columns={draftColumns}
                    onAdd={(column) => addColumn(column as Column<TItem>)}
                  />
                )
              : undefined
          }
        />
      )}
    </ColumnManagementModalContext.Provider>
  );
};
