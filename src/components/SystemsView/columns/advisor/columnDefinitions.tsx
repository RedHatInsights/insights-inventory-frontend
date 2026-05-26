import React from 'react';
import type { Column } from '../allColumnDefinitions';
import { InventoryViewHost } from '../../hooks/useInventoryViewsQuery';

import Recommendations from './cells/Recommendations';
import Moderate from './cells/Moderate';
import Low from './cells/Low';
import Incidents from './cells/Incidents';
import Important from './cells/Important';
import Critical from './cells/Critical';

import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';

const recommendationsColumn = {
  title: 'Recommendations',
  key: 'recommendations',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorrecommendations,
  renderCell: (system: InventoryViewHost) => (
    <Recommendations key={`recommendations-${system.id}`} system={system} />
  ),
};

const incidentsColumn = {
  title: 'Incidents',
  key: 'incidents',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.Advisorincidents,
  renderCell: (system: InventoryViewHost) => (
    <Incidents key={`incidents-${system.id}`} system={system} />
  ),
};

const criticalColumn = {
  title: 'Critical',
  key: 'critical',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewHost) => (
    <Critical key={`critical-${system.id}`} system={system} />
  ),
};

const importantColumn = {
  title: 'Important',
  key: 'important',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewHost) => (
    <Important key={`important-${system.id}`} system={system} />
  ),
};

const moderateColumn = {
  title: 'Moderate',
  key: 'moderate',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewHost) => (
    <Moderate key={`moderate-${system.id}`} system={system} />
  ),
};

const lowColumn = {
  title: 'Low',
  key: 'low',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewHost) => (
    <Low key={`low-${system.id}`} system={system} />
  ),
};

export default [
  recommendationsColumn,
  incidentsColumn,
  criticalColumn,
  importantColumn,
  moderateColumn,
  lowColumn,
  incidentsColumn,
] as const satisfies readonly Column[];
