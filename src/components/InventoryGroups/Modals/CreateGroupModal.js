import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { createGroupSchema } from './ModalSchemas/schemes';
import Modal from './Modal';
import apiWithToast from '../utils/apiWithToast';
import { createGroup, validateGroupName } from '../utils/api';
import { useDispatch } from 'react-redux';
import awesomeDebouncePromise from 'awesome-debounce-promise';

export const validate = async (value = '') => {
  if (value.length === 0) {
    return undefined; // the input is empty
  }

  const results = await validateGroupName(value.trim());
  if (results === true) {
    throw 'Group name already exists';
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

  const handleCreateGroup = useCallback(
    (values) => {
      const statusMessages = {
        onSuccess: {
          title: 'Success',
          description: `${values.name} has been created successfully`,
        },
        onError: { title: 'Error', description: 'Failed to create group' },
      };
      return apiWithToast(dispatch, () => createGroup(values), statusMessages);
    },
    [isModalOpen]
  );

  const schema = useMemo(() => {
    const d = awesomeDebouncePromise(validate, 500, {
      onlyResolvesLast: false,
    });
    return createGroupSchema(d);
  }, []);

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
  reloadData: PropTypes.func,
  modalBefore: PropTypes.bool,
  setterOfModalBefore: PropTypes.func,
};
