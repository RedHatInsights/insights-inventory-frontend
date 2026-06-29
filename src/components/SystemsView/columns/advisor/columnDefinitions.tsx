import type { Column } from '../allColumnDefinitions';
import { InventoryViewSystem } from '../../hooks/useInventoryViewsQuery';

import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';

const APP_NAME = 'advisor' as const;

const recommendationsColumn = {
  appName: APP_NAME,
  title: 'Recommendations',
  key: 'recommendations',
  minWidth: '10rem',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorrecommendations,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.recommendations ?? 'N/A',
};

const incidentsColumn = {
  appName: APP_NAME,
  title: 'Incidents',
  key: 'incidents',
  minWidth: '7rem',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.incidents ?? 'N/A',
};

const criticalColumn = {
  appName: APP_NAME,
  title: 'Critical',
  key: 'critical',
  minWidth: '7rem',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.critical ?? 'N/A',
};

const importantColumn = {
  appName: APP_NAME,
  title: 'Important',
  key: 'important',
  minWidth: '7rem',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.important ?? 'N/A',
};

const moderateColumn = {
  appName: APP_NAME,
  title: 'Moderate',
  key: 'moderate',
  minWidth: '7rem',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.moderate ?? 'N/A',
};

const lowColumn = {
  appName: APP_NAME,
  title: 'Low',
  key: 'low',
  minWidth: '6rem',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.low ?? 'N/A',
};

export default [
  recommendationsColumn,
  incidentsColumn,
  criticalColumn,
  importantColumn,
  moderateColumn,
  lowColumn,
] as const satisfies readonly Column[];
