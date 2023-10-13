import { Alert, Button, Flex, FlexItem, Modal } from '@patternfly/react-core';
import { TableVariant } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearFilters,
  fetchGroupDetail,
  selectEntity,
} from '../../../store/inventory-actions';
import { prepareColumns } from '../../GroupSystems/GroupSystems';
import InventoryTable from '../../InventoryTable/InventoryTable';
import { addHostsToGroupById } from '../utils/api';
import apiWithToast from '../utils/apiWithToast';
import ConfirmSystemsAddModal from './ConfirmSystemsAddModal';
import { useBulkSelectConfig } from '../../../Utilities/hooks/useBulkSelectConfig';
import difference from 'lodash/difference';
import map from 'lodash/map';

const AddSystemsToGroupModal = ({
  isModalOpen,
  setIsModalOpen,
  groupId,
  groupName,
}) => {
  const dispatch = useDispatch();

  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [systemsSelectModalOpen, setSystemSelectModalOpen] = useState(true);
  const selected = useSelector(
    (state) => state?.entities?.selected || new Map()
  );
  const rows = useSelector(({ entities }) => entities?.rows || []);

  const noneSelected = selected.size === 0;
  const total = useSelector(({ entities }) => entities?.total);
  const displayedIds = map(rows, 'id');
  const pageSelected =
    difference(displayedIds, selected ? [...selected.keys()] : []).length === 0;
  const bulkSelectConfig = useBulkSelectConfig(
    selected,
    null,
    total,
    rows,
    true,
    pageSelected
  );

  const alreadyHasGroup = [...selected].filter(
    // eslint-disable-next-line camelcase
    (entry) => {
      return (
        entry[1]?.groups?.[0]?.name !== undefined &&
        entry[1]?.groups?.[0]?.name !== ''
      );
    }
  );
  const showWarning = alreadyHasGroup.length > 0;

  const handleSystemAddition = useCallback(
    (hostIds) => {
      const statusMessages = {
        onSuccess: {
          title: 'Success',
          description: `${hostIds.length > 1 ? 'Systems' : 'System'} added to ${
            groupName || groupId
          }`,
        },
        onError: {
          title: 'Error',
          description: `Failed to add ${
            hostIds.length > 1 ? 'systems' : 'system'
          } to ${groupName || groupId}`,
        },
      };
      return apiWithToast(
        dispatch,
        () => addHostsToGroupById(groupId, hostIds),
        statusMessages
      );
    },
    [isModalOpen]
  );

  const calculateSelected = () => (selected ? selected.size : 0);

  const handleModalClose = () => {
    setIsModalOpen(false);
    if (calculateSelected() > 0) {
      dispatch(selectEntity(-1, false));
    }
    dispatch(clearFilters());
  };

  return (
    isModalOpen && (
      <>
        {/** confirmation modal */}
        <ConfirmSystemsAddModal
          isModalOpen={confirmationModalOpen}
          onSubmit={async () => {
            await handleSystemAddition([...selected.keys()]);
            setTimeout(() => dispatch(fetchGroupDetail(groupId)), 500); // refetch data for this group
            setIsModalOpen(false);
          }}
          onBack={() => {
            setConfirmationModalOpen(false);
            setSystemSelectModalOpen(true); // switch back to the systems table modal
          }}
          onCancel={() => handleModalClose()}
          hostsNumber={alreadyHasGroup.length}
        />
        {/** hosts selection modal */}
        <Modal
          title="Add systems"
          isOpen={systemsSelectModalOpen}
          onClose={() => handleModalClose()}
          footer={
            <Flex direction={{ default: 'column' }} style={{ width: '100%' }}>
              {showWarning && (
                <FlexItem fullWidth={{ default: 'fullWidth' }}>
                  <Alert
                    variant="warning"
                    isInline
                    title="One or more of the selected systems already belong to a group. Only ungrouped systems can be added. Unselect these systems to move forward."
                  />
                </FlexItem>
              )}
              <FlexItem>
                <Button
                  key="confirm"
                  variant="primary"
                  onClick={async () => {
                    if (showWarning) {
                      setSystemSelectModalOpen(false);
                      setConfirmationModalOpen(true); // switch to the confirmation modal
                    } else {
                      await handleSystemAddition([...selected.keys()]);
                      dispatch(fetchGroupDetail(groupId));
                      handleModalClose();
                    }
                  }}
                  isDisabled={noneSelected || showWarning}
                >
                  Add systems
                </Button>
                <Button
                  key="cancel"
                  variant="link"
                  onClick={() => handleModalClose()}
                >
                  Cancel
                </Button>
              </FlexItem>
            </Flex>
          }
          variant="large" // required to accomodate the systems table
        >
          <InventoryTable
            columns={(columns) => prepareColumns(columns, false, true)}
            variant={TableVariant.compact} // TODO: this doesn't affect the table variant
            tableProps={{
              isStickyHeader: false,
              canSelectAll: false,
            }}
            bulkSelect={bulkSelectConfig}
            initialLoading={true}
            showTags
            showCentosVersions
          />
        </Modal>
      </>
    )
  );
};

AddSystemsToGroupModal.propTypes = {
  isModalOpen: PropTypes.bool,
  setIsModalOpen: PropTypes.func,
  reloadData: PropTypes.func,
  groupId: PropTypes.string,
  groupName: PropTypes.string,
};

export default AddSystemsToGroupModal;
