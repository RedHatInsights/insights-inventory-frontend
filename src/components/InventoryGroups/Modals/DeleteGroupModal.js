import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import RepoModal from './Modal';
import { deleteGroupsById, getGroupsByIds } from '../utils/api';
import {
  Backdrop,
  Bullseye,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Content,
} from '@patternfly/react-core';
import useApiWithToast from '../utils/apiWithToast';
import useFetchBatched from '../../../Utilities/hooks/useFetchBatched';

const generateSchema = (groups) => ({
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'warning-message',
      label:
        groups.length > 1 ? (
          <Content component="p">
            <strong>{groups.length}</strong> workspaces and all their data will
            be deleted.
          </Content>
        ) : (
          <Content component="p">
            <strong>{groups[0]?.name}</strong> and all its data will be deleted.
          </Content>
        ),
    },
    {
      component: componentTypes.CHECKBOX,
      name: 'confirmation',
      label: 'I understand that this action cannot be undone.',
      validate: [{ type: validatorTypes.REQUIRED }],
    },
  ],
});

const generateContent = (groups = []) => ({
  title: groups.length > 1 ? 'Delete workspaces?' : 'Delete workspace?',
  titleIconVariant: 'warning',
  submitLabel: 'Delete',
  schema: generateSchema(groups),
});

const DeleteGroupModal = ({
  isModalOpen,
  setIsModalOpen,
  reloadData,
  groupIds,
}) => {
  const apiWithToast = useApiWithToast();
  const [fetchedGroups, setFetchedGroups] = useState(undefined);
  const groupsAreEmpty = (fetchedGroups || []).every(
    ({ host_count: hostCount }) => hostCount === 0,
  );
  const [isLoading, setIsLoading] = useState(true);
  const { fetchBatchedInline } = useFetchBatched();

  useEffect(() => {
    // check that all groups are empty before deletion
    let ignore = false;

    const verifyGroupsAreEmpty = async () => {
      const fetchedGroups = await fetchBatchedInline(getGroupsByIds, groupIds);

      if (!ignore) {
        setFetchedGroups(fetchedGroups.flatMap(({ results }) => results));
        setIsLoading(false);
      }

      // TODO: treat the error case
    };

    verifyGroupsAreEmpty();

    return () => {
      ignore = true;
    };
  }, []);

  const handleDeleteGroup = () => {
    const statusMessages = {
      onSuccess: {
        title: 'Success',
        description:
          groupIds.length > 1
            ? `${groupIds.length} workspaces deleted`
            : `${fetchedGroups?.[0]?.name} has been removed successfully`,
      },
      onError: {
        title: 'Error',
        description:
          groupIds.length > 1
            ? `Failed to delete ${groupIds.length} workspaces`
            : `Failed to delete workspace ${fetchedGroups?.[0]?.name}`,
      },
    };
    apiWithToast(() => deleteGroupsById(groupIds), statusMessages);
  };

  return isLoading ? (
    <Backdrop>
      <Bullseye>
        <Spinner
          aria-label="Loading the modal spinner"
          aria-valueText="Loading..."
        />
      </Bullseye>
    </Backdrop>
  ) : !groupsAreEmpty ? ( // groups must have no systems to be deleted
    <Modal
      variant="small"
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    >
      <ModalHeader
        title={
          fetchedGroups.length > 1
            ? 'Cannot delete workspaces at this time'
            : 'Cannot delete workspace at this time'
        }
        titleIconVariant="danger"
      />
      <ModalBody>
        {fetchedGroups.length > 1 ? (
          <Content component="p">
            Workspaces containing systems cannot be deleted. To delete
            workspaces, first remove all of the systems from them.
          </Content>
        ) : (
          <Content component="p">
            Workspaces containing systems cannot be deleted. To delete{' '}
            <strong>{fetchedGroups[0].name}</strong>, first remove all of the
            systems from it.
          </Content>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={() => setIsModalOpen(false)}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  ) : (
    <RepoModal
      isModalOpen={isModalOpen}
      closeModal={() => setIsModalOpen(false)}
      onSubmit={handleDeleteGroup}
      reloadData={reloadData}
      {...generateContent(fetchedGroups)}
    />
  );
};

DeleteGroupModal.propTypes = {
  groupIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  isModalOpen: PropTypes.bool,
  setIsModalOpen: PropTypes.func,
  reloadData: PropTypes.func,
};
export default DeleteGroupModal;
