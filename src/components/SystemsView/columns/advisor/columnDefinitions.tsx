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

export default [
  recommendationsColumn,
  incidentsColumn,
] as const satisfies readonly Column[];
