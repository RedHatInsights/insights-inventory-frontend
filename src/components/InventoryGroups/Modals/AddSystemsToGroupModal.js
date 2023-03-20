/* eslint-disable max-len */
import {
    Alert,
    Button,
    Flex,
    FlexItem,
    Modal as PfModal
} from '@patternfly/react-core';
import { fitContent, TableVariant } from '@patternfly/react-table';
import difference from 'lodash/difference';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectEntity } from '../../../store/inventory-actions';
import InventoryTable from '../../InventoryTable/InventoryTable';
import { addHostsToGroupById } from '../utils/api';
import apiWithToast from '../utils/apiWithToast';
import ConfirmSystemsAddModal from './ConfirmSystemsAddModal';

export const prepareColumns = (initialColumns) => {
    // hides the "groups" column
    const columns = initialColumns;

    // additionally insert the "update methods" column
    columns.splice(columns.length - 2 /* must be the 3rd col from the end */, 0, {
        key: 'update_method',
        title: 'Update methods',
        sortKey: 'update_method',
        transforms: [fitContent],
        renderFunc: (value, hostId, systemData) =>
            systemData?.system_profile?.system_update_method || 'N/A',
        props: {
            // TODO: remove isStatic when the sorting is supported by API
            isStatic: true,
            width: 10
        }
    });

    return columns;
};

const AddSystemsToGroupModal = ({ isModalOpen, setIsModalOpen, reloadData, groupId }) => {
    const dispatch = useDispatch();

    const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [systemsSelectModalOpen, setSystemSelectModalOpen] = useState(true);
    const selected = useSelector(
        (state) => state?.entities?.selected || new Map()
    );
    const rows = useSelector(({ entities }) => entities?.rows || []);

    const noneSelected = selected.size === 0;
    const displayedIds = map(rows, 'id');
    const pageSelected =
    difference(displayedIds, [...selected.keys()]).length === 0;

    const alreadyHasGroup = [...selected].filter(
        // eslint-disable-next-line camelcase
        ({ group_name }) => group_name !== undefined && group_name !== ''
    );
    const showWarning = alreadyHasGroup.length > 0;

    const handleSystemAddition = useCallback(
        (hostIds) => {
            const statusMessages = {
                onSuccess: {
                    title: 'Success',
                    description: `${hostIds} has been created successfully`
                },
                onError: { title: 'Error', description: 'Failed to create group' }
            };
            return apiWithToast(dispatch, () => addHostsToGroupById(groupId, hostIds), statusMessages);
        },
        [isModalOpen]
    );

    return isModalOpen && (
        <>
            {/** confirmation modal */}
            <ConfirmSystemsAddModal
                isModalOpen={confirmationModalOpen}
                onSubmit={async () => {
                    await handleSystemAddition([...selected.keys()]);
                    setTimeout(async () => await reloadData(), 500);
                    setIsModalOpen(false);
                }}
                onBack={() => {
                    setConfirmationModalOpen(false);
                    setSystemSelectModalOpen(true);
                }}
                onCancel={() => setIsModalOpen(false)}
                hostsNumber={alreadyHasGroup.length}
            />
            {/** hosts selection modal */}
            <PfModal
                title="Add systems"
                isOpen={systemsSelectModalOpen}
                onClose={() => setIsModalOpen(false)}
                footer={
                    <Flex direction={{ default: 'column' }} style={{ width: '100%' }}>
                        <FlexItem fullWidth={{ default: 'fullWidth' }}>
                            {showWarning && (
                                <Alert
                                    variant="warning"
                                    isInline
                                    title="One or more of the selected systems
                                    already belong to a group. Adding these systems
                                    to a different group may impact system configuration."
                                />
                            )}
                        </FlexItem>
                        <FlexItem>
                            <Button
                                key="confirm"
                                variant="primary"
                                onClick={() => {
                                    setSystemSelectModalOpen(false);
                                    setConfirmationModalOpen(true);
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
                variant="large"
            >
                <InventoryTable
                    columns={prepareColumns}
                    variant={TableVariant.compact} // TODO: this doesn't affect the table variant
                    tableProps={{
                        isStickyHeader: false,
                        canSelectAll: false
                    }}
                    bulkSelect={{
                        count: selected.size,
                        id: 'bulk-select-groups',
                        items: [
                            {
                                title: 'Select none (0)',
                                onClick: () => dispatch(selectEntity(-1, false)),
                                props: { isDisabled: noneSelected }
                            },
                            {
                                title: `${pageSelected ? 'Deselect' : 'Select'} page (${rows.length} items)`,
                                onClick: () => dispatch(selectEntity(0, !pageSelected))
                            }
                            // TODO: Implement "select all"
                        ],
                        onSelect: (value) => {
                            dispatch(selectEntity(0, value));
                        },
                        checked: selected.size > 0 // TODO: support partial selection (dash sign) in FEC BulkSelect
                    }}
                />
            </PfModal>
        </>
    );
};

AddSystemsToGroupModal.propTypes = {
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func,
    reloadData: PropTypes.func,
    groupId: PropTypes.string
};

export default AddSystemsToGroupModal;
