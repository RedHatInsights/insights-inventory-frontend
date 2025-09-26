import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import useApiWithToast from '../utils/apiWithToast';
import { removeHostsFromGroup } from '../utils/api';
import componentTypes from '@data-driven-forms/react-form-renderer/component-types';
import { AlertActionLink, Content } from '@patternfly/react-core';

const schema = (hosts) => {
  const hostsInGroup = hosts.filter(({ groups }) => groups.length > 0); // selection can contain ungroupped hosts
  const groupName = hostsInGroup[0].groups[0].name;

  return {
    fields: [
      {
        component: componentTypes.PLAIN_TEXT,
        name: 'warning-message',
        label:
          hostsInGroup.length === 1 ? (
            <Content component="p" data-testid="desc">
              <strong>{hostsInGroup[0].display_name}</strong> will no longer be
              part of <strong>{groupName}</strong> and its configuration will be
              impacted.
            </Content>
          ) : (
            <Content component="p" data-testid="desc">
              <strong>{hostsInGroup.length}</strong> systems will no longer be
              part of <strong>{groupName}</strong> and their configuration will
              be impacted.
            </Content>
          ),
      },
    ],
  };
};

const statusMessages = (hosts) => {
  const hostsInGroup = hosts.filter(({ groups }) => groups.length > 0);
  const groupName = hostsInGroup[0].groups[0].name;

  return hostsInGroup.length === 1
    ? {
        onSuccess: {
          title: `1 system removed from ${groupName}`,
          actionLinks: (
            <AlertActionLink onClick={() => window.location.reload()}>
              Refresh
            </AlertActionLink>
          ),
        },
        onError: {
          title: `Failed to remove 1 system from ${groupName}`,
        },
      }
    : {
        onSuccess: {
          title: `${hostsInGroup.length} systems removed from ${groupName}`,
          actionLinks: (
            <AlertActionLink onClick={() => window.location.reload()}>
              Refresh
            </AlertActionLink>
          ),
        },
        onError: {
          title: `Failed to remove ${hostsInGroup.length} systems from ${groupName}`,
        },
      };
};

const RemoveHostsFromGroupModal = ({
  isModalOpen,
  setIsModalOpen,
  modalState: hosts,
  reloadData,
  reloadTimeout,
}) => {
  const apiWithToast = useApiWithToast();
  const groupId = hosts.find(({ groups }) => groups.length > 0).groups[0].id;

  const handleRemoveHosts = () =>
    apiWithToast(
      () =>
        removeHostsFromGroup(
          groupId,
          hosts.map(({ id }) => id),
        ),
      statusMessages(hosts),
    );

  return (
    <Modal
      isModalOpen={isModalOpen}
      closeModal={() => setIsModalOpen(false)}
      title="Remove from workspace"
      variant="primary"
      submitLabel="Remove"
      schema={schema(hosts)}
      onSubmit={handleRemoveHosts}
      reloadData={reloadData}
      reloadTimeout={reloadTimeout}
    />
  );
};

RemoveHostsFromGroupModal.propTypes = {
  modalState: PropTypes.arrayOf(
    PropTypes.shape({
      display_name: PropTypes.string,
      id: PropTypes.string,
      groups: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.string,
        }),
      ),
    }),
  ).isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  setIsModalOpen: PropTypes.func.isRequired,
  reloadData: PropTypes.func,
  reloadTimeout: PropTypes.number,
};

export default RemoveHostsFromGroupModal;
