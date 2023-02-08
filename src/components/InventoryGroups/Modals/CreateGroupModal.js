import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { createGroupSchema } from './ModalSchemas/schemes';
import Modal from './Modal';
import apiWithToast from '../utils/apiWithToast';
import {
    createGroup,
    addSystemsToGroup,
    validateGroupName
} from '../utils/api';
import { useDispatch } from 'react-redux';
import { debounce } from 'lodash';

const asyncGroupNameValidation = debounce(async (value = '') => {
    // do not fire validation request for empty name
    if (value.length === 0) {
        return undefined;
    }

    //api call to check that the name is valid and unique
    const resp = await validateGroupName(value);
    if (resp.data.isValid) {
    // async validator has to throw error, not return it
        throw 'Group name already exists';
    }
}, 800);

const validatorMapper = {
    groupName: () => asyncGroupNameValidation
};

const CreateGroupModal = ({
    setIsModalOpen,
    deviceIds,
    reloadData,
    isOpen
}) => {
    const dispatch = useDispatch();

    const handleCreateGroup = useCallback(
        (values) => {
            const statusMessages = {
                onSuccess: {
                    title: 'Success',
                    description: `${values.name} has been created successfully`
                },
                onError: { title: 'Error', description: 'Failed to create group' }
            };
            return apiWithToast(dispatch, () => createGroup(values), statusMessages);
        },
        [deviceIds]
    );

    const handleAddDevicesToNewGroup = async (values) => {
        const { ID } = await handleCreateGroup(values);

        const statusMessages = {
            onSuccess: {
                title: 'Success',
                description: `System(s) have been added to ${values.name} successfully`
            },
            onError: { title: 'Error', description: 'Failed to add system to group' }
        };

        apiWithToast(
            dispatch,
            () => addSystemsToGroup(parseInt(ID), deviceIds),
            statusMessages
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            closeModal={() => setIsModalOpen(false)}
            title="Create group"
            submitLabel="Create"
            schema={createGroupSchema}
            reloadData={reloadData}
            onSubmit={deviceIds ? handleAddDevicesToNewGroup : handleCreateGroup}
            validatorMapper={validatorMapper}
        />
    );
};

export default CreateGroupModal;

CreateGroupModal.propTypes = {
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func,
    reloadData: PropTypes.func,
    deviceIds: PropTypes.array,
    isOpen: PropTypes.bool
};
