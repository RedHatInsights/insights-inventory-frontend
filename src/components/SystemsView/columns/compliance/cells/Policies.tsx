import React from 'react';
import { ComplianceAppData } from '@redhat-cloud-services/host-inventory-client';
import InsightsLink from '@redhat-cloud-services/frontend-components/InsightsLink';
import CellValue from '../../CellValue';

interface PoliciesProps {
  appData: ComplianceAppData | undefined;
}

const Policies = ({ appData }: PoliciesProps) => {
  const count = appData?.policies?.length;
  const value =
    count !== null && count !== undefined ? (
      <InsightsLink
        app="compliance"
        to={{ pathname: '/reports' }}
        preview={false}
      >
        {count}
      </InsightsLink>
    ) : null;

  return <CellValue value={appData ? value : undefined} />;
};

export default Policies;
