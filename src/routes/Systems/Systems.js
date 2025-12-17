import React, { useCallback, useMemo, useState } from 'react';
import { PageSection } from '@patternfly/react-core';
import {
  TableStateProvider,
  useItemsData,
  useFullTableState,
  useStateCallbacks,
} from 'bastilian-tabletools';

import InventoryPageHeader from '../InventoryComponents/InventoryPageHeader';
import TextInputModal from '../../components/GeneralInfo/TextInputModal';
import AddSelectedHostsToGroupModal from '../../components/InventoryGroups/Modals/AddSelectedHostsToGroupModal';
import RemoveHostsFromGroupModal from '../../components/InventoryGroups/Modals/RemoveHostsFromGroupModal';
import DeleteModal from '../../Utilities/DeleteModal';
import useInventoryExport from '../../components/InventoryTable/hooks/useInventoryExport/useInventoryExport';

import useTableActions from './hooks/useTableActions';
import useDeleteSystems from './hooks/useDeleteSystems';
import useToolbarActions from './hooks/useToolbarActions';
import useEditDisplayName from './hooks/useEditDisplayName';
import LastSeenFilterExtension from './components/SystemsTable/components/filters/LastSeenFilterExtension';

import SystemsTable from './components/SystemsTable';

const Systems = () => {
  /*tabletools state*/
  const { items: itemsData } = useItemsData();
  const tableState = useFullTableState();
  const { current: { reload, resetSelection } = {} } = useStateCallbacks();
  const { tableState: { selected } = {} } = tableState || {};

  /*hooks*/
  const exportConfig = useInventoryExport();

  /*local state*/
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [addHostGroupModalOpen, setAddHostGroupModalOpen] = useState(false);
  const [currentSystem, setCurrentSystem] = useState({});
  const [isRowAction, setIsRowAction] = useState(false);

  const selectedItems = useMemo(
    () => itemsData?.filter(({ id }) => selected.includes(id)) || [],
    [itemsData, selected],
  );

  const reloadData = useCallback(() => {
    if (selectedItems.length > 0) {
      resetSelection?.();
      reload?.();
    }
  }, [reload, resetSelection, selectedItems]);

  const toolbarActions = useToolbarActions(
    selectedItems,
    setAddHostGroupModalOpen,
    setRemoveHostsFromGroupModalOpen,
    setIsRowAction,
  );

  const {
    itemsToDelete,
    onConfirm,
    dedicatedAction,
    isModalOpen,
    handleModalToggle,
  } = useDeleteSystems(
    itemsData,
    reload,
    resetSelection,
    isRowAction ? [currentSystem.id] : selected,
    setIsRowAction,
  );

  const { editModalOpen, onEditModalOpen, onSubmit } = useEditDisplayName(
    currentSystem,
    reload,
    resetSelection,
  );

  const tableActions = useTableActions(
    setCurrentSystem,
    onEditModalOpen,
    handleModalToggle,
    setRemoveHostsFromGroupModalOpen,
    setAddHostGroupModalOpen,
    setIsRowAction,
  );

  return (
    <>
      <InventoryPageHeader />
      <PageSection>
        <SystemsTable
          variant="compact"
          columns={({
            displayName,
            workspace,
            tags,
            operatingSystem,
            lastSeen,
          }) => [displayName, workspace, tags, operatingSystem, lastSeen]}
          filters={({
            displayName,
            status,
            dataCollector,
            rhcStatus,
            lastSeen,
            workspace,
            tags,
            systemType,
            operatingSystem,
          }) => ({
            filterConfig: [
              displayName,
              status,
              operatingSystem,
              dataCollector,
              rhcStatus,
              lastSeen,
              workspace,
              systemType,
              tags,
            ],
          })}
          options={(defaultOptions) => ({
            ...defaultOptions,
            dedicatedAction,
            actions: toolbarActions,
            actionResolver: tableActions,
            onSelect: true,
          })}
          toolbarProps={{
            exportConfig,
            children: <LastSeenFilterExtension />,
          }}
        />

        {addHostGroupModalOpen && (
          <AddSelectedHostsToGroupModal
            isModalOpen={addHostGroupModalOpen}
            setIsModalOpen={setAddHostGroupModalOpen}
            modalState={isRowAction ? [currentSystem] : selectedItems}
            reloadData={isRowAction ? () => reload() : () => reloadData()}
          />
        )}

        {removeHostsFromGroupModalOpen && (
          <RemoveHostsFromGroupModal
            isModalOpen={removeHostsFromGroupModalOpen}
            setIsModalOpen={setRemoveHostsFromGroupModalOpen}
            modalState={isRowAction ? [currentSystem] : selectedItems}
            reloadData={isRowAction ? () => reload() : () => reloadData()}
          />
        )}

        {isModalOpen && (
          <DeleteModal
            className="sentry-mask data-hj-suppress"
            handleModalToggle={handleModalToggle}
            isModalOpen={isModalOpen}
            currentSystems={isRowAction ? [currentSystem] : itemsToDelete}
            onConfirm={onConfirm}
          />
        )}

        {editModalOpen && (
          <TextInputModal
            title="Edit display name"
            isOpen={editModalOpen}
            value={currentSystem.display_name}
            onCancel={() => onEditModalOpen(false)}
            onSubmit={onSubmit}
          />
        )}
      </PageSection>
    </>
  );
};

const SystemsWithProvider = (props) => (
  <TableStateProvider>
    <Systems {...props} />
  </TableStateProvider>
);

export default SystemsWithProvider;
