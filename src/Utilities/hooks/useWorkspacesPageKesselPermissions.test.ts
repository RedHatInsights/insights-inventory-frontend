/* eslint-disable jsdoc/check-tag-names */
/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import {
  KESSEL_WORKSPACE_REPORTER,
  WORKSPACE_RELATION_DELETE,
  WORKSPACE_RELATION_EDIT,
  WORKSPACE_RESOURCE_TYPE,
} from '../../constants';
import {
  useKesselCanCreateWorkspace,
  useWorkspaceTableRowKesselPermissions,
} from './useWorkspacesPageKesselPermissions';

const mockUseKesselMigrationFeatureFlag = jest.fn();
const mockUseSelfAccessCheck = jest.fn();
const mockFetchRootWorkspace = jest.fn();

jest.mock('./useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  useSelfAccessCheck: (opts: object) => mockUseSelfAccessCheck(opts),
  fetchRootWorkspace: (...args: unknown[]) => mockFetchRootWorkspace(...args),
}));

describe('useWorkspaceTableRowKesselPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    mockUseSelfAccessCheck.mockReturnValue({ data: undefined, loading: false });
  });

  it('when Kessel is off, does not load and leaves permission map empty', () => {
    const { result } = renderHook(() =>
      useWorkspaceTableRowKesselPermissions([{ id: 'ws-1', ungrouped: false }]),
    );

    expect(result.current.isKesselEnabled).toBe(false);
    expect(result.current.permissionsLoading).toBe(false);
    expect(result.current.workspacePermissionById).toEqual({});
  });

  it('when Kessel is on, requests edit and delete for each non-ungrouped workspace', () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: false });

    renderHook(() =>
      useWorkspaceTableRowKesselPermissions([
        { id: 'ws-1', ungrouped: false },
        { id: 'ws-2', ungrouped: true },
      ]),
    );

    expect(mockUseSelfAccessCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: [
          {
            id: 'ws-1',
            type: WORKSPACE_RESOURCE_TYPE,
            relation: WORKSPACE_RELATION_EDIT,
            reporter: KESSEL_WORKSPACE_REPORTER,
          },
          {
            id: 'ws-1',
            type: WORKSPACE_RESOURCE_TYPE,
            relation: WORKSPACE_RELATION_DELETE,
            reporter: KESSEL_WORKSPACE_REPORTER,
          },
        ],
      }),
    );
  });

  it('maps check results per workspace id', () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({
      data: [
        {
          relation: WORKSPACE_RELATION_EDIT,
          allowed: true,
          resource: {
            id: 'ws-a',
            type: WORKSPACE_RESOURCE_TYPE,
            reporter: KESSEL_WORKSPACE_REPORTER,
          },
        },
        {
          relation: WORKSPACE_RELATION_DELETE,
          allowed: false,
          resource: {
            id: 'ws-a',
            type: WORKSPACE_RESOURCE_TYPE,
            reporter: KESSEL_WORKSPACE_REPORTER,
          },
        },
      ],
      loading: false,
    });

    const { result } = renderHook(() =>
      useWorkspaceTableRowKesselPermissions([{ id: 'ws-a', ungrouped: false }]),
    );

    expect(result.current.workspacePermissionById['ws-a']).toEqual({
      canEdit: true,
      canDelete: false,
    });
  });
});

describe('useKesselCanCreateWorkspace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    mockUseSelfAccessCheck.mockReturnValue({ data: undefined, loading: false });
    mockFetchRootWorkspace.mockResolvedValue({ id: 'root-1' });
  });

  it('when Kessel is off, returns undefined canCreateWorkspace', () => {
    const { result } = renderHook(() => useKesselCanCreateWorkspace());

    expect(result.current.canCreateWorkspace).toBeUndefined();
    expect(result.current.createPermissionLoading).toBe(false);
  });

  it('when Kessel is on and root edit is allowed, canCreateWorkspace is true', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockImplementation((...args: unknown[]) => {
      const { resources } = args[0] as { resources?: unknown[] };
      if (!resources?.length) {
        return { data: [], loading: false };
      }
      return {
        data: [
          {
            relation: WORKSPACE_RELATION_EDIT,
            allowed: true,
            resource: {
              id: 'root-1',
              type: WORKSPACE_RESOURCE_TYPE,
              reporter: KESSEL_WORKSPACE_REPORTER,
            },
          },
        ],
        loading: false,
      };
    });

    const { result } = renderHook(() => useKesselCanCreateWorkspace());

    await waitFor(() => {
      expect(result.current.createPermissionLoading).toBe(false);
    });

    expect(mockFetchRootWorkspace).toHaveBeenCalled();
    expect(result.current.canCreateWorkspace).toBe(true);
  });
});
