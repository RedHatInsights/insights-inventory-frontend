import React, {
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ColumnManagementModal } from '../ColumnManagementModal';
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
  onModalOpened?: () => void;
}

export const ColumnManagementModalProvider = <TItem,>({
  children,
  columns,
  defaultColumns,
  setColumns,
  onModalOpened,
}: ColumnManagementModalProviderProps<TItem>) => {
  const [isOpen, setIsOpen] = useState(false);
  const onModalOpenedRef = useRef(onModalOpened);
  onModalOpenedRef.current = onModalOpened;

  const openColumnManagementModal = useCallback(() => {
    setIsOpen(true);
    onModalOpenedRef.current?.();
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
        />
      )}
    </ColumnManagementModalContext.Provider>
  );
};
