import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import { addHostToGroup } from '../utils/api';
import apiWithToast from '../utils/apiWithToast';
import { useDispatch } from 'react-redux';
import { CreateGroupButton } from '../SmallComponents/CreateGroupButton';
import SearchInput from './SearchInput';
import { fetchGroups } from '../../../store/inventory-actions';
import { addHostSchema } from './ModalSchemas/schemes';
import CreateGroupModal from './CreateGroupModal';
import useFormApi from '@data-driven-forms/react-form-renderer/use-form-api';

const AddHostToGroupModal = ({
    isModalOpen,
    setIsModalOpen,
    modalState,
    reloadData
}) => {
    // change is a parf ot DFD api and required to properly disable "add" button
    // eslint-disable-next-line no-unused-vars
    const { change } = useFormApi();
    const dispatch = useDispatch();
    //we have to fetch groups to make them available in state
    useEffect(() => {
        dispatch(fetchGroups());

    }, []);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

    const handleAddDevices = (values) => {
        const { group } = values;
        const statusMessages = {
            onSuccess: {
                title: 'Success',
                description: `System(s) have been added to ${group.toString()} successfully`
            },
            onError: { title: 'Error', description: `Failed to add ${modalState.name} to ${modalState.groupName}` }
        };

        apiWithToast(
            dispatch,
            () => addHostToGroup(group.groupId, modalState.id),
            statusMessages
        );
    };

    return (
        <>
            <Modal
                isModalOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                title="Add to group"
                submitLabel="Add"
                schema={addHostSchema(modalState.name)}
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
            {isCreateGroupModalOpen && (
                <CreateGroupModal
                    isModalOpen={isCreateGroupModalOpen}
                    setIsModalOpen={setIsCreateGroupModalOpen}
                    reloadData={() => console.log('data reloaded')}
                    //modal before prop tells create group modal that it should
                    //reopen add host modal when user closes create group modal
                    modalBefore={true}
                    setterOfModalBefore={setIsModalOpen}
                />
            )}
        </>
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
