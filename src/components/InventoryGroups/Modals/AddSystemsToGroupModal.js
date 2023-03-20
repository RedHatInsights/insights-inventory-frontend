/* eslint-disable max-len */
import {
    componentTypes,
    FormSpy,
    useFormApi,
    validatorTypes
} from '@data-driven-forms/react-form-renderer';
import {
    Alert,
    Button,
    Flex,
    FlexItem,
    Modal as PfModal
} from '@patternfly/react-core';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import { fitContent, TableVariant } from '@patternfly/react-table';
import warningColor from '@patternfly/react-tokens/dist/esm/global_warning_color_100';
import difference from 'lodash/difference';
import map from 'lodash/map';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectEntity } from '../../../store/inventory-actions';
import InventoryTable from '../../InventoryTable/InventoryTable';
import Modal from './Modal';

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

const AddSystemsToGroupModal = ({ isModalOpen, setIsModalOpen, reloadData }) => {
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

    // TODO: must show warning message if any of selected hosts is already in a group

    const alreadyHasGroup = [...selected].filter(
        // eslint-disable-next-line camelcase
        ({ group_name }) => group_name !== undefined && group_name !== ''
    );
    const showWarning = /* alreadyHasGroup.length > 0; */ true;

    return isModalOpen && (
        <>
            {/** confirmation modal */}
            <Modal
                isModalOpen={confirmationModalOpen}
                title={'Add all selected systems to group?'}
                titleIconVariant={() => (
                    <ExclamationTriangleIcon color={warningColor.value} />
                )}
                closeModal={() => setIsModalOpen(false)}
                schema={{
                    fields: [
                        {
                            component: componentTypes.PLAIN_TEXT,
                            name: 'warning-message',
                            label: `${alreadyHasGroup.length} of the systems you selected already belong to a group. Moving them to a different group will impact their configuration.`
                        },
                        {
                            component: componentTypes.CHECKBOX,
                            name: 'confirmation',
                            label: 'I acknowledge that this action cannot be undone.',
                            validate: [{ type: validatorTypes.REQUIRED }]
                        }
                    ]
                }}
                customFormTemplate={({ formFields, schema }) => {
                    const { getState } = useFormApi();
                    const { submitting, valid } = getState();

                    return (
                        <form onSubmit={async () => {
                            await console.log('TODO: fire the PATCH request');
                            setTimeout(async () => await reloadData(), 500);
                            setIsModalOpen(false);
                        }}>
                            <Flex direction={{ default: 'column' }} spaceItems={{ default: 'spaceItemsLg' }}>
                                {schema.title}
                                {formFields}
                                <FormSpy>
                                    {() => (
                                        <Flex>
                                            <Button
                                                isDisabled={submitting || !valid}
                                                type="submit"
                                                color="primary"
                                                variant="primary"
                                            >
                                                Yes, add all systems to group
                                            </Button>
                                            <Button onClick={() => {
                                                setConfirmationModalOpen(false);
                                                setSystemSelectModalOpen(true);
                                            }} variant="secondary">
                                                Back
                                            </Button>
                                            <Button variant="link" onClick={() => setIsModalOpen(false)}>
                                                Cancel
                                            </Button>
                                        </Flex>
                                    )}
                                </FormSpy>
                            </Flex>
                        </form>
                    );
                }}
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
    reloadData: PropTypes.func
};

export default AddSystemsToGroupModal;
