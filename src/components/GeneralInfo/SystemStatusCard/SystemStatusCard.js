import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LoadingCard, { getDefaultColumnModifier } from '../LoadingCard';
import DateFormat from '@redhat-cloud-services/frontend-components/DateFormat';
import { systemStatus } from '../selectors';

const SystemStatusCardCore = ({
  detailLoaded = false,
  hasState = true,
  hasRegistered = true,
  hasLastCheckIn = true,
  hasLastUpdated = true,
  entity,
}) => {
  const status = systemStatus(entity);
  const items = [
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
            value: entity && <DateFormat date={entity.created} type="exact" />,
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
  ];
  return (
    <LoadingCard
      title="System status"
      cardId="system-status-card"
      isLoading={!detailLoaded}
      columnModifier={getDefaultColumnModifier(items)}
      items={items}
    />
  );
};

SystemStatusCardCore.propTypes = {
  detailLoaded: PropTypes.bool,
  entity: PropTypes.shape({
    updated: PropTypes.string,
    created: PropTypes.string,
  }),
  handleClick: PropTypes.func,
  hasState: PropTypes.bool,
  hasLastCheckIn: PropTypes.bool,
  hasRegistered: PropTypes.bool,
};

export const SystemStatusCard = connect(
  ({ systemProfileStore: { systemProfile } }) => ({
    detailLoaded: systemProfile?.loaded,
  }),
)(SystemStatusCardCore);

SystemStatusCard.propTypes = SystemStatusCardCore.propTypes;

export default SystemStatusCard;
