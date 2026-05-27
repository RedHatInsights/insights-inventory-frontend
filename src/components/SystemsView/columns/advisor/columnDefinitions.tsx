import type { Column } from '../allColumnDefinitions';
import { InventoryViewSystem } from '../../hooks/useInventoryViewsQuery';

import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';

const recommendationsColumn = {
  title: 'Recommendations',
  key: 'recommendations',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorrecommendations,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.recommendations ?? 'N/A',
};

const incidentsColumn = {
  title: 'Incidents',
  key: 'incidents',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.incidents ?? 'N/A',
};

const criticalColumn = {
  title: 'Critical',
  key: 'critical',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.critical ?? 'N/A',
};

const importantColumn = {
  title: 'Important',
  key: 'important',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.important ?? 'N/A',
};

const moderateColumn = {
  title: 'Moderate',
  key: 'moderate',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) =>
    system?.app_data?.advisor?.moderate ?? 'N/A',
};

const lowColumn = {
  title: 'Low',
  key: 'low',
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
