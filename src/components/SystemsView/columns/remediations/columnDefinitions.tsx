import React from 'react';
import type { Column } from '../allColumnDefinitions';
import { InventoryViewSystem } from '../../../InventoryViews/hooks/useInventoryViewsQuery';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import RemediationPlans from './cells/RemediationPlans';

const APP_NAME = 'remediations' as const;

const remediationPlansColumn = {
  appName: APP_NAME,
  title: 'Remediation plans',
  key: 'remediations_plans',
  minWidth: '12rem',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.RemediationsremediationsPlans,
  renderCell: (system: InventoryViewSystem) => (
    <RemediationPlans appData={system?.app_data?.remediations} />
  ),
};

export default [remediationPlansColumn] as const satisfies readonly Column[];
