import React from 'react';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import DisplayName from './cells/DisplayName';
import Workspace from './cells/Workspace';
import LastSeen from './cells/LastSeen';
import OperatingSystem from './cells/OperatingSystem';
import Tags from './cells/Tags';
import { LastSeenColumnHeader } from '../../../../Utilities/LastSeenColumnHeader';
import { System } from '../../hooks/useSystemsQuery';
import type { Column } from '../allColumnDefinitions';
import { DEFAULT_NAME_COLUMN_MIN_WIDTH } from '../../utils/columnMinWidths';

const nameColumn = {
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

export default [
  nameColumn,
  workspaceColumn,
  tagsColumn,
  operatingSystemColumn,
  lastSeenColumn,
] as const satisfies readonly Column[];
