import React from 'react';
import { AdvisorAppData } from '@redhat-cloud-services/host-inventory-client';
import CellValue from '../../CellValue';

type AdvisorCountField = keyof AdvisorAppData;

const ADVISOR_DATA_NOT_AVAILABLE =
  'Advisor data has not been collected for this system';

interface AdvisorCountProps {
  appData: AdvisorAppData | undefined;
  countField: AdvisorCountField;
}

const AdvisorCount = ({ appData, countField }: AdvisorCountProps) => {
  if (!appData) {
    return (
      <CellValue type="notAvailable" reason={ADVISOR_DATA_NOT_AVAILABLE} />
    );
  }

  const count = appData[countField];

  if (count === null || count === undefined) {
    return (
      <CellValue
        type="notAvailable"
        reason="This Advisor count is not available for this system"
      />
    );
  }

  return <CellValue type="present" value={count} />;
};

export default AdvisorCount;
