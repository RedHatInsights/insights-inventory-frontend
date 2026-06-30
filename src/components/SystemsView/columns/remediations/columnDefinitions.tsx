import type { Column } from '../allColumnDefinitions';
import { InventoryViewSystem } from '../../hooks/useInventoryViewsQuery';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import CellValue from '../CellValue';
import React from 'react';

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
    <CellValue value={system?.app_data?.remediations?.remediations_plans} />
  ),
};

export default [remediationPlansColumn] as const satisfies readonly Column[];
