/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { systemStatus } from '../selectors';

const SystemStatusCardCore = ({
    detailLoaded,
    hasState,
    hasRegistered,
    hasLastCheckIn,
    hasRHC,
    entity,
    systemProfile,
    systemStatus
}) => (
    <LoadingCard
        title="System status"
        isLoading={ !detailLoaded }
        items={
            [
                ...hasState ? [{
                    title: 'Current state',
                    value: systemStatus.stale ? 'Stale' : 'Active'
                }] : [],
                ...hasRegistered ? [{ title: 'Registered', value: entity && (
                    <DateFormat date={entity.created} type="exact" />
                ) }] : [],
                ...hasLastCheckIn ? [{ title: 'Last upload', value: entity && (
                    <DateFormat date={ entity.updated } type="exact" />
                ) }] : [],
                ...hasRHC ? [{
                    title: 'RHC',
                    value: systemProfile?.rhc_client_id ? 'Connected' : 'Not available'
                }] : []
            ]
        }
    />);

SystemStatusCardCore.propTypes = {
    detailLoaded: PropTypes.bool,
    entity: PropTypes.shape({
        updated: PropTypes.string,
        created: PropTypes.string
    }),
    systemProfile: PropTypes.shape({
        rhc_client_id: PropTypes.string
    }),
    systemStatus: PropTypes.object,
    handleClick: PropTypes.func,
    hasState: PropTypes.bool,
    hasLastCheckIn: PropTypes.bool,
    hasRegistered: PropTypes.bool,
    hasRHC: PropTypes.bool
};
SystemStatusCardCore.defaultProps = {
    detailLoaded: false,
    systemStatus: {},
    handleClick: () => undefined,
    hasState: true,
    hasLastCheckIn: true,
    hasRegistered: true,
    hasRHC: true
};

export const SystemStatusCard = connect(({
    entityDetails: {
        entity
    },
    systemProfileStore: {
        systemProfile
    }
}) => ({
    entity,
    systemProfile,
    detailLoaded: systemProfile?.loaded,
    systemStatus: systemStatus(entity)
}))(SystemStatusCardCore);

SystemStatusCard.propTypes = SystemStatusCardCore.propTypes;
SystemStatusCard.defaultProps = SystemStatusCardCore.defaultProps;

export default SystemStatusCard;
