import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { propertiesSelector } from '../selectors';
import { editAnsibleHost, editDisplayName } from '../../../store/actions';
import TitleWithPopover from '../TitleWithPopover';
import { generalMapper } from '../dataMapper';
import { extraShape } from '../../../constants';
import { NameInlineEdit } from './NameInlineEdit';

class SystemCardCore extends Component {
  onSubmit = (fn, origValue) => (value) => {
    const { entity } = this.props;
    fn(entity.id, value, origValue);
  };

  getAnsibleHost = () => {
    const { entity } = this.props;
    return entity.ansible_host || entity.fqdn || entity.id;
  };

  render() {
    const {
      detailLoaded,
      entity,
      properties,
      setDisplayName,
      setAnsibleHost,
      writePermissions,
      handleClick,
      hasHostName,
      hasDisplayName,
      hasAnsibleHostname,
      hasWorkspace,
      hasSAP,
      hasSystemPurpose,
      hasCPUs,
      hasSockets,
      hasCores,
      hasCPUFlags,
      hasRAM,
      extra,
    } = this.props;

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
                      <NameInlineEdit
                        textValue={entity.display_name}
                        onSubmit={this.onSubmit(setDisplayName)}
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
                        textValue={this.getAnsibleHost()}
                        writePermissions={writePermissions}
                        onSubmit={this.onSubmit(setAnsibleHost)}
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
                      entity.groups?.length > 0 && entity.groups?.[0]?.name,
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
                        generalMapper(properties.sapIds, 'SID'),
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
                        generalMapper(properties.cpuFlags, 'flag name'),
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
      </Fragment>
    );
  }
}

SystemCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  entity: PropTypes.shape({
    display_name: PropTypes.string,

    ansible_host: PropTypes.string,
    fqdn: PropTypes.string,
    id: PropTypes.string,
  }),
  properties: PropTypes.shape({
    cpuNumber: PropTypes.number,
    sockets: PropTypes.number,
    coresPerSocket: PropTypes.number,
    ramSize: PropTypes.string,
    storage: PropTypes.arrayOf(
      PropTypes.shape({
        device: PropTypes.string,

        mount_point: PropTypes.string,
        options: PropTypes.shape({}),
        type: PropTypes.string,
      }),
    ),
    sapIds: PropTypes.arrayOf(PropTypes.string),
    systemPurpose: PropTypes.string,
    cpuFlags: PropTypes.array,
  }),
  setDisplayName: PropTypes.func,
  setAnsibleHost: PropTypes.func,
  writePermissions: PropTypes.bool,
  handleClick: PropTypes.func,
  hasHostName: PropTypes.bool,
  hasDisplayName: PropTypes.bool,
  hasAnsibleHostname: PropTypes.bool,
  hasSAP: PropTypes.bool,
  hasSystemPurpose: PropTypes.bool,
  hasCPUs: PropTypes.bool,
  hasSockets: PropTypes.bool,
  hasCores: PropTypes.bool,
  hasCPUFlags: PropTypes.bool,
  hasRAM: PropTypes.bool,
  extra: PropTypes.arrayOf(extraShape),
};
SystemCardCore.defaultProps = {
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

function mapDispatchToProps(dispatch) {
  return {
    setDisplayName: (id, value, origValue) => {
      dispatch(editDisplayName(id, value, origValue));
    },

    setAnsibleHost: (id, value, origValue) => {
      dispatch(editAnsibleHost(id, value, origValue));
    },
  };
}

export const SystemCard = connect(
  ({ entityDetails: { entity }, systemProfileStore: { systemProfile } }) => ({
    entity,
    detailLoaded: systemProfile && systemProfile.loaded,
    properties: propertiesSelector(systemProfile, entity),
  }),
  mapDispatchToProps,
)(SystemCardCore);

SystemCard.propTypes = SystemCardCore.propTypes;
SystemCard.defaultProps = SystemCardCore.defaultProps;

export default SystemCard;
