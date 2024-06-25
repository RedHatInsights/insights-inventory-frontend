import './AddSelectedHostsToGroupModal.scss';

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import { addHostsToGroupById } from '../utils/api';
import apiWithToast from '../utils/apiWithToast';
import { useDispatch } from 'react-redux';
import { CreateGroupButton } from '../SmallComponents/CreateGroupButton';
import { addHostSchema } from './ModalSchemas/schemes';
import CreateGroupModal from './CreateGroupModal';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import useWorkspaceFeatureFlag from '../../../Utilities/hooks/useWorkspaceFeatureFlag';

const AddSelectedHostsToGroupModal = ({
  isModalOpen,
  setIsModalOpen,
  modalState: hosts,
  reloadData,
}) => {
  const dispatch = useDispatch();
  const chrome = useChrome();
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();
  const handleAddDevices = (values) => {
    const group = JSON.parse(values.group); // parse is a workaround for https://github.com/data-driven-forms/react-forms/issues/1401
    const statusMessages = {
      onSuccess: {
        title: 'Success',
        description: `System(s) have been added to ${group.name} successfully`,
      },
      onError: {
        title: 'Error',
        description: `Failed to add ${
          hosts.length > 1 ? `${hosts.length} systems` : hosts[0].display_name
        } to ${group.name}`,
      },
    };

    apiWithToast(
      dispatch,
      () =>
        addHostsToGroupById(
          group.id,
          hosts.map(({ id }) => id)
        ),
      statusMessages
    );
  };

  return (
    <>
      {!isCreateGroupModalOpen && (
        <Modal
          isModalOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          title={isWorkspaceEnabled ? 'Add to workspace' : 'Add to group'}
          submitLabel="Add"
          schema={addHostSchema(hosts, chrome, isWorkspaceEnabled)}
          additionalMappers={{
            'create-group-btn': {
              component: CreateGroupButton,
              closeModal: () => setIsCreateGroupModalOpen(true),
            },
          }}
          onSubmit={handleAddDevices}
          reloadData={reloadData}
          modalClassName="add-selected-to-group-modal"
        />
      )}
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
      id: PropTypes.string,
    })
  ).isRequired,
  isModalOpen: PropTypes.bool,
  setIsModalOpen: PropTypes.func,
  reloadData: PropTypes.func,
};

export default AddSelectedHostsToGroupModal;
