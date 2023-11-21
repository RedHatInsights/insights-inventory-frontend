import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { TableVariant } from '@patternfly/react-table';
import { InventoryTable } from '../InventoryTable';
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
  tableActions,
  onRefresh,
  actionsConfig,
  ...props
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

  const onRowClick = (_key, systemId) => {
    navigate(`/insights/inventory/${systemId}?appName=vulnerabilities`);
  };

  return (
    <InventoryTable
      initialLoading
      disableDefaultColumns
      onLoad={onLoad}
      hideFilters={hideFilters}
      tableProps={{
        actionResolver: tableActions,
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
      onRowClick={onRowClick}
      showTags
      onRefresh={onRefresh}
      actionsConfig={actionsConfig}
      {...props}
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
  onRefresh: propTypes.func,
  actionsConfig: propTypes.object,
  tableActions: propTypes.array,
};

export default ImmutableDevices;
