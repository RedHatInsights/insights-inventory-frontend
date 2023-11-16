import { TableVariant, fitContent } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectEntity } from '../../store/inventory-actions';
import AddSystemsToGroupModal from '../InventoryGroups/Modals/AddSystemsToGroupModal';
import InventoryTable from '../InventoryTable/InventoryTable';
import { Link, useNavigate } from 'react-router-dom';
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
import {
  // useGetDevice,
  useGetInventoryGroupUpdateInfo,
} from '../../api/edge/imagesInfo';
export const prepareColumns = (
  initialColumns,
  hideGroupColumn,
  openTabOnClick = false
) => {
  // hides the "groups" column
  const columns = hideGroupColumn
    ? initialColumns.filter(({ key }) => key !== 'groups')
    : initialColumns;

  // additionally insert the "update method" column
  columns.splice(columns.length - 2 /* must be the 3rd col from the end */, 0, {
    key: 'update_method',
    title: 'Update method',
    sortKey: 'update_method',
    transforms: [fitContent],
    renderFunc: (value, hostId, systemData) =>
      systemData?.system_profile?.system_update_method || 'N/A',
    props: {
      // TODO: remove isStatic when the sorting is supported by API
      isStatic: true,
      width: 10,
    },
  });

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
  ]
    .map((colKey) => columns.find(({ key }) => key === colKey))
    .filter(Boolean); // eliminate possible undefined's
};
let data = [];

const GroupImmutableSystems = ({ groupName, groupId }) => {
  const navigate = useNavigate();
  const canUpdateSelectedDevices = (deviceIds, imageSets) =>
    deviceIds?.length > 0 && imageSets?.length == 1 ? true : false;
  const [deviceIds, setDeviceIds] = useState([]);
  const dispatch = useDispatch();
  const [removeHostsFromGroupModalOpen, setRemoveHostsFromGroupModalOpen] =
    useState(false);
  const [currentSystem, setCurrentSystem] = useState([]);
  const inventory = useRef(null);

  const selected = useSelector(
    (state) => state?.entities?.selected || new Map()
  );
  const rows = useSelector(({ entities }) => entities?.rows || []);
  const total = useSelector(({ entities }) => entities?.total);
  const displayedIds = map(rows, 'id');
  const pageSelected =
    difference(displayedIds, [...selected.keys()]).length === 0;

  const [addToGroupModalOpen, setAddToGroupModalOpen] = useState(false);

  const { hasAccess: canModify } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId)
  );

  // const getDevice = useGetDevice();
  const getUpdateInfo = useGetInventoryGroupUpdateInfo();
  const [deviceData, setDeviceData] = useState();

  useEffect(() => {
    (async () => {
      const updateInfo = await getUpdateInfo(groupId);
      setDeviceData(updateInfo?.update_devices_uuids);
    })();
  }, [rows]);

  useEffect(() => {
    return () => {
      dispatch(clearEntitiesAction());
    };
  }, []);

  const calculateSelected = () => (selected ? selected.size : 0);

  //enable/disable update button
  const [imageSet, setImageSet] = useState([]);

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
      setImageSet([]);
      setDeviceIds([]);
      return () => {
        [...selected.keys()].map((s) => {
          const img = data.find((obj) => obj.device_id === s)?.imageData;

          if (imageSet && !imageSet.includes(img)) {
            setImageSet((imageSet) => [...imageSet, img]);
          }
          setDeviceIds((deviceIds) => [...deviceIds, s]);
        });
        console.log(imageSet);
        console.log(canUpdateSelectedDevices(deviceIds, imageSet));
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
      {!addToGroupModalOpen && (
        <InventoryTable
          columns={(columns) => prepareColumns(columns, true)}
          hideFilters={{ hostGroupFilter: true }}
          getEntities={async (items, config, showTags, defaultGetEntities) =>
            await defaultGetEntities(
              items,
              // filter systems by the group name
              {
                ...config,
                filters: {
                  ...config.filters,
                  hostGroupFilter: [groupName],
                  hostTypeFilter: 'edge',
                },
              },
              showTags
            )
          }
          tableProps={{
            isStickyHeader: true,
            variant: TableVariant.compact,
            canSelectAll: false,
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
                    isAriaDisabled={!deviceData.find((obj) => obj === row.id)}
                    requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                      groupId
                    )}
                    noAccessTooltip={NO_MODIFY_GROUP_TOOLTIP_MESSAGE}
                    onClick={() => {
                      setCurrentSystem([row]);
                      navigate(`/insights/inventory/${row.id}/update`);
                      // useNavigate({
                      //   // pathname: `${location.pathname}/update`,
                      //   pathname: `/insights/inventory/${row.id}/update`,
                      //   search: '?from_details=true',
                      // });
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
                </ActionButton>,
                <ActionButton
                  requiredPermissions={REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(
                    groupId
                  )}
                  noAccessTooltip={NO_MODIFY_GROUP_TOOLTIP_MESSAGE}
                  key="update-systems-button"
                  onClick={() => {
                    console.log('Call update');
                  }}
                  ouiaId="update-systems-button"
                  isAriaDisabled={
                    !canUpdateSelectedDevices(deviceIds, imageSet)
                  }
                >
                  Update
                </ActionButton>,
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
