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

const SystemsTable = ({
  items: itemsProp = fetchSystems,
  columns = [],
  filters,
  options = {},
}) => {
  const items = useGlobalFilterForItems(itemsProp);
  const { items: itemsData } = useItemsData();
  const tableState = useFullTableState();
  const { current: { reload, resetSelection } = {} } = useStateCallbacks();
  const { tableState: { selected } = {} } = tableState || {};
  const [addHostGroupModalOpen, setAddHostGroupModalOpen] = useState(false);
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);

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
  );

  const {
    itemsToDelete,
    onConfirm,
    dedicatedAction,
    isModalOpen,
    handleModalToggle,
  } = useDeleteSystems(itemsData, reload, resetSelection, selected);

  return (
    <>
      {addHostGroupModalOpen && (
        <AddSelectedHostsToGroupModal
          isModalOpen={addHostGroupModalOpen}
          setIsModalOpen={setAddHostGroupModalOpen}
          modalState={selectedItems}
          reloadData={() => reloadData()}
        />
      )}
      {removeHostsFromGroupModalOpen && (
        <RemoveHostsFromGroupModal
          isModalOpen={removeHostsFromGroupModalOpen}
          setIsModalOpen={setRemoveHostsFromGroupModalOpen}
          modalState={selectedItems}
          reloadData={() => reloadData()}
        />
      )}
      {isModalOpen && (
        <DeleteModal
          className="sentry-mask data-hj-suppress"
          handleModalToggle={handleModalToggle}
          isModalOpen={isModalOpen}
          currentSystems={itemsToDelete}
          onConfirm={onConfirm}
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
          ...options,
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
