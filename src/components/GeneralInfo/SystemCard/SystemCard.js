import React, { Component, Fragment, useState } from 'react';
import PropTypes from 'prop-types';
import LoadingCard from '../LoadingCard';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons';
import { propertiesSelector } from '../selectors';
import { editAnsibleHost, editDisplayName } from '../../../store/actions';
import TextInputModal from '../TextInputModal';
import { Button, Popover } from '@patternfly/react-core';
import EditButton from '../EditButton';
import { generalMapper } from '../dataMapper';
import { extraShape } from '../../../constants';
import { useSelector, dispatch } from 'react-redux';

const TitleWithPopover = ({ title, content }) => (
  <React.Fragment>
    <span>{title}</span>
    <Popover
      headerContent={<div>{title}</div>}
      bodyContent={<div>{content}</div>}
    >
      <Button
        variant="plain"
        aria-label={`Action for ${title}`}
        className="ins-active-general_information__popover-icon"
      >
        <OutlinedQuestionCircleIcon />
      </Button>
    </Popover>
  </React.Fragment>
);

const SystemCard = ({
    writePermissions,
    handleClick,
    hasHostName,
    hasDisplayName,
    hasAnsibleHostname,
    hasSAP,
    hasSystemPurpose,
    hasCPUs,
    hasSockets,
    hasCores,
    hasCPUFlags,
    hasRAM,
    extra
}) => {
    const [modalsState, setModalsState] = useState({
        isDisplayNameModalOpen: false,
        isAnsibleHostModalOpen: false
    });

    const entity = useSelector(({ entityDetails }) => entityDetails?.entity || {});
    const systemProfile = useSelector(({ systemProfileStore }) => systemProfileStore?.systemProfile);
    const detailLoaded = systemProfile ? systemProfile.loaded : false;
    const properties = propertiesSelector(systemProfile, entity) || {};

    const setDisplayName = (id, value, origValue) => {
        dispatch(editDisplayName(id, value, origValue));
    };

    const setAnsibleHost = (id, value, origValue) => {
        dispatch(editAnsibleHost(id, value, origValue));
    };

    const onCancel = () => {
        setModalsState({
            isDisplayNameModalOpen: false,
            isAnsibleHostModalOpen: false
        });
    };

    const onSubmit = (fn, origValue) => (value) => {
        fn(entity.id, value, origValue);
        onCancel();
    };

    const onShowDisplayModal = (event) => {
        event.preventDefault();
        setModalsState({
            ...modalsState,
            isDisplayNameModalOpen: true
        });
    };

    const onShowAnsibleModal = (event) => {
        event.preventDefault();
        setModalsState({
            ...modalsState,
            isAnsibleHostModalOpen: true
        });
    };

    const getAnsibleHost = () => {
        return entity.ansible_host || entity.fqdn || entity.id;
    };

    const { isDisplayNameModalOpen, isAnsibleHostModalOpen } = modalsState;
    return (
        <Fragment>
            <LoadingCard
                title="System properties"
                isLoading={ !detailLoaded }
                items={ [
                    ...hasHostName ? [{
                        title: <TitleWithPopover
                            title='Host name'
                            content='Name imported from the system.'/>,
                        value: entity.fqdn, size: 'md'
                    }] : [],
                    ...hasDisplayName ? [{
                        title: <TitleWithPopover
                            title='Display name'
                            content='System name displayed in an inventory list.'/>,
                        value: (
                            <Fragment>
                                { entity.display_name }
                                <EditButton
                                    writePermissions={writePermissions}
                                    link="display_name"
                                    onClick={onShowDisplayModal}
                                />
                            </Fragment>
                        ), size: 'md'
                    }] : [],
                    ...hasAnsibleHostname ? [{
                        title: <TitleWithPopover
                            title='Ansible hostname'
                            content='Hostname that is used in playbooks by Remediations.'/>,
                        value: (
                            <Fragment>
                                { getAnsibleHost() }
                                <EditButton
                                    writePermissions={writePermissions}
                                    link="ansible_name"
                                    onClick={onShowAnsibleModal}
                                />
                            </Fragment>
                        ), size: 'md'
                    }] : [],
                    ...hasSAP ? [{
                        title: 'SAP',
                        value: properties.sapIds?.length,
                        singular: 'identifier',
                        target: 'sap_sids',
                        onClick: () => {
                            handleClick(
                                'SAP IDs (SID)',
                                generalMapper(properties.sapIds, 'SID')
                            );
                        }
                    }] : [],
                    ...hasSystemPurpose ? [{ title: 'System purpose', value: properties.systemPurpose }] : [],
                    ...hasCPUs ? [{ title: 'Number of CPUs', value: properties.cpuNumber }] : [],
                    ...hasSockets ? [{ title: 'Sockets', value: properties.sockets }] : [],
                    ...hasCores ? [{ title: 'Cores per socket', value: properties.coresPerSocket }] : [],
                    ...hasCPUFlags ? [{
                        title: 'CPU flags',
                        value: properties?.cpuFlags?.length,
                        singular: 'flag',
                        target: 'flag',
                        onClick: () => handleClick('CPU flags', generalMapper(properties.cpuFlags, 'flag name'))
                    }] : [],
                    ...hasRAM ? [{ title: 'RAM', value: properties.ramSize }] : [],
                    ...extra.map(({ onClick, ...item }) => ({
                        ...item,
                        ...onClick && { onClick: (e) => onClick(e, handleClick) }
                    }))
                ] }
            />
            <TextInputModal
                isOpen={ isDisplayNameModalOpen }
                title='Edit display name'
                value={ entity && entity.display_name }
                ariaLabel='Host inventory display name'
                modalOuiaId="edit-display-name-modal"
                cancelOuiaId="cancel-edit-display-name"
                confirmOuiaId="confirm-edit-display-name"
                inputOuiaId="input-edit-display-name"
                onCancel={ onCancel }
                onSubmit={ onSubmit(setDisplayName, entity && entity.display_name) }
                className ='sentry-mask data-hj-suppress'
            />
            <TextInputModal
                isOpen={ isAnsibleHostModalOpen }
                title='Edit Ansible host'
                value={ entity && getAnsibleHost() }
                ariaLabel='Ansible host'
                modalOuiaId="edit-ansible-name-modal"
                cancelOuiaId="cancel-edit-ansible-name"
                confirmOuiaId="confirm-edit-ansible-name"
                inputOuiaId="input-edit-ansible-name"
                onCancel={ onCancel }
                onSubmit={ onSubmit(setAnsibleHost, entity && getAnsibleHost()) }
                className ='sentry-mask data-hj-suppress'
            />
        </Fragment>
    );
};

SystemCard.propTypes = {
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
    extra: PropTypes.arrayOf(extraShape)
};

SystemCard.defaultProps = {
    detailLoaded: false,
    entity: {},
    properties: {},
    hasHostName: true,
    hasDisplayName: true,
    hasAnsibleHostname: true,
    hasSAP: true,
    hasSystemPurpose: true,
    hasCPUs: true,
    hasSockets: true,
    hasCores: true,
    hasCPUFlags: true,
    hasRAM: true,
    extra: []
};

TitleWithPopover.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

export default SystemCard;
