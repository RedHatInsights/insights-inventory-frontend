import React, { useCallback, useContext, useMemo, useState } from 'react';
import { Column } from './hooks/useColumns';
import { ColumnManagementModal } from '@patternfly/react-component-groups';

interface SystemsViewColumnManagementContextValue {
  openColumnManagementModal: () => void;
}
const SystemsViewColumnManagementContext =
  React.createContext<SystemsViewColumnManagementContextValue | null>(null);

export const useSystemsViewColumnManagementContext = () => {
  const context = useContext(SystemsViewColumnManagementContext);
  if (!context) {
    throw new Error(
      'hook useSystemsViewColumnManagementContext must be used within SystemsViewColumnManagementProvider',
    );
  }

  return context;
};

interface SystemsViewModalsProviderProps {
  children: React.ReactNode;
  columns: Column[];
  setColumns: React.Dispatch<React.SetStateAction<Column[]>>;
}
export const SystemsViewColumnManagementProvider = ({
  children,
  columns,
  setColumns,
}: SystemsViewModalsProviderProps) => {
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
    <SystemsViewColumnManagementContext.Provider value={contextValue}>
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
    </SystemsViewColumnManagementContext.Provider>
  );
};
