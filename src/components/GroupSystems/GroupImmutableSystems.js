import { TableVariant } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectEntity } from '../../store/inventory-actions';
import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import InventoryTable from '../InventoryTable/InventoryTable';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import RemoveHostsFromGroupModal from '../InventoryGroups/Modals/RemoveHostsFromGroupModal';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  NO_MODIFY_GROUP_TOOLTIP_MESSAGE,
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
} from '../../constants';
import {
  ActionButton,
  ActionDropdownItem,
} from '../InventoryTable/ActionWithRBAC';
import { clearEntitiesAction } from '../../store/actions';
import { useBulkSelectConfig } from '../../Utilities/hooks/useBulkSelectConfig';
import difference from 'lodash/difference';
import map from 'lodash/map';
import { useGetInventoryGroupUpdateInfo } from '../../api/edge/imagesInfo';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';
import { getNotificationProp } from '../../Utilities/edge';
import { edgeColumns } from '../ImmutableDevices/columns';
import { useGetImageData } from '../../api';
import { mergeArraysByKey } from '@redhat-cloud-services/frontend-components-utilities/helpers';
export const prepareColumns = (
  initialColumns,
  hideGroupColumn,
  openTabOnClick = false
) => {
  // hides the "groups" column
  const columns = hideGroupColumn
    ? initialColumns.filter(({ key }) => key !== 'groups')
    : initialColumns;
  columns[columns.findIndex(({ key }) => key === 'display_name')].renderFunc = (
    value,
    hostId
  ) => (
    <div className="sentry-mask data-hj-suppress">
      <Link
        to={`../${hostId}`}
        {...(openTabOnClick ? { target: '_blank' } : {})}
      >
        {value}
      </Link>
    </div>
  );

  // map columns to the speicifc order
  return [
    'display_name',
    'groups',
    'tags',
    'system_profile',
    'update_method',
    'updated',
    'image',
    'status',
  ]
    .map((colKey) => columns.find(({ key }) => key === colKey))
    .filter(Boolean); // eliminate possible undefined's
};

