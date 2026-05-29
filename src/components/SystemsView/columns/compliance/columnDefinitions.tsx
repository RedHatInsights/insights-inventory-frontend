import React from 'react';
import type { Column } from '../allColumnDefinitions';
import { InventoryViewHost } from '../../hooks/useInventoryViewsQuery';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { Link } from 'react-router-dom';

const lastComplianceScanColumn = {
  title: 'Last compliance scan',
  key: 'last_compliance_scan',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.CompliancelastScan,
  renderCell: (system: InventoryViewHost) => {
    const lastScan = system?.app_data?.compliance?.last_scan;
    return lastScan !== null && lastScan !== undefined ? (
      <DateFormat date={lastScan} />
    ) : (
      'N/A'
    );
  },
};

const policiesColumn = {
  title: 'Policies',
  key: 'policies',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewHost) => {
    const count = system?.app_data?.compliance?.policies?.length;
    return count !== null && count !== undefined ? (
      <Link to="/insights/compliance/reports">{count}</Link>
    ) : (
      'N/A'
    );
  },
};

export default [
  policiesColumn,
  lastComplianceScanColumn,
] as const satisfies readonly Column[];
