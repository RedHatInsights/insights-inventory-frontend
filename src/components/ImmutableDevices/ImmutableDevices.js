import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { TableVariant } from '@patternfly/react-table';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { useNavigate } from 'react-router-dom';
import { edgeColumns } from './columns';

const ImmutableDevices = ({
  inventoryRef,
  customFilters,
  onLoad,
  getEntities,
  mergeAppColumns,
  filterConfig,
  hideFilters,
  activeFiltersConfig,
  onRowClick,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const inventoryGroupsEnabled = useFeatureFlag('hbi.ui.inventory-groups');

  const totalItems = useSelector(({ entities }) => entities?.total);

  useEffect(() => {
    return () => {
      dispatch({
        type: 'CLEAR_INVENTORY_STORE',
        payload: [],
      });
    };
  }, [dispatch]);

  const mergeColumns = (inventoryColumns) => {
    const filteredColumns = inventoryColumns.filter(
      (column) => !column.inventoryGroupsFeatureFlag || inventoryGroupsEnabled
    );

    return [...mergeAppColumns(filteredColumns), ...edgeColumns];
  };

  const defaultOnRowClick = (_key, systemId) => {
    navigate(`/insights/inventory/${systemId}`);
  };

  return (
    <InventoryTable
      disableDefaultColumns
      onLoad={onLoad}
      hideFilters={hideFilters}
      tableProps={{
        isStickyHeader: true,
        variant: TableVariant.compact,
      }}
      paginationProps={{
        isDisabled: !totalItems,
      }}
      showTagModal
      hasCheckbox={false}
      isFullView
      ref={inventoryRef}
      autoRefresh
      key="inventory"
      customFilters={customFilters}
      columns={(defaultColumns) => mergeColumns(defaultColumns)}
      getEntities={getEntities}
      filterConfig={filterConfig}
      activeFiltersConfig={activeFiltersConfig}
      onRowClick={onRowClick || defaultOnRowClick}
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
  mergeAppColumns: propTypes.func,
  filterConfig: propTypes.object,
  hideFilters: propTypes.object,
  activeFiltersConfig: propTypes.object,
  onRowClick: propTypes.func,
};

export default ImmutableDevices;