const GroupImmutableSystems = ({ groupName, groupId, ...props }) => {
  const dispatch = useDispatch();
  const fetchImagesData = useGetImageData();
  const mergeColumns = (inventoryColumns) => {
    const filteredColumns = inventoryColumns.filter(
      (column) => column.key !== 'groups'
    );
    inventoryColumns[inventoryColumns.findIndex(({ key }) => console.log(key))];
    return [...filteredColumns, ...edgeColumns];
  };

  const navigate = useNavigate();
  const canUpdateSelectedDevices = (deviceIds, imageSets) =>
    deviceIds?.length > 0 && imageSets?.length == 1 ? true : false;
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [currentSystem, setCurrentSystem] = useState([]);
  const inventory = useRef(null);

  const selected = useSelector(
    (state) => state?.entities?.selected || new Map()
  );

  let rows = useSelector(({ entities }) => entities?.rows || []);

  const total = useSelector(({ entities }) => entities?.total);
  const displayedIds = map(rows, 'id');
  const pageSelected =
    difference(displayedIds, [...selected.keys()]).length === 0;

  const [addToGroupModalOpen, setAddToGroupModalOpen] = useState(false);
  const [updateDevice, setupdateDevice] = useState(false);
  const { hasAccess: canModify } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId)
  );

  const getUpdateInfo = useGetInventoryGroupUpdateInfo();
  const [deviceData, setDeviceData] = useState();
  const [deviceImageSet, setDeviceImageSet] = useState();
  const [updateModal, setUpdateModal] = useState({
    isOpen: false,
    deviceData: null,
    imageData: null,
  });

  const notificationProp = getNotificationProp(dispatch);

  const customGetEntities = async (
    _items,
    config,
    showTags,
    defaultGetEntities
  ) => {
    const enhancedConfig = {
      ...config,
      filters: {
        ...config.filters,
        hostGroupFilter: [groupName],
        hostTypeFilter: 'edge',
      },
      hasItems: false,
    };
    const defaultData = await defaultGetEntities(
      items,
      enhancedConfig,
      showTags
    );
    let mapDeviceIds = [];
    defaultData.results.forEach((data) => {
      mapDeviceIds.push(data.id);
    });
    const updateInfo = await getUpdateInfo(groupId);
    setDeviceData(updateInfo?.update_devices_uuids);
    setDeviceImageSet(updateInfo?.device_image_set_info);
    const rowInfo = [];
    let items = [];
    if (defaultData.total > 0) {
      const customResult = await fetchImagesData({
        devices_uuid: mapDeviceIds,
      });
      customResult?.data?.devices.forEach((row) => {
        rowInfo.push({ ...row, id: row.DeviceUUID });
      });
      items = rowInfo.map(({ id }) => id);

      return {
        results: mergeArraysByKey([defaultData.results, rowInfo]),
        total: customResult?.data?.total,
      };
    } else {
      return {
        results: mergeArraysByKey([defaultData.results]),
        total: 0,
      };
    }
    // }
  };

  useEffect(() => {
    return () => {
      dispatch(clearEntitiesAction());
    };
  }, []);

  const calculateSelected = () => (selected ? selected.size : 0);

  //enable/disable update button
  const [canUpdate, setCanUpdate] = useState(false);
  const [updateImageSet, setUpdateImageSet] = useState();
  const handleUpdateSelected = () => {
    setUpdateModal((prevState) => ({
      ...prevState,
      deviceData: [...selected.keys()].map((device) => ({
        id: device,
      })),
      imageSetId: updateImageSet,
      isOpen: true,
    }));
  };

  let imageSet = [];
  let deviceIds = [];
  const bulkSelectConfig = useBulkSelectConfig(
    selected,
    null,
    total,
    rows,
    true,
    pageSelected,
    groupName
  );

  //enable disable bulk update based on selection, must refactor
  useEffect(() => {
    if (selected.size > 0) {
      return () => {
        [...selected.keys()].map((s) => {
          const img = deviceImageSet[s];
          if (!imageSet.includes(img)) {
            imageSet.push(img);
          }
          deviceIds.push(s);
        });
        setCanUpdate(canUpdateSelectedDevices(deviceIds, imageSet));
        setUpdateImageSet(imageSet);
      };
    }
  }, [deviceData, selected]);
  return (
    <div id="group-systems-table">
      {addToGroupModalOpen && (
        <AddSystemsToGroupModal
          isModalOpen={addToGroupModalOpen}
          setIsModalOpen={(value) => {
            dispatch(clearEntitiesAction());
            setAddToGroupModalOpen(value);
          }}
          groupId={groupId}
          groupName={groupName}
        />
      )}
      {removeHostsFromGroupModalOpen && (
        <RemoveHostsFromGroupModal
          isModalOpen={removeHostsFromGroupModalOpen}
          setIsModalOpen={setRemoveHostsFromGroupModalOpen}
          modalState={currentSystem}
          reloadTimeout={1000}
          reloadData={() => {
            if (calculateSelected() > 0) {
              dispatch(selectEntity(-1, false));
            }

            inventory.current.onRefreshData({}, false, true);
          }}
        />
      )}
      {updateDevice && (
        <AsyncComponent
          appName="edge"
          module="./UpdateDeviceModal"
          navigateProp={useNavigate}
          locationProp={useLocation}
          notificationProp={notificationProp}
          paramsProp={useParams}
          updateModal={updateModal}
          setUpdateModal={setUpdateModal}
          refreshTable={() => true}
        />
      )}
      {!addToGroupModalOpen && (
        <InventoryTable
          columns={(columns) => mergeColumns(prepareColumns(columns))}
          hideFilters={{ hostGroupFilter: true }}
          // getEntities={entities}
          getEntities={customGetEntities}
          tableProps={{
            isStickyHeader: true,
            variant: TableVariant.compact,
            canSelectAll: true,
            actionResolver: (row) => [
              {
                title: (
                  <ActionDropdownItem
                    requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                      groupId
                    )}
                    noAccessTooltip={NO_MODIFY_GROUP_TOOLTIP_MESSAGE}
                    onClick={() => {
                      setCurrentSystem([row]);
                      setRemoveHostsFromGroupModalOpen(true);
                    }}
                  >
                    Remove from group
                  </ActionDropdownItem>
                ),
                style: {
                  padding: 0, // custom component creates extra padding space
                },
              },
              {
                title: (
                  <ActionDropdownItem
                    isAriaDisabled={
                      deviceData && !deviceData.find((obj) => obj === row.id)
                    }
                    requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                      groupId
                    )}
                    noAccessTooltip={NO_MODIFY_GROUP_TOOLTIP_MESSAGE}
                    onClick={() => {
                      setCurrentSystem([row]);
                      navigate(`/insights/inventory/${row.id}/update`);
                    }}
                  >
                    Update
                  </ActionDropdownItem>
                ),
                style: {
                  padding: 0, // custom component creates extra padding space
                },
              },
            ],
          }}
          actionsConfig={{
            actions: [
              [
                <div key="primary-actions" className="pf-c-action-list">
                  <ActionButton
                    key="add-systems-button"
                    requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                      groupId
                    )}
                    noAccessTooltip={NO_MODIFY_GROUP_TOOLTIP_MESSAGE}
                    onClick={() => {
                      dispatch(clearEntitiesAction());
                      setAddToGroupModalOpen(true);
                    }}
                    ouiaId="add-systems-button"
                  >
                    Add systems
                  </ActionButton>
                  <ActionButton
                    requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                      groupId
                    )}
                    noAccessTooltip={NO_MODIFY_GROUP_TOOLTIP_MESSAGE}
                    key="update-systems-button"
                    onClick={() => {
                      setupdateDevice(true);
                      handleUpdateSelected();
                    }}
                    ouiaId="update-systems-button"
                    isAriaDisabled={!canUpdate}
                  >
                    Update
                  </ActionButton>
                </div>,
              ],
              {
                label: 'Remove from group',
                props: {
                  isAriaDisabled: !canModify || calculateSelected() === 0,
                  ...(!canModify && {
                    tooltip: NO_MODIFY_GROUP_TOOLTIP_MESSAGE,
                  }),
                },
                onClick: () => {
                  setCurrentSystem(Array.from(selected.values()));
                  setRemoveHostsFromGroupModalOpen(true);
                },
              },
            ],
          }}
          bulkSelect={bulkSelectConfig}
          showTags
          ref={inventory}
          showCentosVersions
          {...props}
        />
      )}
    </div>
  );
};

GroupImmutableSystems.propTypes = {
  groupName: PropTypes.string.isRequired,
  groupId: PropTypes.string.isRequired,
};

export default GroupImmutableSystems;
