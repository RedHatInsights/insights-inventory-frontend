import React from 'react';

type WorkspaceSelection = {
  workspace?: { id: string; name: string };
};

type MockWorkspaceSelectorFieldProps = {
  onSelect?: (item: WorkspaceSelection) => void;
};

/**
 * Cypress stub for WorkspaceSelectorField only (GroupSystems move-system modal tests).
 */
export const WorkspaceSelectorField = ({
  onSelect,
}: MockWorkspaceSelectorFieldProps) => (
  <div data-testid="workspace-selector">
    <button
      type="button"
      onClick={() =>
        onSelect?.({
          workspace: { id: 'ws-123', name: 'Test Workspace' },
        })
      }
    >
      Select workspace
    </button>
  </div>
);
