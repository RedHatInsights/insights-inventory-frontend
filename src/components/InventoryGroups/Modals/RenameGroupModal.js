import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import Modal from './Modal';
import awesomeDebouncePromise from 'awesome-debounce-promise';
import { updateGroupById, validateGroupName } from '../utils/api';
import { nameValidator } from '../helpers/validate';
import apiWithToast from '../utils/apiWithToast';
import { useDispatch } from 'react-redux';
import useWorkspaceFeatureFlag from '../../../Utilities/hooks/useWorkspaceFeatureFlag';

const renameGroupSchema = (namePresenceValidator) => ({
  fields: [
    {
      component: componentTypes.TEXT_FIELD,
      name: 'name',
      label: 'Name',
      helperText:
        'Can only contain letters, numbers, spaces, hyphens ( - ), and underscores( _ ).',
      isRequired: true,
      validate: [
        namePresenceValidator,
        { type: validatorTypes.REQUIRED },
        { type: validatorTypes.MAX_LENGTH, threshold: 50 },
        nameValidator,
      ],
    },
  ],
});

const RenameGroupModal = ({
  isModalOpen,
  setIsModalOpen,
  modalState,
  reloadData,
}) => {
  const { id, name } = modalState;
  const dispatch = useDispatch();
  const isWorkspaceEnabled = useWorkspaceFeatureFlag();

  const handleRenameModal = (values) => {
    const statusMessages = {
      onSuccess: {
        title: 'Success',
        description: `${name} has been renamed to ${values.name} successfully`,
      },
      onError: {
        title: 'Error',
        description: isWorkspaceEnabled
          ? 'Failed to rename workspace'
          : 'Failed to rename group',
      },
    };
    apiWithToast(
      dispatch,
      () => updateGroupById(id, { name: values.name }),
      statusMessages
    );
  };

  const schema = useMemo(() => {
    const check = async (value) => {
      const results = await validateGroupName(value);
      if (results === true) {
        throw isWorkspaceEnabled
          ? 'Workspace name already exists'
          : 'Group name already exists';
      }

      return undefined;
    };

    // eslint-disable-next-line new-cap
    const d = awesomeDebouncePromise(check, 500, { onlyResolvesLast: false });
    return renameGroupSchema(d);
  }, []);

  return (
    <Modal
      isModalOpen={isModalOpen}
      closeModal={() => setIsModalOpen(false)}
      title={isWorkspaceEnabled ? 'Rename workspace' : 'Rename group'}
      submitLabel="Save"
      schema={schema}
      initialValues={modalState}
      onSubmit={handleRenameModal}
      reloadData={reloadData}
    />
  );
};

RenameGroupModal.propTypes = {
  modalState: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  isModalOpen: PropTypes.bool,
  setIsModalOpen: PropTypes.func,
  reloadData: PropTypes.func,
};

export default RenameGroupModal;
