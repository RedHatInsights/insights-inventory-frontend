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
import Created from './cells/Created';
import { LastSeenColumnHeader } from '../../../../Utilities/LastSeenColumnHeader';
import { System } from '../../hooks/useSystemsQuery';
import type { Column } from '../allColumnDefinitions';
import { DEFAULT_NAME_COLUMN_MIN_WIDTH } from '../../utils/columnMinWidths';
import { InventoryViewSystem } from '../../hooks/useInventoryViewsQuery';
import { valueOrNotAvailable } from '../helpers';

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
  renderCell: (system: System) => (
    <Workspace key={`workspace-${system.id}`} system={system} />
  ),
};

const tagsColumn = {
  appName: APP_NAME,
  title: 'Tags',
  key: 'tags',
  minWidth: '6rem',
  isShownByDefault: true,
  isShown: true,
  renderCell: (system: System) => (
    <Tags key={`tags-${system.id}`} system={system} />
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
  renderCell: (system: System) => (
    <OperatingSystem key={`os-${system.id}`} system={system} />
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
  renderCell: (system: System) => (
    <LastSeen key={`lastseen-${system.id}`} system={system} />
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
  renderCell: (system: System) => (
    <Status key={`status-${system.id}`} system={system} />
  ),
};

const infrastructureColumn = {
  appName: APP_NAME,
  title: 'Infrastructure',
  key: 'infrastructure',
  isShownByDefault: false,
  isShown: false,
  renderCell(system: InventoryViewSystem) {
    return (
      <span key={`${this.key}-${system.id}`}>
        {valueOrNotAvailable(system?.system_profile?.infrastructure_type)}
      </span>
    );
  },
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
