import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import { addHostsToGroupById } from '../utils/api';
import apiWithToast from '../utils/apiWithToast';
import { useDispatch } from 'react-redux';
import { CreateGroupButton } from '../SmallComponents/CreateGroupButton';
import { addHostSchema } from './ModalSchemas/schemes';
import CreateGroupModal from './CreateGroupModal';

const AddSelectedHostsToGroupModal = ({
    isModalOpen,
    setIsModalOpen,
    modalState: hosts,
    reloadData
}) => {
    const dispatch = useDispatch();

    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const handleAddDevices = (values) => {
        const { group } = values;
        const statusMessages = {
            onSuccess: {
                title: 'Success',
                description: `System(s) have been added to ${group.name} successfully`
            },
            onError: {
                title: 'Error',
                description: `Failed to add ${
          hosts.length > 1 ? `${hosts.length} systems` : hosts[0].display_name
        } to ${group.name}`
            }
        };

        apiWithToast(
            dispatch,
            () => addHostsToGroupById(group.id, hosts.map(({ id }) => id)),
            statusMessages
        );
    };

    return (
        <>
            {!isCreateGroupModalOpen &&
            <Modal
                isModalOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
                title="Add to group"
                submitLabel="Add"
                schema={addHostSchema(hosts)}
                additionalMappers={{
                    'create-group-btn': {
                        component: CreateGroupButton,
                        closeModal: () => setIsCreateGroupModalOpen(true)
                    }
                }}
                onSubmit={handleAddDevices}
                reloadData={reloadData}
            />
            }
            {isCreateGroupModalOpen && (
                <CreateGroupModal
                    isModalOpen={isCreateGroupModalOpen}
                    setIsModalOpen={setIsCreateGroupModalOpen}
                    //modal before prop tells create group modal that it should
                    //reopen add host modal when user closes create group modal
                    modalBefore={true}
                    setterOfModalBefore={setIsModalOpen}
                />
            )}
        </>
    );
};

AddSelectedHostsToGroupModal.propTypes = {
    modalState: PropTypes.arrayOf(
        PropTypes.shape({
            // eslint-disable-next-line camelcase
            display_name: PropTypes.string,
            id: PropTypes.string
        })
    ).isRequired,
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func,
    reloadData: PropTypes.func
};

export default AddSelectedHostsToGroupModal;
