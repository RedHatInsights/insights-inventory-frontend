import React from 'react';
import { CullingInformation } from '@redhat-cloud-services/frontend-components/CullingInfo';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { verifyCulledReporter } from '../../../../../Utilities/sharedFunctions';
import InsightsDisconnected from '../../../../../Utilities/InsightsDisconnected';
import { REPORTER_PUPTOO } from '../../../../../Utilities/constants';
import CellValue from '../../CellValue';
import { System } from '../../../../InventoryViews/hooks/useHostsQuery';

type CullingDate = string | number | Date;

const DEFAULT_CULLING_DATE: CullingDate = new Date(0);

export type LastSeenValue = Pick<
  System,
  | 'culled_timestamp'
  | 'stale_warning_timestamp'
  | 'stale_timestamp'
  | 'per_reporter_staleness'
  | 'last_check_in'
>;
interface LastSeenProps {
  value: LastSeenValue;
}

const LastSeen = ({ value }: LastSeenProps) => {
  const {
    last_check_in: updated,
    culled_timestamp: culled,
    stale_warning_timestamp: staleWarn,
    stale_timestamp: stale,
    per_reporter_staleness: perReporterStaleness,
  } = value;

  if (updated === undefined || updated === null) {
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
      staleWarning={staleWarn ?? DEFAULT_CULLING_DATE}
      stale={stale ?? DEFAULT_CULLING_DATE}
      currDate={DEFAULT_CULLING_DATE}
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
      <span>
        <DateFormat date={updated} />
      </span>
    </CullingInformation>
  );

  return <CellValue type="present" value={presentValue} />;
};

export default LastSeen;
