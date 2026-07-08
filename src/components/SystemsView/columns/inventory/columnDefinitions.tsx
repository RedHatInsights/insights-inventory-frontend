import React from 'react';
import { ApiHostViewsGetHostViewsOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostViewsGetHostViews';
import DisplayName from './cells/DisplayName';
import Workspace from './cells/Workspace';
import LastSeen from './cells/LastSeen';
import OperatingSystem from './cells/OperatingSystem';
import Status from './cells/Status';
import Tags from './cells/Tags';
import Workload from './cells/Workload';
import Vendor from './cells/Vendor';
import Infrastructure from './cells/Infrastructure';
import Created from './cells/Created';
import { LastSeenColumnHeader } from '../../../../Utilities/LastSeenColumnHeader';
import { System } from '../../hooks/useSystemsQuery';
import type { Column } from '../allColumnDefinitions';
import { DEFAULT_NAME_COLUMN_MIN_WIDTH } from '../../utils/columnMinWidths';
import { InventoryViewSystem } from '../../hooks/useInventoryViewsQuery';

const APP_NAME = 'inventory' as const;

const nameColumn = {
  appName: APP_NAME,
  title: 'Name',
  key: 'name',
  minWidth: DEFAULT_NAME_COLUMN_MIN_WIDTH,
  isShownByDefault: true,
  isShown: true,
  isUntoggleable: true,
  sortBy: ApiOrderByEnum.DisplayName,
  renderCell: (system: System) => (
    <DisplayName key={`name-${system.id}`} system={system} />
  ),
};

const workspaceColumn = {
  appName: APP_NAME,
  title: 'Workspace',
  key: 'workspace',
  minWidth: '10rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiOrderByEnum.GroupName,
  renderCell: (system: InventoryViewSystem) => (
    <Workspace value={system.groups} />
  ),
};

const tagsColumn = {
  appName: APP_NAME,
  title: 'Tags',
  key: 'tags',
  minWidth: '6rem',
  isShownByDefault: true,
  isShown: true,
  renderCell: (system: InventoryViewSystem) => (
    <Tags value={system.tags} system={system} />
  ),
};

const operatingSystemColumn = {
  appName: APP_NAME,
  title: 'OS',
  key: 'os',
  minWidth: '11rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiOrderByEnum.OperatingSystem,
  renderCell: (system: InventoryViewSystem) => (
    <OperatingSystem value={system.system_profile?.operating_system} />
  ),
};

const lastSeenColumn = {
  appName: APP_NAME,
  title: <LastSeenColumnHeader />,
  key: 'last_seen',
  minWidth: '9rem',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiOrderByEnum.LastCheckIn,
  renderCell: (system: InventoryViewSystem) => (
    <LastSeen
      value={{
        last_check_in: system.last_check_in,
        culled_timestamp: system.culled_timestamp,
        stale_warning_timestamp: system.stale_warning_timestamp,
        stale_timestamp: system.stale_timestamp,
        per_reporter_staleness: system.per_reporter_staleness,
      }}
    />
  ),
};

const statusColumn = {
  appName: APP_NAME,
  title: 'Status',
  key: 'status',
  minWidth: '9rem',
  isShownByDefault: false,
  isShown: false,
  sortBy: 'status',
  renderCell: (system: InventoryViewSystem) => (
    <Status
      value={{
        stale_timestamp: system.stale_timestamp,
        stale_warning_timestamp: system.stale_warning_timestamp,
        culled_timestamp: system.culled_timestamp,
      }}
    />
  ),
};

const infrastructureColumn = {
  appName: APP_NAME,
  title: 'Infrastructure',
  key: 'infrastructure',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) => (
    <Infrastructure value={system.system_profile?.infrastructure_type} />
  ),
};

const vendorColumn = {
  appName: APP_NAME,
  title: 'Vendor',
  key: 'vendor',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) => (
    <Vendor value={system.system_profile?.infrastructure_vendor} />
  ),
};

const workloadColumn = {
  appName: APP_NAME,
  title: 'Workload',
  key: 'workload',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) => (
    <Workload value={system.system_profile?.workloads} />
  ),
};

const createdColumn = {
  appName: APP_NAME,
  title: 'Created',
  key: 'created',
  isShownByDefault: false,
  isShown: false,
  renderCell: (system: InventoryViewSystem) => (
    <Created value={system?.created} />
  ),
};

export default [
  nameColumn,
  workspaceColumn,
  tagsColumn,
  operatingSystemColumn,
  lastSeenColumn,
  statusColumn,
  infrastructureColumn,
  vendorColumn,
  workloadColumn,
  createdColumn,
] as const satisfies readonly Column[];
