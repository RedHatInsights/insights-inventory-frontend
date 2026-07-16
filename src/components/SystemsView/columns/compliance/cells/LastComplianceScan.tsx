import React from 'react';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { ComplianceAppData } from '@redhat-cloud-services/host-inventory-client';
import CellValue from '../../CellValue';

const COMPLIANCE_DATA_NOT_AVAILABLE =
  'Compliance data has not been collected for this system';

interface LastComplianceScanProps {
  appData: ComplianceAppData | undefined;
}

const LastComplianceScan = ({ appData }: LastComplianceScanProps) => {
  if (!appData) {
    return (
      <CellValue type="notAvailable" reason={COMPLIANCE_DATA_NOT_AVAILABLE} />
    );
  }

  const lastScan = appData.last_scan;

  if (lastScan === null || lastScan === undefined) {
    return (
      <CellValue
        type="notAvailable"
        reason="Last compliance scan is not available for this system"
      />
    );
  }

  return <CellValue type="present" value={<DateFormat date={lastScan} />} />;
};

export default LastComplianceScan;
