/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import { useWorkspacesPageKesselAccess } from './useWorkspacesPageKesselAccess';
import {
  WORKSPACE_RESOURCE_TYPE,
  WORKSPACE_RELATION_VIEW,
  KESSEL_WORKSPACE_REPORTER,
} from '../../constants';

const mockUseKesselMigrationFeatureFlag = jest.fn();
const mockUseSelfAccessCheck = jest.fn();
const mockFetchDefaultWorkspace = jest.fn();

jest.mock('./useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  fetchDefaultWorkspace: (...args) => mockFetchDefaultWorkspace(...args),
  useSelfAccessCheck: (opts) => mockUseSelfAccessCheck(opts),
}));

describe('useWorkspacesPageKesselAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    mockFetchDefaultWorkspace.mockResolvedValue({ id: 'default-ws-id' });
    mockUseSelfAccessCheck.mockReturnValue({
      data: [],
      loading: false,
      error: undefined,
    });
  });

  it('when Kessel flag is off, does not call fetchDefaultWorkspace and returns inactive gate', () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);

    const { result } = renderHook(() => useWorkspacesPageKesselAccess());

    expect(mockFetchDefaultWorkspace).not.toHaveBeenCalled();
    expect(result.current).toMatchObject({
      isKesselGated: false,
      isWorkspaceAccessLoading: false,
      canViewDefaultWorkspace: undefined,
      defaultWorkspaceFetchError: null,
    });
  });

  it('when Kessel flag is on, calls fetchDefaultWorkspace with window origin', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockImplementation(() => ({
      data: [
        {
          allowed: true,
          relation: WORKSPACE_RELATION_VIEW,
          resource: { id: 'default-ws-id', type: WORKSPACE_RESOURCE_TYPE },
        },
      ],
      loading: false,
      error: undefined,
    }));

    renderHook(() => useWorkspacesPageKesselAccess());

    await waitFor(() => {
      expect(mockFetchDefaultWorkspace).toHaveBeenCalledWith(
        window.location.origin,
      );
    });
  });

  it('passes workspace view resource into useSelfAccessCheck after fetch resolves', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({
      data: [
        {
          allowed: true,
          relation: WORKSPACE_RELATION_VIEW,
          resource: { id: 'default-ws-id', type: WORKSPACE_RESOURCE_TYPE },
        },
      ],
      loading: false,
      error: undefined,
    });

    renderHook(() => useWorkspacesPageKesselAccess());

    await waitFor(() => {
      expect(mockUseSelfAccessCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          resources: [
            expect.objectContaining({
              id: 'default-ws-id',
              type: WORKSPACE_RESOURCE_TYPE,
              relation: WORKSPACE_RELATION_VIEW,
              reporter: KESSEL_WORKSPACE_REPORTER,
            }),
          ],
        }),
      );
    });
  });

  it('when fetchDefaultWorkspace fails, exposes error and canViewDefaultWorkspace is false', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockFetchDefaultWorkspace.mockRejectedValue({
      code: 403,
      message: 'Forbidden',
    });

    const { result } = renderHook(() => useWorkspacesPageKesselAccess());

    await waitFor(() => {
      expect(result.current.defaultWorkspaceFetchError).toEqual({
        code: 403,
        message: 'Forbidden',
      });
      expect(result.current.canViewDefaultWorkspace).toBe(false);
    });
  });
});
