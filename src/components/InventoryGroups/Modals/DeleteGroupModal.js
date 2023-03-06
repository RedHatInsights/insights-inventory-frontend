import React from 'react';
import PropTypes from 'prop-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import Modal from './Modal';
import { deleteGroupsById } from '../utils/api';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import warningColor from '@patternfly/react-tokens/dist/esm/global_warning_color_100';
import { Text } from '@patternfly/react-core';
import apiWithToast from '../utils/apiWithToast';
import { useDispatch } from 'react-redux';

const description = (name = '', groupsCount) => {
    const isMultiple = name === '' && groupsCount;

    return isMultiple ? (
        <Text>
            <strong>{groupsCount}</strong> groups and all their data will be
            permanently deleted. Associated systems will be removed from the
            groups but will not be deleted.
        </Text>
    ) : (
        <Text>
            <strong>{name}</strong> and all its data will be
            permanently deleted. Associated systems will be removed from the
            group but will not be deleted.
        </Text>
    );
};

const schema = (name, groupsCount) => ({
    fields: [
        {
            component: componentTypes.PLAIN_TEXT,
            name: 'warning-message',
            label: description(name, groupsCount)
        },
        {
            component: componentTypes.CHECKBOX,
            name: 'confirmation',
            label: 'I understand that this action cannot be undone.',
            validate: [{ type: validatorTypes.REQUIRED }]
        }
    ]
});

const defaultValueToBeRemoved = () => console.log('data reloaded');

const DeleteGroupModal = ({
    isModalOpen,
    setIsModalOpen,
    reloadData = defaultValueToBeRemoved,
    modalState
}) => {
    const { id, name, ids } = modalState;
    const isMultiple = (ids || []).length > 0;
    const dispatch = useDispatch();

    const handleDeleteGroup = () => {
        const statusMessages = {
            onSuccess: {
                title: 'Success',
                description: `${name} has been removed successfully`
            },
            onError: { title: 'Error', description: 'Failed to delete group' }
        };
        apiWithToast(dispatch, () => deleteGroupsById(isMultiple ? ids : [id]), statusMessages);
    };

    return (
        <Modal
            isModalOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
            title={isMultiple ? 'Delete groups?' : 'Delete group?'}
            titleIconVariant={() => (
                <ExclamationTriangleIcon color={warningColor.value} />
            )}
            variant="danger"
            submitLabel="Delete"
            schema={schema(name, (ids || []).length)}
            onSubmit={handleDeleteGroup}
            reloadData={reloadData}
        />
    );
};

DeleteGroupModal.propTypes = {
    modalState: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        ids: PropTypes.array
    }),
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func,
    reloadData: PropTypes.func
};
export default DeleteGroupModal;
