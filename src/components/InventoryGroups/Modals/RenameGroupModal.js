import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import Modal from './Modal';
import awesomeDebouncePromise from 'awesome-debounce-promise';
import { updateGroupById, validateGroupName } from '../utils/api';
import { nameValidator } from '../helpers/validate';
import useApiWithToast from '../utils/apiWithToast';

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
  const apiWithToast = useApiWithToast();

  const handleRenameModal = (values) => {
    const statusMessages = {
      onSuccess: {
        title: 'Success',
        description: `${name} has been renamed to ${values.name} successfully`,
      },
      onError: {
        title: 'Error',
        description: 'Failed to rename workspace',
      },
    };
    apiWithToast(
      () => updateGroupById(id, { name: values.name }),
      statusMessages,
    );
  };

  const schema = useMemo(() => {
    const check = async (value) => {
      const results = await validateGroupName(value);
      if (results === true) {
        throw 'Workspace name already exists';
      }

      return undefined;
    };

    const d = awesomeDebouncePromise(check, 500, { onlyResolvesLast: false });
    return renameGroupSchema(d);
  }, []);

  return (
    <Modal
      isModalOpen={isModalOpen}
      closeModal={() => setIsModalOpen(false)}
      title="Rename workspace"
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
