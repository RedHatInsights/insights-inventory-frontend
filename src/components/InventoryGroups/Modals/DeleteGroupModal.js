import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import validatorTypes from '@data-driven-forms/react-form-renderer/validator-types';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import Modal from './Modal';
import { deleteGroupsById, getGroupsByIds } from '../utils/api';
import { ExclamationTriangleIcon } from '@patternfly/react-icons/dist/esm/icons/exclamation-triangle-icon';
import warningColor from '@patternfly/react-tokens/dist/esm/global_warning_color_100';
import dangerColor from '@patternfly/react-tokens/dist/esm/global_danger_color_100';
import { Backdrop, Bullseye, Spinner, Text } from '@patternfly/react-core';
import apiWithToast from '../utils/apiWithToast';
import { useDispatch } from 'react-redux';
import { ExclamationCircleIcon } from '@patternfly/react-icons';

const generateTitle = (groups, groupsAreEmpty) => {
    if (groupsAreEmpty) {
        return groups.length > 1 ? 'Delete groups?' : 'Delete group?';
    }

    return groups.length > 1
        ? 'Cannot delete groups at this time'
        : 'Cannot delete group at this time';
};

const generateIcon = (groupsAreEmpty) =>
    groupsAreEmpty ? (
        <ExclamationTriangleIcon color={warningColor.value} />
    ) : (
        <ExclamationCircleIcon color={dangerColor.value} />
    );

const generateSchema = (groups, groupsAreEmpty) =>
    groupsAreEmpty
        ? {
            fields: [
                {
                    component: componentTypes.PLAIN_TEXT,
                    name: 'warning-message',
                    label:
                    groups.length > 1 ? (
                        <Text>
                            <strong>{groups.length}</strong> groups and all their data will
                  be deleted.
                        </Text>
                    ) : (
                        <Text>
                            <strong>{groups[0]?.name}</strong> and all its data will be deleted.
                        </Text>
                    )
                },
                {
                    component: componentTypes.CHECKBOX,
                    name: 'confirmation',
                    label: 'I understand that this action cannot be undone.',
                    validate: [{ type: validatorTypes.REQUIRED }]
                }
            ]
        } : {
            fields: [
                {
                    component: componentTypes.PLAIN_TEXT,
                    name: 'danger-message',
                    label:
          groups.length > 1 ? (
              <Text>
              Groups containing systems cannot be deleted. To delete groups,
              first remove all of the systems from them.
              </Text>
          ) : (
              <Text>
              Groups containing systems cannot be deleted. To delete{' '}
                  <strong>{groups[0].name}</strong>, first remove all of the systems
              from it.
              </Text>
          )
                }
            ]
        }
     ;

const generateContent = (groups = [], groupsAreEmpty) => {
    return {
        title: generateTitle(groups, groupsAreEmpty),
        titleIconVariant: () => generateIcon(groupsAreEmpty),
        variant: groupsAreEmpty ? 'danger' : 'primary',
        submitLabel: groupsAreEmpty ? 'Delete' : 'Close',
        schema: generateSchema(groups, groupsAreEmpty)
    };
};

const DeleteGroupModal = ({
    isModalOpen,
    setIsModalOpen,
    reloadData,
    groupIds
}) => {
    const dispatch = useDispatch();
    const [fetchedGroups, setFetchedGroups] = useState(undefined);
    const groupsAreEmpty = (fetchedGroups || []).every(({ host_count: hostCount }) => hostCount === 0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // check that all groups are empty before deletion
        let ignore = false;

        const verifyGroupsAreEmpty = async () => {
            const fetchedGroups = await getGroupsByIds(groupIds);

            if (!ignore) {
                setFetchedGroups(fetchedGroups.results);
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
              ? `${groupIds.length} groups deleted`
              : `${name} has been removed successfully`
            },
            onError: {
                title: 'Error',
                description:
                groupIds.length > 1
                    ? `Failed to delete ${groupIds.length} groups`
                    : `Failed to delete group ${name}`
            }
        };
        apiWithToast(dispatch, () => deleteGroupsById(groupIds), statusMessages);
    };

    return (isLoading ?
        <Backdrop>
            <Bullseye>
                <Spinner aria-label="Loading the modal spinner" aria-valueText="Loading..." />
            </Bullseye>
        </Backdrop>
        : <Modal
            isModalOpen={isModalOpen}
            closeModal={() => setIsModalOpen(false)}
            onSubmit={groupsAreEmpty ? handleDeleteGroup : () => setIsModalOpen(false)}
            reloadData={reloadData}
            {...generateContent(fetchedGroups, groupsAreEmpty)}
        />
    );
};

DeleteGroupModal.propTypes = {
    groupIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    isModalOpen: PropTypes.bool,
    setIsModalOpen: PropTypes.func,
    reloadData: PropTypes.func
};
export default DeleteGroupModal;
