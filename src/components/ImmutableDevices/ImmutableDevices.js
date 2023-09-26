import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import { TableVariant } from '@patternfly/react-table';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import useFeatureFlag from '../../Utilities/useFeatureFlag';

const ImmutableDevices = ({
  inventoryRef,
  columns,
  customFilters,
  onLoad,
  getEntities,
}) => {
  const dispatch = useDispatch();
  const inventoryGroupsEnabled = useFeatureFlag('hbi.ui.inventory-groups');

  const totalItems = useSelector(({ entities }) => entities?.total);

  const filteredColumns = columns.filter(
    (column) => !column.inventoryGroupsFeatureFlag || inventoryGroupsEnabled
  );

  useEffect(() => {
    return () => {
      dispatch({
        type: 'CLEAR_INVENTORY_STORE',
        payload: [],
      });
    };
  }, [dispatch]);

  const [columnCounter, setColumnCount] = useState(0);
  useEffect(() => setColumnCount(columnCounter + 1), [columns]);

  const mergeColumns = (inventoryColumns) => {
    return filteredColumns
      .filter((column) => column.isShown ?? column.isShownByDefault)
      .map((column) => ({
        ...inventoryColumns.find(({ key }) => column.key === key),
        ...column,
      }));
  };

  return (
    <InventoryTable
      disableDefaultColumns
      onLoad={onLoad}
      tableProps={{
        isStickyHeader: true,
        variant: TableVariant.compact,
      }}
      paginationProps={{
        isDisabled: !totalItems,
      }}
      showTagModal
      isFullView
      ref={inventoryRef}
      autoRefresh
      key="inventory"
      customFilters={customFilters}
      columnsCounter={columnCounter}
      columns={(defaultColumns) => mergeColumns(defaultColumns)}
      getEntities={getEntities}
    />
  );
};

ImmutableDevices.propTypes = {
  inventoryRef: propTypes.oneOfType([
    propTypes.func,
    propTypes.shape({ current: propTypes.any }),
  ]),
  columns: propTypes.array,
  customFilters: propTypes.object,
  onLoad: propTypes.func,
  getEntities: propTypes.func,
};

export default ImmutableDevices;
