import React from 'react';
import { Label, LabelGroup } from '@patternfly/react-core';
import CellValue from '../../CellValue';
import {
  registered,
  REPORTER_RHSM_CONDUIT,
  REPORTER_RHSM_PROFILE_BRIDGE,
} from '../../../../../Utilities/constants';

type PerReporterStaleness =
  | {
      [reporter: string]: unknown;
    }
  | undefined
  | null;

interface DataCollectorProps {
  value: PerReporterStaleness;
}

const REPORTER_LABELS: Record<string, string> = registered
  .filter((reporter) => !reporter.value.startsWith('!'))
  .reduce<Record<string, string>>((labels, reporter) => {
    labels[reporter.value] = reporter.label;
    return labels;
  }, {});

REPORTER_LABELS[REPORTER_RHSM_PROFILE_BRIDGE] =
  REPORTER_LABELS[REPORTER_RHSM_CONDUIT];

const DataCollector = ({ value }: DataCollectorProps) => {
  const collectors = Array.from(
    new Set(
      Object.keys(value ?? {}).map(
        (reporter) => REPORTER_LABELS[reporter] ?? reporter,
      ),
    ),
  );

  if (collectors.length === 0) {
    return (
      <CellValue
        type="notAvailable"
        reason="Data collector information is not available for this system"
      />
    );
  }

  return (
    <CellValue
      type="present"
      value={
        <LabelGroup numLabels={1} isCompact aria-label="Data collectors">
          {collectors.map((collector) => (
            <Label key={collector} isCompact>
              {collector}
            </Label>
          ))}
        </LabelGroup>
      }
    />
  );
};

export default DataCollector;
