import React from 'react';
import { Spinner } from '@patternfly/react-core';
import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

export type WorkspaceSelection = {
  workspace?: { id: string; name: string };
};

export type WorkspaceSelectorFieldProps = {
  onSelect: (item: WorkspaceSelection) => void;
  menuWidth?: string;
};

/**
 * Federated WorkspaceSelector from insights-rbac-ui (scope `rbac`, module
 * `./modules/WorkspaceSelector`). Extracted so tests can stub this field without
 * replacing AsyncComponent app-wide.
 */
export const WorkspaceSelectorField = ({
  onSelect,
  menuWidth = '500px',
}: WorkspaceSelectorFieldProps) => (
  <AsyncComponent
    scope="rbac"
    module="./modules/WorkspaceSelector"
    onSelect={onSelect}
    menuWidth={menuWidth}
    fallback={<Spinner size="lg" />}
  />
);
