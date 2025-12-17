import { useCallback } from 'react';
import { DataViewTrObject } from '@patternfly/react-data-view';
import { ActionsColumn } from '@patternfly/react-table';
import type { System } from './useSystemsQuery';
import { hasWorkspace } from '../utils/systemHelpers';
import DisplayName from '../../../routes/Systems/components/SystemsTable/components/columns/DisplayName';
import Workspace from '../../../routes/Systems/components/SystemsTable/components/columns/Workspace';
import Tags from '../../../routes/Systems/components/SystemsTable/components/columns/Tags';
import OperatingSystem from '../../../routes/Systems/components/SystemsTable/components/columns/OperatingSystem';
import LastSeen from '../../../routes/Systems/components/SystemsTable/components/columns/LastSeen';
import React from 'react';

interface UseRowMappingParams {
  openAddToWorkspaceModal: (systems: System[]) => void;
  openRemoveFromWorkspaceModal: (systems: System[]) => void;
  openEditModal: (systems: System[]) => void;
  openDeleteModal: (systems: System[]) => void;
}

export const useRowMapping = ({
  openAddToWorkspaceModal,
  openRemoveFromWorkspaceModal,
  openEditModal,
  openDeleteModal,
}: UseRowMappingParams) => {
  return useCallback(
    (system: System): DataViewTrObject => {
      const rowActions = [
        {
          title: 'Add to workspace',
          onClick: () => openAddToWorkspaceModal([system]),
          isDisabled: hasWorkspace(system),
        },
        {
          title: 'Remove from workspace',
          onClick: () => openRemoveFromWorkspaceModal([system]),
          isDisabled: !hasWorkspace(system),
        },
        {
          title: 'Edit display name',
          onClick: () => openEditModal([system]),
        },
        {
          title: 'Delete from inventory',
          onClick: () => openDeleteModal([system]),
        },
      ];

      return {
        id: system.id,
        row: [
          <DisplayName
            key={`name-${system.id}`}
            id={system.id}
            props={{}}
            {...system}
          />,
          <Workspace key={`workspace-${system.id}`} groups={system.groups} />,
          <Tags
            key={`tags-${system.id}`}
            tags={system.tags}
            systemId={system.id}
          />,
          <OperatingSystem
            key={`os-${system.id}`}
            system_profile={system.system_profile}
          />,
          <LastSeen
            key={`lastseen-${system.id}`}
            updated={system.updated}
            culled_timestamp={system?.culled_timestamp}
            stale_warning_timestamp={system?.stale_warning_timestamp}
            stale_timestamp={system?.stale_timestamp}
            per_reporter_staleness={system?.per_reporter_staleness}
          />,
          {
            cell: <ActionsColumn items={rowActions} />,
            props: { isActionCell: true },
          },
        ],
      };
    },
    [
      openAddToWorkspaceModal,
      openRemoveFromWorkspaceModal,
      openEditModal,
      openDeleteModal,
    ],
  );
};
