import React from 'react';
import { Tooltip } from '@patternfly/react-core';
import { fitContent } from '@patternfly/react-table';
import { LastSeenColumnHeader } from '../../../../Utilities/LastSeenColumnHeader';
import DisplayName from './components/cells/DisplayName';
import Workspace from './components/cells/Workspace';
import Tags from './components/cells/Tags';
import OperatingSystem from './components/cells/OperatingSystem';
import LastSeen from './components/cells/LastSeen';

const displayName = {
  key: 'display_name',
  sortable: 'display_name',
  title: 'Name',
  Component: DisplayName,
};

const workspace = {
  key: 'groups',
  sortable: 'group_name',
  title: 'Workspace',
  props: { width: 10 },
  Component: Workspace,
  transforms: [fitContent],
};

const tags = {
  key: 'tags',
  title: 'Tags',
  props: { width: 10, isStatic: true },
  Component: Tags,
};

const operatingSystem = {
  key: 'system_profile',
  sortKey: 'operating_system',
  dataLabel: 'OS',
  title: (
    <Tooltip content={<span>Operating system</span>}>
      <span>OS</span>
    </Tooltip>
  ),
  Component: OperatingSystem,
  props: { width: 10 },
};

const lastSeen = {
  key: 'updated',
  sortKey: 'updated',
  dataLabel: 'Last seen',
  title: <LastSeenColumnHeader />,
  Component: LastSeen,
  props: { width: 10 },
  transforms: [fitContent],
};

export default [displayName, workspace, tags, operatingSystem, lastSeen];
