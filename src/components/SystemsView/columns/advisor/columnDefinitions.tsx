import type { Column } from '../allColumnDefinitions';
import { InventoryViewSystem } from '../../hooks/useInventoryViewsQuery';

import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import CellValue from '../CellValue';
import React from 'react';

const APP_NAME = 'advisor' as const;

const recommendationsColumn = {
  appName: APP_NAME,
  title: 'Recommendations',
  key: 'recommendations',
  minWidth: '10rem',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorrecommendations,
  renderCell: (system: InventoryViewSystem) => (
    <CellValue value={system?.app_data?.advisor?.recommendations} />
  ),
};

const incidentsColumn = {
  appName: APP_NAME,
  title: 'Incidents',
  key: 'incidents',
  minWidth: '7rem',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
  renderCell: (system: InventoryViewSystem) => (
    <CellValue value={system?.app_data?.advisor?.incidents} />
  ),
};

const criticalColumn = {
  appName: APP_NAME,
  title: 'Critical',
  key: 'critical',
  minWidth: '7rem',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) => (
    <CellValue value={system?.app_data?.advisor?.critical} />
  ),
};

const importantColumn = {
  appName: APP_NAME,
  title: 'Important',
  key: 'important',
  minWidth: '7rem',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) => (
    <CellValue value={system?.app_data?.advisor?.important} />
  ),
};

const moderateColumn = {
  appName: APP_NAME,
  title: 'Moderate',
  key: 'moderate',
  minWidth: '7rem',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) => (
    <CellValue value={system?.app_data?.advisor?.moderate} />
  ),
};

const lowColumn = {
  appName: APP_NAME,
  title: 'Low',
  key: 'low',
  minWidth: '6rem',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) => (
    <CellValue value={system?.app_data?.advisor?.low} />
  ),
};

export default [
  recommendationsColumn,
  incidentsColumn,
  criticalColumn,
  importantColumn,
  moderateColumn,
  lowColumn,
] as const satisfies readonly Column[];
