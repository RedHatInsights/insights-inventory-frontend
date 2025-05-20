import { TableVariant } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import InventoryTable from '../InventoryTable/InventoryTable';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import RemoveHostsFromGroupModal from '../InventoryGroups/Modals/RemoveHostsFromGroupModal';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE,
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
import {
  edgeImageDataResult,
  enhancedEdgeConfig,
  getNotificationProp,
  mapDefaultData,
} from '../../Utilities/edge';
import { edgeColumns } from '../ImmutableDevices/columns';
import { mergeArraysByKey } from '@redhat-cloud-services/frontend-components-utilities/helpers';
import { hybridInventoryTabKeys } from '../../Utilities/constants';
import { prepareColumnsImmutable as prepareColumns } from './helpers';

const GroupImmutableSystems = ({ groupName, groupId, ...props }) => {
  const dispatch = useDispatch();
  const noAccessTooltip = NO_MODIFY_WORKSPACE_TOOLTIP_MESSAGE;
  const removeLabel = 'Remove from workspace';
  const mergeColumns = (inventoryColumns) => {
    const filteredColumns = inventoryColumns.filter(
      (column) => column.key !== 'groups',
    );
    return [...filteredColumns, ...edgeColumns];
  };

  const navigate = useNavigate();
  const canUpdateSelectedDevices = (deviceIds, imageSets, updatableDeviceIds) =>
    deviceIds?.length > 0 &&
    imageSets?.length === 1 &&
    updatableDeviceIds?.length > 0 &&
    // all deviceIds must be in updatableDeviceIds
    deviceIds.filter((s) => updatableDeviceIds.includes(s)).length ===
      deviceIds.length;

  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [currentSystem, setCurrentSystem] = useState([]);
  const inventory = useRef(null);

  const selected = useSelector(
    (state) => state?.entities?.selected || new Map(),
  );

  let rows = useSelector(({ entities }) => entities?.rows || []);

  const total = useSelector(({ entities }) => entities?.total);
  const displayedIds = map(rows, 'id');
  const pageSelected =
    difference(displayedIds, [...selected.keys()]).length === 0;

  const [addToGroupModalOpen, setAddToGroupModalOpen] = useState(false);
  const [updateDevice, setupdateDevice] = useState(false);
  const { hasAccess: canModify } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId),
  );

  const getUpdateInfo = useGetInventoryGroupUpdateInfo();
  const [deviceData, setDeviceData] = useState(null);
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
    defaultGetEntities,
  ) => {
    const enhancedConfig = enhancedEdgeConfig(groupName.toString(), config);
    const defaultData = await defaultGetEntities(
      null,
      enhancedConfig,
      showTags,
    );
    const mapDeviceIds = mapDefaultData(defaultData.results);
    const updateInfo = await getUpdateInfo(groupId);
    setDeviceData(updateInfo?.update_devices_uuids || []);
    setDeviceImageSet(updateInfo?.device_image_set_info);
    const rowInfo = [];
    if (defaultData.total > 0) {
      const customResult = await edgeImageDataResult(mapDeviceIds.mapDeviceIds);
      customResult?.data?.devices.forEach((row) => {
        rowInfo.push({ ...row, id: row.DeviceUUID });
      });

      return {
        results: mergeArraysByKey([defaultData.results, rowInfo]),
        total: customResult?.data?.total,
      };
    } else {
      return {
        results: mergeArraysByKey([]),
        total: 0,
      };
    }
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
  const bulkSelectConfig = useBulkSelectConfig(
    selected,
    null,
    total,
    rows,
    true,
    pageSelected,
    groupName,
  );

  useEffect(() => {
    if (selected.size > 0 && Object.keys(deviceImageSet || {}).length > 0) {
      let imageSet = [];
      let deviceIds = [];
      [...selected.keys()].map((s) => {
        const img = deviceImageSet[s];

        if (!imageSet.includes(img)) {
          imageSet.push(img);
        }
        deviceIds.push(s);
      });
      setCanUpdate(canUpdateSelectedDevices(deviceIds, imageSet, deviceData));
      setUpdateImageSet(imageSet);
    } else {
      setCanUpdate(false);
    }
  }, [deviceData, selected, deviceImageSet]);

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
          edgeParityIsAllowed={true}
          activeTab={hybridInventoryTabKeys.immutable.key}
        />
      )}
      {removeHostsFromGroupModalOpen && (
        <RemoveHostsFromGroupModal
          isModalOpen={removeHostsFromGroupModalOpen}
          setIsModalOpen={setRemoveHostsFromGroupModalOpen}
          modalState={currentSystem}
        />
      )}
      {updateDevice && (
        <AsyncComponent
          scope="edge"
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
          getEntities={customGetEntities}
          tableProps={{
            isStickyHeader: true,
            variant: TableVariant.compact,
            canSelectAll: false,
            actionResolver: (row) => [
              {
                title: (
                  <ActionDropdownItem
                    requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                      groupId,
                    )}
                    noAccessTooltip={noAccessTooltip}
                    onClick={() => {
                      setCurrentSystem([row]);
                      setRemoveHostsFromGroupModalOpen(true);
                    }}
                  >
                    {removeLabel}
                  </ActionDropdownItem>
                ),
              },
              {
                title: (
                  <ActionDropdownItem
                    isAriaDisabled={
                      deviceData === null || !deviceData.includes(row.id)
                    }
                    requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                      groupId,
                    )}
                    noAccessTooltip={noAccessTooltip}
                    onClick={() => {
                      setCurrentSystem([row]);
                      navigate(`/insights/inventory/${row.id}/update`);
                    }}
                  >
                    Update
                  </ActionDropdownItem>
                ),
              },
            ],
          }}
          actionsConfig={{
            actions: [
              [
                <div key="primary-actions" className="pf-v5-c-action-list">
                  <ActionButton
                    key="add-systems-button"
                    requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                      groupId,
                    )}
                    noAccessTooltip={noAccessTooltip}
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
                      groupId,
                    )}
                    noAccessTooltip={noAccessTooltip}
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
                label: removeLabel,
                props: {
                  isAriaDisabled: !canModify || calculateSelected() === 0,
                  ...(!canModify && {
                    tooltipProps: {
                      content: noAccessTooltip,
                    },
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
