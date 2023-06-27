import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import apiWithToast from '../utils/apiWithToast';
import { useDispatch } from 'react-redux';
import { removeHostsFromGroup } from '../utils/api';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { Text } from '@patternfly/react-core';

const schema = (groupName, hosts) => ({
  fields: [
    {
      component: componentTypes.PLAIN_TEXT,
      name: 'warning-message',
      label:
        hosts.length === 1 ? (
          <Text>
            <strong>{hosts[0].display_name}</strong> will no longer be part of{' '}
            <strong>{groupName}</strong> and its configuration will be impacted.
          </Text>
        ) : (
          <Text>
            <strong>{hosts.length}</strong> systems will no longer be part of{' '}
            <strong>{groupName}</strong> and their configuration will be
            impacted.
          </Text>
        ),
    },
  ],
});

const RemoveHostsFromGroupModal = ({
  isModalOpen,
  setIsModalOpen,
  modalState: hosts,
  reloadData,
}) => {
  const dispatch = useDispatch();
  // the current iteration of groups feature a host can be in at maximum one group
  const { name: groupName, id: groupId } = hosts[0].groups[0];

  const handleRemoveHosts = () => {
    const statusMessages = {
      onSuccess: {
        title: `${hosts.length} ${
          hosts.length > 1 ? 'systems' : 'system'
        } removed from ${groupName}`,
      },
      onError: {
        title: `Failed to remove ${hosts.length} ${
          hosts.length > 1 ? 'systems' : 'system'
        } from ${groupName}`,
      },
    };

    apiWithToast(
      dispatch,
      () =>
        removeHostsFromGroup(
          groupId,
          hosts.map(({ id }) => id)
        ),
      statusMessages
    );
  };

  return (
    <Modal
      isModalOpen={isModalOpen}
      closeModal={() => setIsModalOpen(false)}
      title="Remove from group"
      variant="danger"
      submitLabel="Remove"
      schema={schema(groupName, hosts)}
      onSubmit={handleRemoveHosts}
      reloadData={reloadData}
    />
  );
};

RemoveHostsFromGroupModal.propTypes = {
  modalState: PropTypes.arrayOf(
    PropTypes.shape({
      // eslint-disable-next-line camelcase
      display_name: PropTypes.string,
      id: PropTypes.string,
      groups: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
        })
      ),
    })
  ).isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  reloadData: PropTypes.func,
};

export default RemoveHostsFromGroupModal;
