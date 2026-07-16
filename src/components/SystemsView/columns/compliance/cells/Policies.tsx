import React from 'react';
import { ComplianceAppData } from '@redhat-cloud-services/host-inventory-client';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import CellValue from '../../CellValue';

const COMPLIANCE_DATA_NOT_AVAILABLE =
  'Compliance data has not been collected for this system';

interface PoliciesProps {
  appData: ComplianceAppData | undefined;
}

const Policies = ({ appData }: PoliciesProps) => {
  if (!appData) {
    return (
      <CellValue type="notAvailable" reason={COMPLIANCE_DATA_NOT_AVAILABLE} />
    );
  }

  const policies = appData.policies;

  if (policies === null || policies === undefined) {
    return (
      <CellValue
        type="notAvailable"
        reason="Policies are not available for this system"
      />
    );
  }

  const count = policies.length;

  return (
    <CellValue
      type="present"
      value={
        <InsightsLink
          app="compliance"
          to={{ pathname: '/reports' }}
          preview={false}
        >
          {count}
        </InsightsLink>
      }
    />
  );
};

export default Policies;
