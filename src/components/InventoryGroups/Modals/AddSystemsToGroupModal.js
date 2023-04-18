import {
    Alert,
    Button,
    Flex,
    FlexItem,
    Modal
} from '@patternfly/react-core';
import {  TableVariant } from '@patternfly/react-table';
import difference from 'lodash/difference';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroupDetail } from '../../../store/inventory-actions';
import { bulkSelectConfig, prepareColumns } from '../../GroupSystems/GroupSystems';
import InventoryTable from '../../InventoryTable/InventoryTable';
import { addHostsToGroupById } from '../utils/api';
import apiWithToast from '../utils/apiWithToast';
import ConfirmSystemsAddModal from './ConfirmSystemsAddModal';

const AddSystemsToGroupModal = ({
    isModalOpen,
    setIsModalOpen,
    groupId,
    groupName
}) => {
    const dispatch = useDispatch();

    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [systemsSelectModalOpen, setSystemSelectModalOpen] = useState(true);
    const selected = useSelector(
        (state) => state?.entities?.selected || new Map()
    );
    const rows = useSelector(({ entities }) => entities?.rows || []);

    const noneSelected = selected.size === 0;
    const displayedIds = map(rows, 'id');
    const pageSelected = difference(displayedIds, [...selected.keys()]).length === 0;

    const alreadyHasGroup = [...selected].filter(
    // eslint-disable-next-line camelcase
        (entry) => {
            return entry[1].group_name !== undefined && entry[1].group_name !== '';
        }
    );
    const showWarning = alreadyHasGroup.length > 0;

    const handleSystemAddition = useCallback(
        (hostIds) => {
            const statusMessages = {
                onSuccess: {
                    title: 'Success',
                    description: `${hostIds.length > 1 ? 'Systems' : 'System'} added to ${groupName || groupId}`
                },
                onError: {
                    title: 'Error',
                    description: `Failed to add ${hostIds.length > 1 ? 'systems' : 'system'} to ${groupName || groupId}`
                }
            };
            return apiWithToast(
                dispatch,
                () => addHostsToGroupById(groupId, hostIds),
                statusMessages
            );
        },
        [isModalOpen]
    );

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
                    onCancel={() => setIsModalOpen(false)}
                    hostsNumber={alreadyHasGroup.length}
                />
                {/** hosts selection modal */}
                <Modal
                    title="Add systems"
                    isOpen={systemsSelectModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    footer={
                        <Flex direction={{ default: 'column' }} style={{ width: '100%' }}>
                            {showWarning && (
                                <FlexItem fullWidth={{ default: 'fullWidth' }}>
                                    <Alert
                                        variant="warning"
                                        isInline
                                        title="One or more of the selected systems
                                    already belong to a group. Adding these systems
                                    to a different group may impact system configuration."
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
                                            await handleSystemAddition([
                                                ...selected.keys()
                                            ]);
                                            setTimeout(
                                                () =>
                                                    dispatch(
                                                        fetchGroupDetail(groupId)
                                                    ),
                                                500
                                            ); // refetch data for this group
                                            setIsModalOpen(false);
                                        }
                                    }}
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
                            </FlexItem>
                        </Flex>
                    }
                    variant="large" // required to accomodate the systems table
                >
                    <InventoryTable
                        columns={(columns) => prepareColumns(columns, false)}
                        variant={TableVariant.compact} // TODO: this doesn't affect the table variant
                        tableProps={{
                            isStickyHeader: false,
                            canSelectAll: false
                        }}
                        bulkSelect={bulkSelectConfig(dispatch, selected.size, noneSelected, pageSelected, rows.length)}
                        initialLoading={true}
                        showTags
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
    groupName: PropTypes.string
};

export default AddSystemsToGroupModal;
