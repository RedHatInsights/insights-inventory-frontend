import React from 'react';
import { CullingInformation } from '@redhat-cloud-services/frontend-components/CullingInfo';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { verifyCulledReporter } from '../../../../../../Utilities/sharedFunctions';
import InsightsDisconnected from '../../../../../../Utilities/InsightsDisconnected';
import { REPORTER_PUPTOO } from '../../../../../../Utilities/constants';

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

export default LastSeen;
