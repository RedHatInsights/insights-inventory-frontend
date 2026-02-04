import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
//import TitleWithPopover from '../TitleWithPopover';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { systemStatus } from '../selectors';
//import { RHC_TOOLTIP_MESSAGE } from '../../../constants';

const SystemStatusCardCore = ({
  detailLoaded = false,
  hasState = true,
  hasRegistered = true,
  hasLastCheckIn = true,
  hasLastUpdated = true,
  //hasRHC = true,
  entity,
  //systemProfile,
}) => {
  const status = systemStatus(entity);
  return (
    <LoadingCard
      title="System status"
      cardId="system-status-card"
      isLoading={!detailLoaded}
      items={[
        ...(hasState
          ? [
              {
                title: 'Current state',
                value: status.stale ? 'Stale' : 'Active',
              },
            ]
          : []),
        ...(hasRegistered
          ? [
              {
                title: 'Registered',
                value: entity && (
                  <DateFormat date={entity.created} type="exact" />
                ),
              },
            ]
          : []),
        ...(hasLastCheckIn
          ? [
              {
                title: 'Last seen',
                value:
                  entity && entity.per_reporter_staleness ? (
                    <DateFormat
                      date={
                        Object.values(entity?.per_reporter_staleness)
                          .map((reporter) => reporter.last_check_in)
                          .sort()
                          .reverse()[0]
                      }
                      type="exact"
                    />
                  ) : (
                    'Not available'
                  ),
              },
            ]
          : []),
        // Temporarily disabled until we have a way to properly detect RHC connectivity or remove it altogether
        /*...(hasRHC
          ? [
              {
                title: (
                  <TitleWithPopover
                    title="RHC"
                    content={RHC_TOOLTIP_MESSAGE}
                    headerContent="RHC (Remote host configuration)"
                  />
                ),
                value: systemProfile?.rhc_client_id
                  ? 'Connected'
                  : 'Not available',
              },
            ]
          : []),*/
        ...(hasLastUpdated
          ? [
              {
                title: 'Last updated',
                value:
                  entity && entity.updated ? (
                    <DateFormat date={entity.updated} type="exact" />
                  ) : (
                    'Not available'
                  ),
              },
            ]
          : []),
      ]}
    />
  );
};

SystemStatusCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  entity: PropTypes.shape({
    updated: PropTypes.string,
    created: PropTypes.string,
  }),
  /*systemProfile: PropTypes.shape({
    rhc_client_id: PropTypes.string,
  }),*/
  handleClick: PropTypes.func,
  hasState: PropTypes.bool,
  hasLastCheckIn: PropTypes.bool,
  hasRegistered: PropTypes.bool,
  //hasRHC: PropTypes.bool,
};

export const SystemStatusCard = connect(
  ({ systemProfileStore: { systemProfile } }) => ({
    //systemProfile,
    detailLoaded: systemProfile?.loaded,
  }),
)(SystemStatusCardCore);

SystemStatusCard.propTypes = SystemStatusCardCore.propTypes;

export default SystemStatusCard;
