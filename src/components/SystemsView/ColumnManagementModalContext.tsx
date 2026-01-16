import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Column } from './hooks/useColumns';
import { ColumnManagementModal } from '@patternfly/react-component-groups';

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

interface ColumnManagementModalProviderProps {
  children: React.ReactNode;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
}

export const ColumnManagementModalProvider = ({
  children,
  columns,
  setColumns,
}: ColumnManagementModalProviderProps) => {
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
          applyColumns={setColumns}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          // enableDragDrop={true} Disabled due to bug
          title="Manage columns"
          description="Selected categories will be displayed in the table."
        />
      )}
    </ColumnManagementModalContext.Provider>
  );
};
