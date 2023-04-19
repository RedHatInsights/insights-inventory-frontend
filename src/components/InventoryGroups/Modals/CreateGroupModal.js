import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { createGroupSchema } from './ModalSchemas/schemes';
import Modal from './Modal';
import apiWithToast from '../utils/apiWithToast';
import {
    createGroup,
    validateGroupName
} from '../utils/api';
import { useDispatch } from 'react-redux';
import awesomeDebouncePromise from 'awesome-debounce-promise';

const CreateGroupModal = ({
    isModalOpen,
    setIsModalOpen,
    reloadData
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
        [isModalOpen]
    );

    const schema = useMemo(() => {
        const check = async (value) => {
            const results = await validateGroupName(value);
            if (results === true) {
                throw 'Group name already exists';
            }

            return undefined;
        };

        // eslint-disable-next-line new-cap
        const d = awesomeDebouncePromise(check, 500, { onlyResolvesLast: false });
        return createGroupSchema(d);
    }, []);

    return (
        <Modal
            data-testid="create-group-modal"
            isModalOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
            title="Create group"
            submitLabel="Create"
            schema={schema}
            reloadData={reloadData}
            onSubmit={handleCreateGroup}
        />
    );
};

export default CreateGroupModal;

CreateGroupModal.propTypes = {
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func,
    reloadData: PropTypes.func
};
