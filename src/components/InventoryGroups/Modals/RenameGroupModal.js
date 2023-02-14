import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import Modal from './Modal';
import awesomeDebouncePromise from 'awesome-debounce-promise';
import { validateGroupName } from '../utils/api';
import { nameValidator } from '../helpers/validate';
import apiWithToast from '../utils/apiWithToast';
import { useDispatch } from 'react-redux';

const renameGroupSchema = (namePresenceValidator) => ({
    fields: [
        {
            component: componentTypes.TEXT_FIELD,
            name: 'name',
            label: 'Group name',
            helperText:
          'Can only contain letters, numbers, spaces, hyphens ( - ), and underscores( _ ).',
            isRequired: true,
            validate: [
                namePresenceValidator,
                { type: validatorTypes.REQUIRED },
                { type: validatorTypes.MAX_LENGTH, threshold: 50 },
                nameValidator
            ]
        }
    ]
});

const RenameGroupModal = ({
    isModalOpen,
    setIsModalOpen
    //reloadData a way to reload data after renaming
    //modalState we receive the id from the table component
}) => {
    /* const { id, name } = modalState; */
    const dispatch = useDispatch();

    const handleRenameModal = (values) => {
        const statusMessages = {
            onSuccess: {
                title: 'Success',
                description: `${name} has been renamed to ${values.name} successfully`
            },
            onError: { title: 'Error', description: 'Failed to rename group' }
        };
        /* apiWithToast(dispatch, () => updateGroupById(id, values), statusMessages); */
        apiWithToast(dispatch, () => console.log('notification dispatched'), statusMessages);
    };

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
        return renameGroupSchema(d);
    }, []);

    return (
        <Modal
            isModalOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
            title="Rename group"
            submitLabel="Save"
            schema={schema}
            //initialValues={modalState}
            onSubmit={handleRenameModal}
            //reloadData={reloadData}
        />
    );
};

RenameGroupModal.propTypes = {
    id: PropTypes.number,
    modalState: PropTypes.object,
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func,
    reloadData: PropTypes.func
};
export default RenameGroupModal;
