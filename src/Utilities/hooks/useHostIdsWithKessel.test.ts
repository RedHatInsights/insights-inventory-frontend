/* eslint-disable jsdoc/check-tag-names */
/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import {
  HOST_RESOURCE_TYPE,
  HOST_RESOURCE_TYPE_DELETE,
  HOST_RESOURCE_TYPE_UPDATE,
  KESSEL_REPORTER,
  KESSEL_WORKSPACE_REPORTER,
  WORKSPACE_RELATION_EDIT,
  WORKSPACE_RESOURCE_TYPE,
} from '../../constants';
import { useHostIdsWithKessel } from './useHostIdsWithKessel';

const mockUseKesselMigrationFeatureFlag = jest.fn();
const mockUseSelfAccessCheck = jest.fn();

jest.mock('./useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  useSelfAccessCheck: (opts: object) => mockUseSelfAccessCheck(opts),
}));

const testOrgId = 'test-org-id';

describe('useHostIdsWithKessel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    mockUseSelfAccessCheck.mockReturnValue({ data: undefined, loading: false });
  });

  it('when Kessel is off, leaves hostsWithPermissions.hasWorkspaceEdit permissive', () => {
    const hosts = [
      {
        id: 'h1',
        org_id: testOrgId,
        groups: [
          { id: 'ws-ungrouped', name: 'Ungrouped Hosts', ungrouped: true },
        ],
      },
    ];

    const { result } = renderHook(() => useHostIdsWithKessel(hosts));

    expect(
      result.current.hostsWithPermissions?.[0]?.permissions.hasWorkspaceEdit,
    ).toBe(true);
    expect(mockUseSelfAccessCheck).toHaveBeenCalledWith({ resources: [] });
  });

  it('when Kessel is on, requests workspace edit for Ungrouped Hosts workspace id', () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: false });

    const ungroupedWorkspaceId = '00000000-0000-0000-0000-ungrouped-ws';
    const hosts = [
      {
        id: 'h1',
        org_id: testOrgId,
        groups: [
          {
            id: ungroupedWorkspaceId,
            name: 'Ungrouped Hosts',
            ungrouped: true,
          },
        ],
      },
    ];

    renderHook(() => useHostIdsWithKessel(hosts));

    expect(mockUseSelfAccessCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: expect.arrayContaining([
          {
            id: ungroupedWorkspaceId,
            type: WORKSPACE_RESOURCE_TYPE,
            relation: WORKSPACE_RELATION_EDIT,
            reporter: KESSEL_WORKSPACE_REPORTER,
          },
        ]),
      }),
    );
  });

  it('when Kessel is on, gates move (hasWorkspaceEdit) on workspace edit for ungrouped hosts', () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    const ungroupedWorkspaceId = 'ws-u1';

    mockUseSelfAccessCheck.mockReturnValue({
      data: [
        {
          resource: { id: 'h1' },
          relation: HOST_RESOURCE_TYPE_UPDATE,
          allowed: true,
        },
        {
          resource: { id: 'h1' },
          relation: HOST_RESOURCE_TYPE_DELETE,
          allowed: true,
        },
        {
          resource: { id: ungroupedWorkspaceId },
          relation: WORKSPACE_RELATION_EDIT,
          allowed: false,
        },
      ],
      loading: false,
    });

    const hosts = [
      {
        id: 'h1',
        org_id: testOrgId,
        groups: [
          {
            id: ungroupedWorkspaceId,
            name: 'Ungrouped Hosts',
            ungrouped: true,
          },
        ],
      },
    ];

    const { result } = renderHook(() => useHostIdsWithKessel(hosts));

    expect(
      result.current.hostsWithPermissions?.[0]?.permissions.hasWorkspaceEdit,
    ).toBe(false);
  });

  it('when Kessel is on, groups workspace edit checks by host workspace id', () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    const wsId = 'ws-regular';

    mockUseSelfAccessCheck.mockReturnValue({
      data: [
        {
          resource: { id: 'h1' },
          relation: HOST_RESOURCE_TYPE_UPDATE,
          allowed: true,
        },
        {
          resource: { id: 'h1' },
          relation: HOST_RESOURCE_TYPE_DELETE,
          allowed: false,
        },
        {
          resource: { id: wsId },
          relation: WORKSPACE_RELATION_EDIT,
          allowed: true,
        },
      ],
      loading: false,
    });

    const hosts = [
      {
        id: 'h1',
        org_id: testOrgId,
        groups: [{ id: wsId, name: 'Prod', ungrouped: false }],
      },
    ];

    const { result } = renderHook(() => useHostIdsWithKessel(hosts));

    expect(result.current.hostsWithPermissions?.[0]?.permissions).toEqual({
      hasUpdate: true,
      hasDelete: false,
      hasWorkspaceEdit: true,
    });
  });

  it('when Kessel is on, includes host update/delete resources in bulk check', () => {
    mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: false });

    renderHook(() =>
      useHostIdsWithKessel([
        {
          id: 'host-a',
          org_id: testOrgId,
          groups: [{ id: 'ws-1', ungrouped: false }],
        },
      ]),
    );

    expect(mockUseSelfAccessCheck).toHaveBeenCalledWith(
      expect.objectContaining({
        resources: expect.arrayContaining([
          {
            id: 'host-a',
            type: HOST_RESOURCE_TYPE,
            relation: HOST_RESOURCE_TYPE_UPDATE,
            reporter: KESSEL_REPORTER,
          },
          {
            id: 'host-a',
            type: HOST_RESOURCE_TYPE,
            relation: HOST_RESOURCE_TYPE_DELETE,
            reporter: KESSEL_REPORTER,
          },
        ]),
      }),
    );
  });
});
