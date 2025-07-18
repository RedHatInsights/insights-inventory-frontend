import React from 'react';
import { CullingInformation } from '@redhat-cloud-services/frontend-components/CullingInfo';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { verifyCulledReporter } from '../../../../../../Utilities/sharedFunctions';
import InsightsDisconnected from '../../../../../../Utilities/InsightsDisconnected';
import { REPORTER_PUPTOO } from '../../../../../../Utilities/constants';
import PropTypes from 'prop-types';

const LastSeen = ({
  updated,
  culled_timestamp: culled,
  stale_warning_timestamp: staleWarn,
  stale_timestamp: stale,
  per_reporter_staleness: perReporterStaleness,
}) => (
  <CullingInformation
    culled={culled}
    staleWarning={staleWarn}
    stale={stale}
    render={({ msg }) => (
      <React.Fragment>
        <DateFormat
          date={updated}
          extraTitle={
            <React.Fragment>
              <div>{msg}</div>
              Last seen:{` `}
            </React.Fragment>
          }
        />
        {verifyCulledReporter(perReporterStaleness, REPORTER_PUPTOO) && (
          <InsightsDisconnected />
        )}
      </React.Fragment>
    )}
  >
    {' '}
    <DateFormat date={updated} />{' '}
  </CullingInformation>
);

const datePropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
  PropTypes.instanceOf(Date),
]);

LastSeen.propTypes = {
  updated: datePropType,
  culled_timestamp: datePropType,
  stale_warning_timestamp: datePropType,
  stale_timestamp: datePropType,
  per_reporter_staleness: PropTypes.objectOf(
    PropTypes.shape({
      stale_timestamp: datePropType,
    }),
  ),
};

export default LastSeen;
