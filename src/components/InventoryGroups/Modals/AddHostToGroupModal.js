import React from 'react';
import PropTypes from 'prop-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import Modal from './Modal';
import { addHostToGroup } from '../utils/api';
import apiWithToast from '../utils/apiWithToast';
import { useDispatch } from 'react-redux';
import { Button, Text } from '@patternfly/react-core';
import SearchInput from './SearchInput';

const CreateGroupButton = ({ closeModal }) => (
    <>
        <Text>Or</Text>
        <Button variant="secondary" className="pf-u-w-50" onClick={closeModal}>
        Create Group
        </Button>
    </>
);

CreateGroupButton.propTypes = {
    closeModal: PropTypes.func
};

const createDescription = (deviceIds) => {
    const systemText =
      deviceIds.length > 1 ? `${deviceIds?.length} systems` : deviceIds[0].name;
    return (
        <Text>
        Select a group to add <strong>{systemText} </strong> or create a new one.
        </Text>
    );
};

//this is a custom schema that is passed via additional mappers to the Modal component
//it allows to create custom item types in the modal
const createSchema = (deviceIds) => ({
    fields: [
        {
            component: componentTypes.PLAIN_TEXT,
            name: 'description',
            label: createDescription(deviceIds)
        },
        {
            component: 'search-input',
            name: 'group',
            label: 'Select a group',
            isRequired: true,
            validate: [{ type: validatorTypes.REQUIRED }]
        },
        { component: 'create-group-btn', name: 'create-group-btn' }
    ]
});

const AddHostToGroupModal = ({
    isModalOpen,
    setIsModalOpen,
    modalState,
    reloadData,
    setIsCreateGroupModalOpen,
    deviceIds
}) => {
    const dispatch = useDispatch();

    const handleAddDevices = (values) => {
        const { group } = values;
        const statusMessages = {
            onSuccess: {
                title: 'Success',
                description: `System(s) have been added to ${group.toString()} successfully`
            },
            onError: { title: 'Error', description: 'Failed to add system to group' }
        };

        apiWithToast(
            dispatch,
            () => addHostToGroup(parseInt(group.groupId), deviceIds),
            statusMessages
        );
    };

    return (
        <Modal
            isModalOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
            title="Add to group"
            submitLabel="Add"
            schema={createSchema(deviceIds)}
            additionalMappers={{
                'search-input': {
                    component: SearchInput
                },
                'create-group-btn': {
                    component: CreateGroupButton,
                    closeModal: () => {
                        setIsCreateGroupModalOpen(true);
                        setIsModalOpen(false);
                    }
                }
            }}
            initialValues={modalState}
            onSubmit={handleAddDevices}
            reloadData={reloadData}
        />
    );
};

AddHostToGroupModal.propTypes = {
    modalState: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        groupName: PropTypes.string
    }),
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func,
    reloadData: PropTypes.func,
    setIsCreateGroupModalOpen: PropTypes.func,
    deviceIds: PropTypes.array
};

export default AddHostToGroupModal;
