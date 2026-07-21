import React from 'react';
import type { Column } from '../allColumnDefinitions';
import { InventoryViewSystem } from '../../../InventoryViews/hooks/useInventoryViewsQuery';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import LastComplianceScan from './cells/LastComplianceScan';
import Policies from './cells/Policies';

const APP_NAME = 'compliance' as const;

const lastComplianceScanColumn = {
  appName: APP_NAME,
  title: 'Last compliance scan',
  key: 'last_compliance_scan',
  minWidth: '12rem',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.CompliancelastScan,
  renderCell: (system: InventoryViewSystem) => (
    <LastComplianceScan appData={system?.app_data?.compliance} />
  ),
};

const policiesColumn = {
  appName: APP_NAME,
  title: 'Policies',
  key: 'policies',
  minWidth: '7rem',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) => (
    <Policies appData={system?.app_data?.compliance} />
  ),
};

export default [
  policiesColumn,
  lastComplianceScanColumn,
] as const satisfies readonly Column[];
