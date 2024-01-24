/* eslint-disable rulesdir/disallow-fec-relative-imports */
import {
  Breadcrumb,
  BreadcrumbItem,
  Flex,
  FlexItem,
  Skeleton,
} from '@patternfly/react-core';
import {
  Dropdown,
  DropdownItem,
  DropdownToggle,
} from '@patternfly/react-core/deprecated';
import {
  PageHeader,
  PageHeaderTitle,
} from '@redhat-cloud-services/frontend-components';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import DeleteGroupModal from '../InventoryGroups/Modals/DeleteGroupModal';
import RenameGroupModal from '../InventoryGroups/Modals/RenameGroupModal';
import { fetchGroupDetail } from '../../store/inventory-actions';
import { usePermissionsWithContext } from '@redhat-cloud-services/frontend-components-utilities/RBACHook';
import {
  REQUIRED_PERMISSIONS_TO_MODIFY_GROUP,
  REQUIRED_PERMISSIONS_TO_READ_GROUP,
} from '../../constants';
import useInsightsNavigate from '@redhat-cloud-services/frontend-components-utilities/useInsightsNavigate/useInsightsNavigate';
import useFeatureFlag from '../../Utilities/useFeatureFlag';
import EdgeUpdateDeviceModal from './EdgeUpdateDeviceModal';
import { getInventoryGroupDevicesUpdateInfo } from '../../api/edge/updates';

const GroupDetailHeader = ({ groupId }) => {
  const dispatch = useDispatch();
  const navigate = useInsightsNavigate();
  const { uninitialized, loading, data } = useSelector(
    (state) => state.groupDetail
  );

  const { hasAccess: canRead } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_READ_GROUP(groupId)
  );

  const { hasAccess: canModify } = usePermissionsWithContext(
    REQUIRED_PERMISSIONS_TO_MODIFY_GROUP(groupId)
  );

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [edgeUpdateModal, setEdgeUpdateModal] = useState({
    deviceData: [],
    isOpen: false,
  });
  const [edgeDeviceUpdateInfo, setEdgeDeviceUpdateInfo] = useState(null);

  const isEdgeParityGroupsEnabled = useFeatureFlag(
    'edgeParity.inventory-groups-enabled'
  );

  useEffect(() => {
    if (isEdgeParityGroupsEnabled) {
      (async () => {
        try {
          const groupEdgeDevicesUpdateInfo =
            await getInventoryGroupDevicesUpdateInfo(groupId);
          setEdgeDeviceUpdateInfo(groupEdgeDevicesUpdateInfo);
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }, [edgeUpdateModal]);

  const name = data?.results?.[0]?.name;

  const getTitle = () => {
    if (canRead) {
      if (uninitialized || loading) {
        return (
          <Skeleton width="250px" screenreaderText="Loading group details" />
        );
      } else {
        return name || groupId; // in case of error, render just id from URL
      }
    }

    return groupId;
  };

  let dropdownItems = [
    <DropdownItem key="rename-group" onClick={() => setRenameModalOpen(true)}>
      Rename
    </DropdownItem>,
    <DropdownItem key="delete-group" onClick={() => setDeleteModalOpen(true)}>
      Delete
    </DropdownItem>,
  ];

  if (isEdgeParityGroupsEnabled) {
    dropdownItems.push(
      <DropdownItem
        key="update-edge-devices"
        onClick={() => setEdgeUpdateModal({ deviceData: [], isOpen: true })}
        isDisabled={!edgeDeviceUpdateInfo?.update_valid}
      >
        Update
      </DropdownItem>
    );
  }

  return (
    <PageHeader>
      {renameModalOpen && (
        <RenameGroupModal
          isModalOpen={renameModalOpen}
          setIsModalOpen={() => setRenameModalOpen(false)}
          modalState={{
            id: groupId,
            name: canRead ? name || groupId : groupId,
          }}
          reloadData={() => dispatch(fetchGroupDetail(groupId))}
        />
      )}
      {deleteModalOpen && (
        <DeleteGroupModal
          isModalOpen={deleteModalOpen}
          setIsModalOpen={() => setDeleteModalOpen(false)}
          reloadData={() => navigate('/groups')}
          groupIds={[groupId]}
        />
      )}
      {edgeUpdateModal.isOpen && (
        <EdgeUpdateDeviceModal
          inventoryGroupUpdateDevicesInfo={edgeDeviceUpdateInfo}
          updateModal={edgeUpdateModal}
          setUpdateModal={setEdgeUpdateModal}
        />
      )}
      <Breadcrumb>
        <BreadcrumbItem>
          <Link to="../groups">Groups</Link>
        </BreadcrumbItem>
        <BreadcrumbItem isActive>{getTitle()}</BreadcrumbItem>
      </Breadcrumb>
      <Flex
        id="group-header"
        justifyContent={{ default: 'justifyContentSpaceBetween' }}
      >
        <FlexItem>
          <PageHeaderTitle title={getTitle()} />
        </FlexItem>
        <FlexItem id="group-header-dropdown">
          <Dropdown
            onSelect={() => setDropdownOpen(!dropdownOpen)}
            autoFocus={false}
            isOpen={dropdownOpen}
            toggle={
              <DropdownToggle
                id="group-dropdown-toggle"
                onToggle={(_event, isOpen) => setDropdownOpen(isOpen)}
                toggleVariant="secondary"
                isDisabled={!canModify || uninitialized || loading}
                ouiaId="group-actions-dropdown-toggle"
              >
                Group actions
              </DropdownToggle>
            }
            dropdownItems={dropdownItems}
          />
        </FlexItem>
      </Flex>
    </PageHeader>
  );
};

GroupDetailHeader.propTypes = {
  groupId: PropTypes.string.isRequired,
};

export default GroupDetailHeader;
