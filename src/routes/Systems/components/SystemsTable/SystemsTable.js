import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  TableToolsTable,
  TableStateProvider,
  useItemsData,
  useFullTableState,
  useStateCallbacks,
} from 'bastilian-tabletools';
import { fetchSystems, resolveColumns, resolveFilters } from '../../helpers.js';
import { DEFAULT_OPTIONS } from './constants';
import useGlobalFilterForItems from './hooks/useGlobalFilterForItems';
import DeleteModal from '../../../../Utilities/DeleteModal';
import useDeleteSystems from '../../hooks/useDeleteSystems';
import useToolbarActions from '../../hooks/useToolbarActions';
import AddSelectedHostsToGroupModal from '../../../../components/InventoryGroups/Modals/AddSelectedHostsToGroupModal';
import RemoveHostsFromGroupModal from '../../../../components/InventoryGroups/Modals/RemoveHostsFromGroupModal';
import useInventoryExport from '../../../../components/InventoryTable/hooks/useInventoryExport/useInventoryExport';
import useTableActions from '../../hooks/useTableActions';
import { TextInputModal } from '../../../../components/SystemDetails/GeneralInfo';
import useEditDisplayName from '../../hooks/useEditDisplayName';
import useFeatureFlag from '../../../../Utilities/useFeatureFlag';

const SystemsTable = ({
  items: itemsProp = fetchSystems,
  columns = [],
  filters,
  options = {},
}) => {
  /*tabletools state*/
  const { items: itemsData } = useItemsData();
  const tableState = useFullTableState();
  const { current: { reload, resetSelection } = {} } = useStateCallbacks();
  const { tableState: { selected } = {} } = tableState || {};

  /*hooks*/
  const items = useGlobalFilterForItems(itemsProp);
  const exportConfig = useInventoryExport({
    filters,
  });

  /*local state*/
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [addHostGroupModalOpen, setAddHostGroupModalOpen] = useState(false);
  const [currentSystem, setCurrentSystem] = useState({});
  const [isRowAction, setIsRowAction] = useState(false);
  const isKesselEnabled = useFeatureFlag('hbi.kessel-migration');

  const reloadData = () => {
    if (selectedItems.length > 0) {
      resetSelection?.();
      reload?.();
    }
  };

  const selectedItems = useMemo(
    () => itemsData?.filter(({ id }) => selected.includes(id)) || [],
    [itemsData, selected],
  );

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
    isKesselEnabled,
    setIsRowAction,
  );

  return (
    <>
      {addHostGroupModalOpen && (
        <AddSelectedHostsToGroupModal
          isModalOpen={addHostGroupModalOpen}
          setIsModalOpen={setAddHostGroupModalOpen}
          modalState={isRowAction ? [currentSystem] : selectedItems}
          reloadData={() => reloadData()}
        />
      )}
      {removeHostsFromGroupModalOpen && (
        <RemoveHostsFromGroupModal
          isModalOpen={removeHostsFromGroupModalOpen}
          setIsModalOpen={setRemoveHostsFromGroupModalOpen}
          modalState={isRowAction ? [currentSystem] : selectedItems}
          reloadData={() => reloadData()}
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
      <TableToolsTable
        variant="compact"
        items={items}
        columns={resolveColumns(columns)}
        filters={resolveFilters(filters)}
        options={{
          ...DEFAULT_OPTIONS,
          dedicatedAction,
          actions: toolbarActions,
          actionResolver: tableActions,
          ...options,
        }}
        toolbarProps={{
          exportConfig,
        }}
      />
    </>
  );
};

SystemsTable.propTypes = {
  items: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  columns: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  filters: PropTypes.object,
  options: PropTypes.object,
};

const SystemsTableWithProvider = (props) => (
  <TableStateProvider>
    <SystemsTable {...props} />
  </TableStateProvider>
);

export default SystemsTableWithProvider;
