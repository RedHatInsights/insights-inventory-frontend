import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { TableVariant } from '@patternfly/react-table';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import Status from './Status';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { getDeviceStatus } from './helpers';
import { useNavigate } from 'react-router-dom';

const edgeColumns = [
  {
    key: 'ImageName',
    title: 'Image',
    sort: false,
    renderFunc: (imageName, uuid) => {
      return <a href={`/edge/inventory/${uuid}`}>{imageName}</a>;
    },
    props: { isStatic: true },
  },
  {
    key: 'Status',
    title: 'Status',
    sort: false,
    renderFunc: (
      StatusText,
      DEVICE_ID,
      { UpdateAvailable, DispatcherStatus }
    ) => {
      const deviceStatus = getDeviceStatus(
        StatusText,
        UpdateAvailable,
        DispatcherStatus
      );

      return deviceStatus === 'error' || deviceStatus === 'unresponsive' ? (
        <Status
          type={
            deviceStatus === 'error'
              ? 'errorWithExclamationCircle'
              : deviceStatus
          }
          isLink={true}
        />
      ) : (
        <Status
          type={
            deviceStatus === 'error'
              ? 'errorWithExclamationCircle'
              : deviceStatus
          }
        />
      );
    },
  },
];

const ImmutableDevices = ({
  inventoryRef,
  customFilters,
  onLoad,
  getEntities,
  mergeAppColumns,
  filterConfig,
  hideFilters,
  activeFiltersConfig,
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
      onRowClick={onRowClick}
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
};

export default ImmutableDevices;
