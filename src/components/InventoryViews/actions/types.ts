import type { SystemsViewItem } from '../../SystemsView/types';

/**
 * Host row shape inventory actions inspect: identity, workspace membership,
 * and optional Kessel flags from `useHostIdsWithKessel`.
 */
export type ActionItem = SystemsViewItem & {
  display_name?: string | null;
  groups?: ReadonlyArray<{
    id?: string | null;
    name?: string | null;
    ungrouped?: boolean | null;
  }> | null;
  permissions?: {
    hasUpdate?: boolean;
    hasDelete?: boolean;
    hasWorkspaceEdit?: boolean;
  };
};

export const ACTION_IDS = {
  move: 'move',
  delete: 'delete',
  addToWorkspace: 'add-to-workspace',
  removeFromWorkspace: 'remove-from-workspace',
  edit: 'edit',
  deleteSeparator: 'delete-separator',
} as const;
