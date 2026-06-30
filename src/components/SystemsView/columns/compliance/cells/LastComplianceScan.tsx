import React from 'react';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { ComplianceAppData } from '@redhat-cloud-services/host-inventory-client';
import CellValue from '../../CellValue';

interface LastComplianceScanProps {
  appData: ComplianceAppData | undefined;
}

const LastComplianceScan = ({ appData }: LastComplianceScanProps) => {
  const lastScan = appData?.last_scan;
  const value =
    lastScan !== null && lastScan !== undefined ? (
      <DateFormat date={lastScan} />
    ) : null;

  return <CellValue value={appData ? value : undefined} />;
};

export default LastComplianceScan;
