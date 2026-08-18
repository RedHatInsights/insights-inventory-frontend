import React from 'react';
import type { Column } from '../allColumnDefinitions';
import { InventoryViewSystem } from '../../../InventoryViews/hooks/useInventoryViewsQuery';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import AdvisorCount from './cells/AdvisorCount';

const APP_NAME = 'advisor' as const;

const recommendationsColumn = {
  appName: APP_NAME,
  title: 'Recommendations',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorrecommendations,
  minWidth: '10rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorrecommendations,
  renderCell: (system: InventoryViewSystem) => (
    <AdvisorCount
      appData={system?.app_data?.advisor}
      countField="recommendations"
    />
  ),
};

const incidentsColumn = {
  appName: APP_NAME,
  title: 'Incidents',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
  minWidth: '7rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
  renderCell: (system: InventoryViewSystem) => (
    <AdvisorCount appData={system?.app_data?.advisor} countField="incidents" />
  ),
};

const criticalColumn = {
  appName: APP_NAME,
  title: 'Critical',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorcritical,
  minWidth: '7rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorcritical,
  renderCell: (system: InventoryViewSystem) => (
    <AdvisorCount appData={system?.app_data?.advisor} countField="critical" />
  ),
};

const importantColumn = {
  appName: APP_NAME,
  title: 'Important',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorimportant,
  minWidth: '7rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorimportant,
  renderCell: (system: InventoryViewSystem) => (
    <AdvisorCount appData={system?.app_data?.advisor} countField="important" />
  ),
};

const moderateColumn = {
  appName: APP_NAME,
  title: 'Moderate',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisormoderate,
  minWidth: '7rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisormoderate,
  renderCell: (system: InventoryViewSystem) => (
    <AdvisorCount appData={system?.app_data?.advisor} countField="moderate" />
  ),
};

const lowColumn = {
  appName: APP_NAME,
  title: 'Low',
  key: ApiHostViewsGetHostViewsOrderByEnum.Advisorlow,
  minWidth: '6rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorlow,
  renderCell: (system: InventoryViewSystem) => (
    <AdvisorCount appData={system?.app_data?.advisor} countField="low" />
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
