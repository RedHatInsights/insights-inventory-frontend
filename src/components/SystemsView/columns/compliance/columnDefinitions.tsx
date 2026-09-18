import React from 'react';
import type { Column, ColumnSpec } from '../types';
import { bindColumn } from '../bindColumn';
import type { InventoryBindableItem } from '../inventory/columnDefinitions';
import type { ComplianceAppData } from '@redhat-cloud-services/host-inventory-client';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import LastComplianceScan from './cells/LastComplianceScan';
import Policies from './cells/Policies';

const APP_NAME = 'compliance' as const;

const lastComplianceScanSpec: ColumnSpec<ComplianceAppData | undefined> = {
  appName: APP_NAME,
  title: 'Last compliance scan',
  key: ApiHostViewsGetHostViewsOrderByEnum.CompliancelastScan,
  minWidth: '12rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.CompliancelastScan,
  renderCell: (value) => <LastComplianceScan appData={value} />,
};

const policiesSpec: ColumnSpec<ComplianceAppData | undefined> = {
  appName: APP_NAME,
  title: 'Policies',
  key: ApiHostViewsGetHostViewsOrderByEnum.CompliancepoliciesCount,
  minWidth: '9rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.CompliancepoliciesCount,
  renderCell: (value) => <Policies appData={value} />,
};

export const bindComplianceColumns = <
  TItem extends InventoryBindableItem,
>(): Column<TItem>[] => [
  bindColumn(policiesSpec, {
    getValue: (item) =>
      item.app_data?.compliance as ComplianceAppData | undefined,
  }),
  bindColumn(lastComplianceScanSpec, {
    getValue: (item) =>
      item.app_data?.compliance as ComplianceAppData | undefined,
  }),
];
