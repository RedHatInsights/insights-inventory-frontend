import React from 'react';
import type { Column } from '../allColumnDefinitions';
import { InventoryViewSystem } from '../../../InventoryViews/inventoryViewsQueryOptions';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import RemediationPlans from './cells/RemediationPlans';

const APP_NAME = 'remediations' as const;

const remediationPlansColumn = {
  appName: APP_NAME,
  title: 'Remediation plans',
  key: ApiHostViewsGetHostViewsOrderByEnum.RemediationsremediationsPlans,
  minWidth: '12rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.RemediationsremediationsPlans,
  renderCell: (system: InventoryViewSystem) => (
    <RemediationPlans appData={system?.app_data?.remediations} />
  ),
};

export default [remediationPlansColumn] as const satisfies readonly Column[];
