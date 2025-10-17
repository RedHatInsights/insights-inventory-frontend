import {
  Alert,
  AlertActionLink,
  Button,
  Flex,
  FlexItem,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@patternfly/react-core';
import { TableVariant } from '@patternfly/react-table';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../../store/inventory-actions';
import InventoryTable from '../../InventoryTable/InventoryTable';
import { addHostsToGroupById } from '../utils/api';
import useApiWithToast from '../utils/apiWithToast';
import { useBulkSelectConfig } from '../../../Utilities/hooks/useBulkSelectConfig';
import difference from 'lodash/difference';
import map from 'lodash/map';
import useFeatureFlag from '../../../Utilities/useFeatureFlag';
import { prepareColumns } from '../../GroupSystems/helpers';

const AddSystemsToGroupModal = ({
  isModalOpen,
  setIsModalOpen,
  groupId,
  groupName,
}) => {
  const apiWithToast = useApiWithToast();

  const selected = useSelector(
    (state) => state?.entities?.selected || new Map(),
  );

  const isKesselEnabled = useFeatureFlag('hbi.kessel-migration');
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

  const alreadyHasGroup = [...selected].filter((entry) => {
    return isKesselEnabled
      ? !entry[1]?.groups?.[0]?.ungrouped
      : entry[1]?.groups?.[0]?.name !== undefined &&
          entry[1]?.groups?.[0]?.name !== '';
  });

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
  // showWarning when systems had groups
  const showWarning = alreadyHasGroup.length > 0;

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
            <Flex direction={{ default: 'column' }} style={{ width: '100%' }}>
              {showWarning && (
                <FlexItem fullWidth={{ default: 'fullWidth' }}>
                  <Alert
                    variant="warning"
                    isInline
                    title="One or more of the selected systems already belong to a workspace. Only systems not already belonging to a workspace can be added. Unselect these systems to move forward."
                  />
                </FlexItem>
              )}
              <FlexItem>
                <Button
                  key="confirm"
                  variant="primary"
                  onClick={handleAddSystemsButton}
                  isDisabled={noneSelected || showWarning}
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
              </FlexItem>
            </Flex>
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
