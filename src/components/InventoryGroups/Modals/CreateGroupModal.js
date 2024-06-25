import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { createGroupSchema } from './ModalSchemas/schemes';
import Modal from './Modal';
import apiWithToast from '../utils/apiWithToast';
import { createGroup, validateGroupName } from '../utils/api';
import { useDispatch } from 'react-redux';
import awesomeDebouncePromise from 'awesome-debounce-promise';
import useWorkspaceFeatureFlag from '../../../Utilities/hooks/useWorkspaceFeatureFlag';

export const validate = async (value = '', isWorkspaceEnabled) => {
  if (value.length === 0) {
    return undefined; // the input is empty
  }

  const results = await validateGroupName(value.trim());
  if (results === true) {
    throw isWorkspaceEnabled
      ? 'Workspace name already exists'
      : 'Group name already exists';
  }

  return undefined;
};

const CreateGroupModal = ({
  isModalOpen,
  setIsModalOpen,
  reloadData,
  modalBefore = false,
  setterOfModalBefore,
}) => {
  const dispatch = useDispatch();
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();

  const handleCreateGroup = useCallback(
    (values) => {
      const statusMessages = {
        onSuccess: {
          title: 'Success',
          description: `${values.name} has been created successfully`,
        },
        onError: {
          title: 'Error',
          description: isWorkspaceEnabled
            ? 'Failed to create workspace'
            : 'Failed to create group',
        },
      };
      return apiWithToast(dispatch, () => createGroup(values), statusMessages);
    },
    [isModalOpen, isWorkspaceEnabled]
  );

  const schema = useMemo(() => {
    const d = awesomeDebouncePromise(
      (value) => validate(value, isWorkspaceEnabled),
      500,
      {
        onlyResolvesLast: false,
      }
    );
    return createGroupSchema(d, isWorkspaceEnabled);
  }, [isWorkspaceEnabled]);

  const onClose = () => {
    if (modalBefore) {
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
      title={isWorkspaceEnabled ? 'Create workspace' : 'Create group'}
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
  reloadData: PropTypes.func,
  modalBefore: PropTypes.bool,
  setterOfModalBefore: PropTypes.func,
};
