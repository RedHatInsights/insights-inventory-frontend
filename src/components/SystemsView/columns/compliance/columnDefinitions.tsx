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
  key: ApiHostViewsGetHostViewsOrderByEnum.CompliancelastScan,
  minWidth: '12rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.CompliancelastScan,
  renderCell: (system: InventoryViewSystem) => (
    <LastComplianceScan appData={system?.app_data?.compliance} />
  ),
};

const policiesColumn = {
  appName: APP_NAME,
  title: 'Policies',
  key: ApiHostViewsGetHostViewsOrderByEnum.CompliancepoliciesCount,
  minWidth: '7rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.CompliancepoliciesCount,
  renderCell: (system: InventoryViewSystem) => (
    <Policies appData={system?.app_data?.compliance} />
  ),
};

export default [
  policiesColumn,
  lastComplianceScanColumn,
] as const satisfies readonly Column[];
