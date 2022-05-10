/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import { systemStatusSelector } from '../selectors';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';

const SystemStatusCard = ({
    detailLoaded,
    hasState,
    hasRegistered,
    hasLastCheckIn,
    hasRHC,
    entity,
    systemProfile
}) => (
    <LoadingCard
        title="System status"
        isLoading={ !detailLoaded }
        items={
            [
                ...hasState ? [{
                    title: 'Current state',
                    value: hasState ? 'Active' : 'Stale'
                }] : [],
                ...hasRegistered ? [{ title: 'Registered', value: entity && (
                    DateFormat ?
                        <DateFormat date={entity.created} type="exact" /> :
                        new Date(entity.created).toLocaleString()
                ) }] : [],
                ...hasLastCheckIn ? [{ title: 'Last upload', value: entity && (
                    DateFormat ?
                        <DateFormat date={ entity.updated } type="exact" /> :
                        new Date(entity.updated).toLocaleString()
                ) }] : [],
                ...hasRHC ? [{
                    title: 'RHC',
                    value: systemProfile && systemProfile.rhc_client_id ? 'Connected' : 'Not available'
                }] : []
            ]
        }
    />);

SystemStatusCard.propTypes = {
    detailLoaded: PropTypes.bool,
    entity: PropTypes.shape({
        updated: PropTypes.string,
        created: PropTypes.string
    }),
    systemProfile: PropTypes.shape({
        rhc_client_id: PropTypes.string
    }),
    handleClick: PropTypes.func,
    hasState: PropTypes.bool,
    hasLastCheckIn: PropTypes.bool,
    hasRegistered: PropTypes.bool,
    hasRHC: PropTypes.bool
};
SystemStatusCard.defaultProps = {
    detailLoaded: false,
    handleClick: () => undefined,
    hasState: true,
    hasLastCheckIn: true,
    hasRegistered: true,
    hasRHC: true
};

export default connect(({
    entityDetails: {
        entity
    },
    systemProfileStore: {
        systemProfile
    }
}) => ({
    entity,
    systemProfile,
    detailLoaded: systemProfile && systemProfile.loaded,
    infrastructure: systemStatusSelector(systemProfile, entity)
}))(SystemStatusCard);
