import React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { fitContent } from '@patternfly/react-table';
import { LastSeenColumnHeader } from '../../../../Utilities/LastSeenColumnHeader';
import DisplayName from './components/columns/DisplayName';
import Workspace from './components/columns/Workspace';
import Tags from './components/columns/Tags';
import OperatingSystem from './components/columns/OperatingSystem';
import LastSeen from './components/columns/LastSeen';

export const displayName = {
  key: 'display_name',
  sortable: 'display_name',
  title: 'Name',
  Component: DisplayName,
};

export const workspace = {
  key: 'groups',
  sortable: 'group_name',
  title: 'Workspace',
  props: { width: 10 },
  Component: Workspace,
  transforms: [fitContent],
};

export const tags = {
  key: 'tags',
  title: 'Tags',
  props: { width: 10 },
  Component: Tags,
};

export const operatingSystem = {
  key: 'system_profile',
  sortable: 'operating_system',
  // Is that for export?
  dataLabel: 'OS',
  title: (
    <Tooltip content={<span>Operating system</span>}>
      <span>OS</span>
    </Tooltip>
  ),
  Component: OperatingSystem,
  props: { width: 10 },
};

export const lastSeen = {
  key: 'updated',
  sortable: 'updated',
  dataLabel: 'Last seen',
  title: <LastSeenColumnHeader />,
  Component: LastSeen,
  props: { width: 10 },
  transforms: [fitContent],
};

export default [displayName, workspace, tags, operatingSystem, lastSeen];
