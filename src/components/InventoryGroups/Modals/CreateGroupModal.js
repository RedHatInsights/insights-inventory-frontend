import React, { useCallback, useMemo, useState } from 'react';
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
    reloadData,
    modalBefore = false,
    setterOfModalBefore
}) => {
    const dispatch = useDispatch();
    const [returnToPrevModal, setReturnToPrevModal] = useState(modalBefore);

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

    const onSubmit = (values) => {
        if (returnToPrevModal) {
            setReturnToPrevModal(false);
        }

        return handleCreateGroup(values);
    };

    const onClose = () => {
        if (returnToPrevModal) {
            setIsModalOpen(false);
            setterOfModalBefore(true);
        } else {
            setIsModalOpen(false);
        }
    };

    return (
        <Modal
            isModalOpen={isModalOpen}
            closeModal={onClose}
            title="Create group"
            submitLabel="Create"
            schema={schema}
            reloadData={reloadData}
            onSubmit={(values) => onSubmit(values)}
        />
    );
};

export default CreateGroupModal;

CreateGroupModal.propTypes = {
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func,
    reloadData: PropTypes.func,
    modalBefore: PropTypes.bool,
    setterOfModalBefore: PropTypes.func
};
