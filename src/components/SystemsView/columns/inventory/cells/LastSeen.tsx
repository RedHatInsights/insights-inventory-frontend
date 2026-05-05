import React from 'react';
import { CullingInformation } from '@redhat-cloud-services/frontend-components/CullingInfo';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { verifyCulledReporter } from '../../../../../Utilities/sharedFunctions';
import InsightsDisconnected from '../../../../../Utilities/InsightsDisconnected';
import { REPORTER_PUPTOO } from '../../../../../Utilities/constants';
import { System } from '../../../hooks/useSystemsQuery';

type CullingDate = string | number | Date;

const DEFAULT_CULLING_DATE: CullingDate = new Date(0);

interface LastSeenProps {
  system: System;
}

const LastSeen = ({ system }: LastSeenProps) => {
  const updated = system.last_check_in;
  const culled = system.culled_timestamp;
  const staleWarn = system.stale_warning_timestamp;
  const stale = system.stale_timestamp;
  const perReporterStaleness = system.per_reporter_staleness;

  const displayDate: string | number | Date =
    updated === undefined || updated === null ? '' : updated;

  return (
    <CullingInformation
      className=""
      content=""
      culled={culled ?? DEFAULT_CULLING_DATE}
      staleWarning={staleWarn ?? DEFAULT_CULLING_DATE}
      stale={stale ?? DEFAULT_CULLING_DATE}
      currDate={DEFAULT_CULLING_DATE}
      render={({ msg }) => (
        <React.Fragment>
          <DateFormat
            date={displayDate}
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
      <span>
        <DateFormat date={displayDate} />
      </span>
    </CullingInformation>
  );
};

export default LastSeen;
