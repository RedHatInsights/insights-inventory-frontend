/* eslint-disable camelcase */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard from '../LoadingCard';
import TitleWithPopover from '../TitleWithPopover';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { systemStatus } from '../selectors';
import { RHC_TOOLTIP_MESSAGE } from '../../../constants';

const SystemStatusCardCore = ({
  detailLoaded,
  hasState,
  hasRegistered,
  hasLastCheckIn,
  hasLastUpdated,
  hasRHC,
  entity,
  systemProfile,
  systemStatus,
}) => (
  <LoadingCard
    title="System status"
    cardId="system-status-card"
    isLoading={!detailLoaded}
    items={[
      ...(hasState
        ? [
            {
              title: 'Current state',
              value: systemStatus.stale ? 'Stale' : 'Active',
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
      ...(hasRHC
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
        : []),
    ]}
  />
);

SystemStatusCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  entity: PropTypes.shape({
    updated: PropTypes.string,
    created: PropTypes.string,
  }),
  systemProfile: PropTypes.shape({
    rhc_client_id: PropTypes.string,
  }),
  systemStatus: PropTypes.object,
  handleClick: PropTypes.func,
  hasState: PropTypes.bool,
  hasLastCheckIn: PropTypes.bool,
  hasRegistered: PropTypes.bool,
  hasRHC: PropTypes.bool,
};
SystemStatusCardCore.defaultProps = {
  detailLoaded: false,
  systemStatus: {},
  handleClick: () => undefined,
  hasState: true,
  hasLastCheckIn: true,
  hasLastUpdated: true,
  hasRegistered: true,
  hasRHC: true,
};

export const SystemStatusCard = connect(
  ({ entityDetails: { entity }, systemProfileStore: { systemProfile } }) => ({
    entity,
    systemProfile,
    detailLoaded: systemProfile?.loaded,
    systemStatus: systemStatus(entity),
  })
)(SystemStatusCardCore);

SystemStatusCard.propTypes = SystemStatusCardCore.propTypes;
SystemStatusCard.defaultProps = SystemStatusCardCore.defaultProps;

export default SystemStatusCard;
