import React from 'react';

type WorkspaceSelection = {
  workspace?: { id: string; name: string };
};

type MockAsyncComponentProps = {
  onSelect?: (item: WorkspaceSelection) => void;
};

/**
 * Cypress stub for WorkspaceSelector and other federated UI (see config/setupTests.js).
 */
export default function MockAsyncComponent({
  onSelect,
}: MockAsyncComponentProps) {
  return (
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
}
