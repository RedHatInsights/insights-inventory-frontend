import React from 'react';
import { type RenderableColumn } from '../../hooks/useColumns';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import DisplayName from './cells/DisplayName';
import Workspace from './cells/Workspace';
import LastSeen from './cells/LastSeen';
import OperatingSystem from './cells/OperatingSystem';
import Tags from './cells/Tags';
import { LastSeenColumnHeader } from '../../../../Utilities/LastSeenColumnHeader';
import { System } from '../../hooks/useSystemsQuery';

const nameColumn: RenderableColumn = {
  title: 'Name',
  key: 'name',
  isShownByDefault: true,
  isShown: true,
  isUntoggleable: true,
  sortBy: ApiOrderByEnum.DisplayName,
  renderCell: (system: System) => (
    <DisplayName key={`name-${system.id}`} system={system} />
  ),
};

const workspaceColumn: RenderableColumn = {
  title: 'Workspace',
  key: 'workspace',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiOrderByEnum.GroupName,
  renderCell: (system: System) => (
    <Workspace key={`workspace-${system.id}`} system={system} />
  ),
};

const tagsColumn: RenderableColumn = {
  title: 'Tags',
  key: 'tags',
  isShownByDefault: true,
  isShown: true,
  renderCell: (system: System) => (
    <Tags key={`tags-${system.id}`} system={system} />
  ),
};

const operatingSystemColumn: RenderableColumn = {
  title: 'OS',
  key: 'os',
  isShownByDefault: true,
  isShown: true,
  sortBy: ApiOrderByEnum.OperatingSystem,
  renderCell: (system: System) => (
    <OperatingSystem key={`os-${system.id}`} system={system} />
  ),
};

const lastSeenColumn: RenderableColumn = {
  title: <LastSeenColumnHeader />,
  key: 'last_seen',
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
];
