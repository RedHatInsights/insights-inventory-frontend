import React from 'react';
import type { Column, ColumnSpec } from '../types';
import { bindColumn } from '../bindColumn';
import type { InventoryBindableItem } from '../inventory/columnDefinitions';
import type { RemediationsAppData } from '@redhat-cloud-services/host-inventory-client';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import RemediationPlans from './cells/RemediationPlans';

const APP_NAME = 'remediations' as const;

const remediationPlansSpec: ColumnSpec<RemediationsAppData | undefined> = {
  appName: APP_NAME,
  title: 'Remediation plans',
  key: ApiHostViewsGetHostViewsOrderByEnum.RemediationsremediationsPlans,
  minWidth: '12rem',
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.RemediationsremediationsPlans,
  renderCell: (value) => <RemediationPlans appData={value} />,
};

export const bindRemediationsColumns = <
  TItem extends InventoryBindableItem,
>(): Column<TItem>[] => [
  bindColumn(remediationPlansSpec, {
    getValue: (item) =>
      item.app_data?.remediations as RemediationsAppData | undefined,
  }),
];
