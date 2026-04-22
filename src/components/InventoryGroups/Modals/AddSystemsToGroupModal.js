import {
  AlertActionLink,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@patternfly/react-core';
import { TableVariant } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../../store/inventory-actions';
import InventoryTable from '../../InventoryTable/InventoryTable';
import { addHostsToGroupById } from '../utils/api';
import useApiWithToast from '../utils/apiWithToast';
import { useBulkSelectConfig } from '../../../Utilities/hooks/useBulkSelectConfig';
import difference from 'lodash/difference';
import map from 'lodash/map';
import { prepareColumns } from '../../GroupSystems/helpers';

const AddSystemsToGroupModal = ({
  isModalOpen,
  setIsModalOpen,
  groupId,
  groupName,
}) => {
  const apiWithToast = useApiWithToast();
  const dispatch = useDispatch();

  const selected = useSelector(
    (state) => state?.entities?.selected || new Map(),
  );

  const rows = useSelector(({ entities }) => entities?.rows || []);

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
    pageSelected,
  );

  const handleSystemAddition = useCallback(
    (hostIds) => {
      const statusMessages = {
        onSuccess: {
          title: 'Success',
          description: `${hostIds.length > 1 ? 'Systems' : 'System'} added to ${
            groupName || groupId
          }`,
          actionLinks: (
            <AlertActionLink onClick={() => window.location.reload()}>
              Refresh
            </AlertActionLink>
          ),
        },
        onError: {
          title: 'Error',
          description: `Failed to add ${
            hostIds.length > 1 ? 'systems' : 'system'
          } to ${groupName || groupId}`,
        },
      };
      apiWithToast(() => addHostsToGroupById(groupId, hostIds), statusMessages);
    },
    [isModalOpen],
  );

  const defaultInventorySystemsGetEntities = (
    items,
    config,
    showTags,
    defaultGetEntities,
  ) =>
    defaultGetEntities(
      items,
      {
        ...config,
        filters: {
          ...config.filters,
        },
      },
      showTags,
    );

  // overallSelectedKeys is the list of the systems ids
  const overallSelectedKeys = [...selected.keys()];
  // noneSelected a boolean showing that no system is selected
  const noneSelected = overallSelectedKeys.length === 0;

  const ConventionalInventoryTable = (
    <InventoryTable
      columns={(columns) => prepareColumns(columns, false, true)}
      getEntities={defaultInventorySystemsGetEntities}
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
  );

  const handleAddSystemsButton = async () => {
    setIsModalOpen(false);
    handleSystemAddition(overallSelectedKeys);
    await dispatch(fetchGroupDetail(groupId));
  };

  return (
    isModalOpen && (
      <>
        {/** hosts selection modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          variant="large" // required to accomodate the systems table
        >
          <ModalHeader title="Add systems" />
          <ModalBody>{ConventionalInventoryTable}</ModalBody>
          <ModalFooter>
            <Button
              key="confirm"
              variant="primary"
              onClick={handleAddSystemsButton}
              isDisabled={noneSelected}
            >
              Add systems
            </Button>
            <Button
              key="cancel"
              variant="link"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
          </ModalFooter>
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
