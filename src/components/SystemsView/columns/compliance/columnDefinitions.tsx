import React from 'react';
import type { Column } from '../allColumnDefinitions';
import { InventoryViewSystem } from '../../hooks/useInventoryViewsQuery';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import { Link } from 'react-router-dom';

const APP_NAME = 'compliance' as const;

const lastComplianceScanColumn = {
  appName: APP_NAME,
  title: 'Last compliance scan',
  key: 'last_compliance_scan',
  minWidth: '12rem',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.CompliancelastScan,
  renderCell: (system: InventoryViewSystem) => {
    const lastScan = system?.app_data?.compliance?.last_scan;
    return lastScan !== null && lastScan !== undefined ? (
      <DateFormat date={lastScan} />
    ) : (
      'N/A'
    );
  },
};

const policiesColumn = {
  appName: APP_NAME,
  title: 'Policies',
  key: 'policies',
  minWidth: '7rem',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) => {
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
