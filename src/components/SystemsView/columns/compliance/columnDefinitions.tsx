import React from 'react';
import type { Column } from '../allColumnDefinitions';
import { InventoryViewHost } from '../../hooks/useInventoryViewsQuery';
import { DateFormat } from '@redhat-cloud-services/frontend-components/DateFormat';
import { ApiHostViewsGetHostViewsOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';

const lastScannedColumn = {
  title: 'Last compliance scanned',
  key: 'last_scanned',
  isShownByDefault: false,
  isShown: false,
  sortBy: ApiHostViewsGetHostViewsOrderByEnum.CompliancelastScan,
  renderCell: (system: InventoryViewHost) => {
    const lastScan = system?.app_data?.compliance?.last_scan;
    return lastScan != null ? <DateFormat date={lastScan} /> : 'N/A';
  },
};

const policiesColumn = {
  title: 'Policies',
  key: 'policies',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewHost) =>
    system?.app_data?.compliance?.policies?.length ?? 'N/A',
};

export default [
  policiesColumn,
  lastScannedColumn,
] as const satisfies readonly Column[];
