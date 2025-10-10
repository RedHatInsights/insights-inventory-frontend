import React from 'react';
import PropTypes from 'prop-types';
import LoadingCard from '../LoadingCard';
import { propertiesSelector } from '../selectors';
import { editAnsibleHost, editDisplayName } from '../../../store/actions';
import TitleWithPopover from '../TitleWithPopover';
import { generalMapper } from '../dataMapper';
import { extraShape } from '../../../constants';
import { workloadsTypesKeys } from './SystemCardConfigs';
import WorkloadsSection from './Workloads';
import { NameInlineEdit } from './NameInlineEdit';
import { useDispatch, useSelector } from 'react-redux';
import { useAddNotification } from '@redhat-cloud-services/frontend-components-notifications/hooks';

const SystemCard = ({
  writePermissions,
  handleClick,
  hasHostName = true,
  hasDisplayName = true,
  hasAnsibleHostname = true,
  hasWorkspace = true,
  hasSystemPurpose = true,
  hasCPUs = true,
  hasSockets = true,
  hasCores = true,
  hasCPUFlags = true,
  hasRAM = true,
  extra = [],
}) => {
  const dispatch = useDispatch();
  const addNotification = useAddNotification();
  const entity = useSelector((state) => state.entityDetails.entity);
  const systemProfile = useSelector(
    (state) => state.systemProfileStore.systemProfile,
  );
  const workloadsData = systemProfile && systemProfile.workloads;

  const detailLoaded = systemProfile && systemProfile.loaded;
  const properties = propertiesSelector(systemProfile, entity);

  const onSubmit = (fn, value, origValue) => {
    dispatch(fn(entity?.id, value, origValue, addNotification));
  };

  const getAnsibleHost = (entity) => {
    return entity?.ansible_host || entity?.fqdn || entity?.id;
  };

  const checkWorkloadsKeys = (input = {}, referenceKeys) => {
    return referenceKeys.filter(
      (key) => typeof input[key] === 'object' && input[key] !== null,
    );
  };

  const workloadsTypes = checkWorkloadsKeys(workloadsData, workloadsTypesKeys);

  return (
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
                value: entity?.fqdn,
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
                  <NameInlineEdit
                    textValue={entity?.display_name || ''}
                    onSubmit={(value) =>
                      onSubmit(editDisplayName, value, entity?.display_name)
                    }
                    writePermissions={writePermissions}
                  />
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
                  <NameInlineEdit
                    textValue={getAnsibleHost(entity) || ''}
                    writePermissions={writePermissions}
                    onSubmit={(value) =>
                      onSubmit(editAnsibleHost, value, getAnsibleHost(entity))
                    }
                  />
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
                value:
                  (entity?.groups?.length > 0 && entity?.groups?.[0]?.name) ||
                  '',
                size: 'md',
                customClass: 'sentry-mask data-hj-suppress',
                target: `/workspaces/${entity?.groups?.[0]?.id}`,
              },
            ]
          : []),
        ...(workloadsTypes.length > 0
          ? [
              {
                title: 'Workloads',
                size: 'md',
                value: (
                  <WorkloadsSection
                    handleClick={handleClick}
                    workloadsData={workloadsData}
                    workloadsTypes={workloadsTypes}
                  />
                ),
              },
            ]
          : [
              {
                title: 'Workloads',
                size: 'md',
                value: 'Not available',
              },
            ]),
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
                    generalMapper(properties.cpuFlags, 'flag name'),
                  ),
              },
            ]
          : []),
        ...(hasRAM ? [{ title: 'RAM', value: properties.ramSize }] : []),
        ...extra.map(({ onClick, ...item }) => ({
          ...item,
          ...(onClick && {
            onClick: (e, handleClick) => {
              // If the original onClick expects two arguments, call as is
              if (onClick.length >= 2) {
                return onClick(e, handleClick);
              }
              // Otherwise, call with just the event
              return onClick(e);
            },
          }),
        })),
      ]}
    />
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
  hasSystemPurpose: PropTypes.bool,
  hasWorkspace: PropTypes.bool,
  hasCPUs: PropTypes.bool,
  hasSockets: PropTypes.bool,
  hasCores: PropTypes.bool,
  hasCPUFlags: PropTypes.bool,
  hasRAM: PropTypes.bool,
  extra: PropTypes.arrayOf(extraShape),
};

export default SystemCard;
