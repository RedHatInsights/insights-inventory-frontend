/* eslint-disable jsdoc/check-tag-names */
/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { renderHook, waitFor } from '@testing-library/react';
import {
  HOST_WORKSPACE_RELATION_UPDATE,
  HOST_WORKSPACE_RELATION_VIEW,
  KESSEL_WORKSPACE_REPORTER,
  STALENESS_WORKSPACE_RELATION_UPDATE,
  STALENESS_WORKSPACE_RELATION_VIEW,
  WORKSPACE_RESOURCE_TYPE,
} from '../../constants';
import { useHostStalenessKesselAccess } from './useHostStalenessKesselAccess';

const DEFAULT_WS_ID = 'default-ws-1';

const mockUseKesselMigrationFeatureFlag = jest.fn();
const mockUseSelfAccessCheck = jest.fn();
const mockFetchDefaultWorkspace = jest.fn();

jest.mock('./useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  useSelfAccessCheck: (opts: object) => mockUseSelfAccessCheck(opts),
  fetchDefaultWorkspace: (...args: unknown[]) =>
    mockFetchDefaultWorkspace(...args),
}));

const defaultWorkspaceKesselResources = () => {
  const base = {
    id: DEFAULT_WS_ID,
    type: WORKSPACE_RESOURCE_TYPE,
    reporter: KESSEL_WORKSPACE_REPORTER,
  };
  return [
    { ...base, relation: STALENESS_WORKSPACE_RELATION_VIEW },
    { ...base, relation: STALENESS_WORKSPACE_RELATION_UPDATE },
    { ...base, relation: HOST_WORKSPACE_RELATION_VIEW },
    { ...base, relation: HOST_WORKSPACE_RELATION_UPDATE },
  ];
};

const check = (relation: string, allowed: boolean) => ({
  relation,
  allowed,
  resource: {
    id: DEFAULT_WS_ID,
    type: WORKSPACE_RESOURCE_TYPE,
    reporter: KESSEL_WORKSPACE_REPORTER,
  },
});

describe('useHostStalenessKesselAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: false });
    mockFetchDefaultWorkspace.mockResolvedValue({
      id: DEFAULT_WS_ID,
      type: 'default',
      name: 'Default',
      created: '',
      modified: '',
    });
  });

  it('when Kessel is off, returns rbac mode', () => {
    const { result } = renderHook(() => useHostStalenessKesselAccess());
    expect(result.current).toEqual({ mode: 'rbac' });
    expect(mockFetchDefaultWorkspace).not.toHaveBeenCalled();
  });

  it('when Kessel is on, requests four rbac/workspace checks on the Default workspace id', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: false });

    renderHook(() => useHostStalenessKesselAccess());

    await waitFor(() => {
      expect(mockUseSelfAccessCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          resources: defaultWorkspaceKesselResources(),
        }),
      );
    });
  });

  it('when Default workspace fetch fails, user cannot view the page', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockFetchDefaultWorkspace.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useHostStalenessKesselAccess());

    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          mode: 'kessel',
          isLoading: false,
          canViewPage: false,
          canEditStaleness: false,
        }),
      );
    });
  });

  it('when staleness view and inventory_host_view are allowed, user can view the page', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({
      data: [
        check(STALENESS_WORKSPACE_RELATION_VIEW, true),
        check(STALENESS_WORKSPACE_RELATION_UPDATE, false),
        check(HOST_WORKSPACE_RELATION_VIEW, true),
        check(HOST_WORKSPACE_RELATION_UPDATE, false),
      ],
      loading: false,
    });

    const { result } = renderHook(() => useHostStalenessKesselAccess());

    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          mode: 'kessel',
          isLoading: false,
          canViewPage: true,
          canEditStaleness: false,
          editDisabledTooltip: expect.stringContaining('staleness update'),
        }),
      );
    });
  });

  it('when staleness_staleness_view is denied, user cannot view the page', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({
      data: [
        check(STALENESS_WORKSPACE_RELATION_VIEW, false),
        check(STALENESS_WORKSPACE_RELATION_UPDATE, true),
        check(HOST_WORKSPACE_RELATION_VIEW, true),
        check(HOST_WORKSPACE_RELATION_UPDATE, true),
      ],
      loading: false,
    });

    const { result } = renderHook(() => useHostStalenessKesselAccess());

    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          mode: 'kessel',
          canViewPage: false,
          canEditStaleness: false,
        }),
      );
    });
  });

  it('when inventory_host_view is denied, user cannot view the page', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({
      data: [
        check(STALENESS_WORKSPACE_RELATION_VIEW, true),
        check(STALENESS_WORKSPACE_RELATION_UPDATE, true),
        check(HOST_WORKSPACE_RELATION_VIEW, false),
        check(HOST_WORKSPACE_RELATION_UPDATE, true),
      ],
      loading: false,
    });

    const { result } = renderHook(() => useHostStalenessKesselAccess());

    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          mode: 'kessel',
          canViewPage: false,
          canEditStaleness: false,
        }),
      );
    });
  });

  it('when staleness_staleness_update and inventory_host_update are allowed, user can edit', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({
      data: [
        check(STALENESS_WORKSPACE_RELATION_VIEW, true),
        check(STALENESS_WORKSPACE_RELATION_UPDATE, true),
        check(HOST_WORKSPACE_RELATION_VIEW, true),
        check(HOST_WORKSPACE_RELATION_UPDATE, true),
      ],
      loading: false,
    });

    const { result } = renderHook(() => useHostStalenessKesselAccess());

    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          mode: 'kessel',
          canViewPage: true,
          canEditStaleness: true,
        }),
      );
    });
  });

  it('when inventory_host_update is denied, user cannot edit even if staleness update is allowed', async () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({
      data: [
        check(STALENESS_WORKSPACE_RELATION_VIEW, true),
        check(STALENESS_WORKSPACE_RELATION_UPDATE, true),
        check(HOST_WORKSPACE_RELATION_VIEW, true),
        check(HOST_WORKSPACE_RELATION_UPDATE, false),
      ],
      loading: false,
    });

    const { result } = renderHook(() => useHostStalenessKesselAccess());

    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          mode: 'kessel',
          canViewPage: true,
          canEditStaleness: false,
          editDisabledTooltip: expect.stringContaining('host update'),
        }),
      );
    });
  });
});
