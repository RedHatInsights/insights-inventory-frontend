import propTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { TableVariant } from '@patternfly/react-table';
import { InventoryTable } from '@redhat-cloud-services/frontend-components/Inventory';
import Status from './Status';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import { getDeviceStatus } from './helpers';

const edgeColumns = [
  {
    key: 'ImageName',
    title: 'Image',
    sort: false,
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
}) => {
  const dispatch = useDispatch();
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

  return (
    <InventoryTable
      disableDefaultColumns
      onLoad={onLoad}
      hideFilters={{
        all: true,
        name: false,
        operatingSystem: false,
        hostGroupFilter: false,
      }}
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
  mergeAppColumns: propTypes.func,
};

export default ImmutableDevices;
