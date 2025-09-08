import React from 'react';
import PropTypes from 'prop-types';
import {
  TableToolsTable,
  TableStateProvider,
  useItemsData,
  useFullTableState,
  useStateCallbacks,
} from 'bastilian-tabletools';

import filters, { CUSTOM_FILTER_TYPES } from './filters';
import { fetchSystems, resolveColumns } from '../../helpers.js';
import { DEFAULT_OPTIONS } from './constants';
import useGlobalFilterForItems from './hooks/useGlobalFilterForItems';
import DeleteModal from '../../../../Utilities/DeleteModal';
import useDeleteSystems from '../../hooks/useDeleteSystems';

// TODO Filters should be customisable enable/disable, extend, etc.
// TODO "global filter" needs to be integrated
const SystemsTable = ({
  items: itemsProp = fetchSystems,
  columns = [],
  options = {},
}) => {
  const items = useGlobalFilterForItems(itemsProp);
  const { items: itemsData } = useItemsData();
  const tableState = useFullTableState();
  const { current: { reload, resetSelection } = {} } = useStateCallbacks();
  const { tableState: { selected } = {} } = tableState || {};

  const {
    itemsToDelete,
    onConfirm,
    dedicatedAction,
    isModalOpen,
    handleModalToggle,
  } = useDeleteSystems(itemsData, reload, resetSelection, selected);

  return (
    <>
      <DeleteModal
        className="sentry-mask data-hj-suppress"
        handleModalToggle={handleModalToggle}
        isModalOpen={isModalOpen}
        currentSystems={itemsToDelete}
        onConfirm={onConfirm}
      />
      <TableToolsTable
        variant="compact"
        items={items}
        columns={resolveColumns(columns)}
        filters={{
          customFilterTypes: CUSTOM_FILTER_TYPES,
          filterConfig: filters,
        }}
        options={{
          ...DEFAULT_OPTIONS,
          dedicatedAction,
          ...options,
        }}
      />
    </>
  );
};

SystemsTable.propTypes = {
  items: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  columns: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  options: PropTypes.object,
};

const SystemsTableWithProvider = (props) => (
  <TableStateProvider>
    <SystemsTable {...props} />
  </TableStateProvider>
);

export default SystemsTableWithProvider;
