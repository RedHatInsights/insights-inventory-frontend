import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { propertiesSelector } from '../selectors';
import { editAnsibleHost, editDisplayName } from '../../../store/actions';
import TextInputModal from '../TextInputModal';
import TitleWithPopover from '../TitleWithPopover';
import EditButton from '../EditButton';
import { generalMapper } from '../dataMapper';
import { extraShape } from '../../../constants';

const SystemCard = ({
  setDisplayName,
  setAnsibleHost,
  writePermissions,
  handleClick,
  hasHostName = true,
  hasDisplayName = true,
  hasAnsibleHostname = true,
  hasWorkspace = true,
  hasSAP = true,
  hasSystemPurpose = true,
  hasCPUs = true,
  hasSockets = true,
  hasCores = true,
  hasCPUFlags = true,
  hasRAM = true,
  extra = [],
}) => {
  const dispatch = useDispatch();
  const entity = useSelector((state) => state.entityDetails.entity);
  const systemProfile = useSelector(
    (state) => state.systemProfileStore.systemProfile
  );
  const detailLoaded = systemProfile && systemProfile.loaded;
  const properties = propertiesSelector(systemProfile, entity);

  const [isDisplayNameModalOpen, setIsDisplayNameModalOpen] = useState(false);
  const [isAnsibleHostModalOpen, setIsAnsibleHostModalOpen] = useState(false);

  const onCancel = () => {
    setIsDisplayNameModalOpen(false);
    setIsAnsibleHostModalOpen(false);
  };

  const onSubmit = (fn, origValue) => (value) => {
    dispatch(fn(entity.id, value, origValue));
    onCancel();
  };

  const onShowDisplayModal = (event) => {
    event.preventDefault();
    setIsDisplayNameModalOpen(true);
  };

  const onShowAnsibleModal = (event) => {
    event.preventDefault();
    setIsAnsibleHostModalOpen(true);
  };

  const getAnsibleHost = () => {
    return entity.ansible_host || entity.fqdn || entity.id;
  };

  return (
    <Fragment>
      <LoadingCard
        title="System properties"
        isLoading={!detailLoaded}
        cardId="system-card"
        items={[
          ...(hasHostName
            ? [
                {
                  title: (
                    <TitleWithPopover
                      title="Host name"
                      content="Name imported from the system."
                    />
                  ),
                  value: entity.fqdn,
                  size: 'md',
                  customClass: 'sentry-mask data-hj-suppress',
                },
              ]
            : []),
          ...(hasDisplayName
            ? [
                {
                  title: (
                    <TitleWithPopover
                      title="Display name"
                      content="System name displayed in an inventory list."
                    />
                  ),
                  value: (
                    <Fragment>
                      {entity.display_name}
                      <EditButton
                        writePermissions={writePermissions}
                        link="display_name"
                        onClick={onShowDisplayModal}
                      />
                    </Fragment>
                  ),
                  size: 'md',
                  customClass: 'sentry-mask data-hj-suppress',
                },
              ]
            : []),
          ...(hasAnsibleHostname
            ? [
                {
                  title: (
                    <TitleWithPopover
                      title="Ansible hostname"
                      content="Hostname that is used in playbooks by Remediations."
                    />
                  ),
                  value: (
                    <Fragment>
                      {getAnsibleHost()}
                      <EditButton
                        writePermissions={writePermissions}
                        link="ansible_name"
                        onClick={onShowAnsibleModal}
                      />
                    </Fragment>
                  ),
                  size: 'md',
                  customClass: 'sentry-mask data-hj-suppress',
                },
              ]
            : []),
          ...(hasWorkspace
            ? [
                {
                  title: 'Workspace',
                  value: entity.groups?.length > 0 && entity.groups?.[0]?.name,
                  size: 'md',
                  customClass: 'sentry-mask data-hj-suppress',
                  target: `/workspaces/${entity.groups?.[0]?.id}`,
                },
              ]
            : []),
          ...(hasSAP
            ? [
                {
                  title: 'SAP',
                  value: properties.sapIds?.length,
                  singular: 'identifier',
                  target: 'sap_sids',
                  onClick: () => {
                    handleClick(
                      'SAP IDs (SID)',
                      generalMapper(properties.sapIds, 'SID')
                    );
                  },
                },
              ]
            : []),
          ...(hasSystemPurpose
            ? [{ title: 'System purpose', value: properties.systemPurpose }]
            : []),
          ...(hasCPUs
            ? [{ title: 'Number of CPUs', value: properties.cpuNumber }]
            : []),
          ...(hasSockets
            ? [{ title: 'Sockets', value: properties.sockets }]
            : []),
          ...(hasCores
            ? [
                {
                  title: 'Cores per socket',
                  value: properties.coresPerSocket,
                },
              ]
            : []),
          ...(hasCPUFlags
            ? [
                {
                  title: 'CPU flags',
                  value: properties?.cpuFlags?.length,
                  singular: 'flag',
                  target: 'flag',
                  onClick: () =>
                    handleClick(
                      'CPU flags',
                      generalMapper(properties.cpuFlags, 'flag name')
                    ),
                },
              ]
            : []),
          ...(hasRAM ? [{ title: 'RAM', value: properties.ramSize }] : []),
          ...extra.map(({ onClick, ...item }) => ({
            ...item,
            ...(onClick && { onClick: (e) => onClick(e, handleClick) }),
          })),
        ]}
      />
      <TextInputModal
        isOpen={isDisplayNameModalOpen}
        title="Edit display name"
        value={entity && entity.display_name}
        ariaLabel="Host inventory display name"
        modalOuiaId="edit-display-name-modal"
        cancelOuiaId="cancel-edit-display-name"
        confirmOuiaId="confirm-edit-display-name"
        inputOuiaId="input-edit-display-name"
        onCancel={onCancel}
        onSubmit={onSubmit(setDisplayName, entity && entity.display_name)}
        className="sentry-mask data-hj-suppress"
      />
      <TextInputModal
        isOpen={isAnsibleHostModalOpen}
        title="Edit Ansible host"
        value={entity && getAnsibleHost()}
        ariaLabel="Ansible host"
        modalOuiaId="edit-ansible-name-modal"
        cancelOuiaId="cancel-edit-ansible-name"
        confirmOuiaId="confirm-edit-ansible-name"
        inputOuiaId="input-edit-ansible-name"
        onCancel={onCancel}
        onSubmit={onSubmit(setAnsibleHost, entity && getAnsibleHost())}
        className="sentry-mask data-hj-suppress"
      />
    </Fragment>
  );
};

SystemCard.propTypes = {
  setDisplayName: PropTypes.func,
  setAnsibleHost: PropTypes.func,
  writePermissions: PropTypes.bool,
  handleClick: PropTypes.func,
  hasHostName: PropTypes.bool,
  hasDisplayName: PropTypes.bool,
  hasAnsibleHostname: PropTypes.bool,
  hasWorkspace: PropTypes.bool,
  hasSAP: PropTypes.bool,
  hasSystemPurpose: PropTypes.bool,
  hasCPUs: PropTypes.bool,
  hasSockets: PropTypes.bool,
  hasCores: PropTypes.bool,
  hasCPUFlags: PropTypes.bool,
  hasRAM: PropTypes.bool,
  extra: PropTypes.arrayOf(extraShape),
};
SystemCard.defaultProps = {
  detailLoaded: false,
  entity: {},
  properties: {},
  hasHostName: true,
  hasDisplayName: true,
  hasAnsibleHostname: true,
  hasWorkspace: true,
  hasSAP: true,
  hasSystemPurpose: true,
  hasCPUs: true,
  hasSockets: true,
  hasCores: true,
  hasCPUFlags: true,
  hasRAM: true,
  extra: [],
};

export default SystemCard;
