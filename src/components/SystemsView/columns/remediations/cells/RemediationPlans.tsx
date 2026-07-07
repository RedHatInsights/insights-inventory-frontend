import React from 'react';
import { RemediationsAppData } from '@redhat-cloud-services/host-inventory-client';
import CellValue from '../../CellValue';

const REMEDIATIONS_DATA_NOT_AVAILABLE =
  'Remediations data has not been collected for this system';

interface RemediationPlansProps {
  appData: RemediationsAppData | undefined;
}

const RemediationPlans = ({ appData }: RemediationPlansProps) => {
  if (!appData) {
    return (
      <CellValue type="notAvailable" reason={REMEDIATIONS_DATA_NOT_AVAILABLE} />
    );
  }

  const count = appData.remediations_plans;

  if (count === null || count === undefined) {
    return (
      <CellValue
        type="notAvailable"
        reason="Remediation plans count is not available for this system"
      />
    );
  }

  return <CellValue type="present" value={count} />;
};

export default RemediationPlans;
