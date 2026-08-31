import React from 'react';
import { CullingInformation } from '@redhat-cloud-services/frontend-components/CullingInfo';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { verifyCulledReporter } from '../../../../../Utilities/sharedFunctions';
import InsightsDisconnected from '../../../../../Utilities/InsightsDisconnected';
import { REPORTER_PUPTOO } from '../../../../../Utilities/constants';
import CellValue from '../../CellValue';

type CullingDate = string | number | Date;

const DEFAULT_CULLING_DATE: CullingDate = new Date(0);

export type LastSeenValue = {
  lastSeen?: string | null;
  culled?: string;
  stale?: string;
  staleWarning?: string;
  perReporterStaleness?: unknown;
};

interface LastSeenProps {
  value: LastSeenValue;
}

const LastSeen = ({ value }: LastSeenProps) => {
  const { lastSeen, culled, staleWarning, stale, perReporterStaleness } = value;

  if (lastSeen === undefined || lastSeen === null) {
    return (
      <CellValue
        type="notAvailable"
        reason="Last seen date is not available for this system"
      />
    );
  }

  const presentValue = (
    <CullingInformation
      className=""
      content=""
      culled={culled ?? DEFAULT_CULLING_DATE}
      staleWarning={staleWarning ?? DEFAULT_CULLING_DATE}
      stale={stale ?? DEFAULT_CULLING_DATE}
      currDate={DEFAULT_CULLING_DATE}
      render={({ msg }) => (
        <React.Fragment>
          <DateFormat
            date={lastSeen}
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
        <DateFormat date={lastSeen} />
      </span>
    </CullingInformation>
  );

  return <CellValue type="present" value={presentValue} />;
};

export default LastSeen;
