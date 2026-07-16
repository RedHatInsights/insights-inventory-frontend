import '@testing-library/jest-dom';
import { expect } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { useAppServicePermissions } from './useAppServicePermissions';

const mockUseKesselMigrationFeatureFlag = jest.fn();
const mockUsePermissionsWithContext = jest.fn();
const mockUseSelfAccessCheck = jest.fn();
const mockFetchRootWorkspace = jest.fn();

jest.mock('./useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock(
  '@redhat-cloud-services/frontend-components-utilities/RBACHook',
  () => ({
    usePermissionsWithContext: (...args: unknown[]) =>
      mockUsePermissionsWithContext(...args),
  }),
);

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  useSelfAccessCheck: (opts: object) => mockUseSelfAccessCheck(opts),
  fetchRootWorkspace: (...args: unknown[]) => mockFetchRootWorkspace(...args),
}));

const rbacResult = (hasAccess: boolean, isOrgAdmin = false) => ({
  hasAccess,
  isOrgAdmin,
});

describe('useAppServicePermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: false });
  });

  describe('RBAC v1 (Kessel OFF)', () => {
    beforeEach(() => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    });

    it('returns all true when every service is accessible', () => {
      mockUsePermissionsWithContext.mockReturnValue(rbacResult(true));

      const { result } = renderHook(() => useAppServicePermissions());

      expect(result.current.permissions).not.toBeNull();
      expect(result.current.permissions!.vulnerability).toBe(true);
      expect(result.current.permissions!.advisor).toBe(true);
      expect(result.current.permissions!.compliance).toBe(true);
      expect(result.current.permissions!.content).toBe(true);
      expect(result.current.permissions!.remediations).toBe(true);
      expect(result.current.permissions!.malware).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('returns all false when no service is accessible', () => {
      mockUsePermissionsWithContext.mockReturnValue(rbacResult(false));

      const { result } = renderHook(() => useAppServicePermissions());

      expect(result.current.permissions!.vulnerability).toBe(false);
      expect(result.current.permissions!.advisor).toBe(false);
    });

    it('grants all access when user is org admin', () => {
      mockUsePermissionsWithContext.mockReturnValue(rbacResult(false, true));

      const { result } = renderHook(() => useAppServicePermissions());

      expect(result.current.permissions!.vulnerability).toBe(true);
      expect(result.current.permissions!.advisor).toBe(true);
      expect(result.current.permissions!.compliance).toBe(true);
      expect(result.current.permissions!.content).toBe(true);
      expect(result.current.permissions!.remediations).toBe(true);
      expect(result.current.permissions!.malware).toBe(true);
    });

    it('calls usePermissionsWithContext with correct permission strings', () => {
      mockUsePermissionsWithContext.mockReturnValue(rbacResult(true));

      renderHook(() => useAppServicePermissions());

      const calls = mockUsePermissionsWithContext.mock.calls;
      const permissionStrings = calls.map(
        (call: unknown[]) => (call[0] as string[])[0],
      );

      expect(permissionStrings).toContain(
        'vulnerability:vulnerability_results:read',
      );
      expect(permissionStrings).toContain('advisor:*:read');
      expect(permissionStrings).toContain('compliance:system:read');
      expect(permissionStrings).toContain('patch:*:read');
      expect(permissionStrings).toContain('remediations:remediation:read');
      expect(permissionStrings).toContain('malware-detection:*:read');
    });
  });

  describe('Kessel v2 (Kessel ON)', () => {
    beforeEach(() => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
      mockFetchRootWorkspace.mockResolvedValue({ id: 'ws-1' });
    });

    it('passes empty permissions to usePermissionsWithContext when Kessel is on', () => {
      mockUsePermissionsWithContext.mockReturnValue(rbacResult(false));
      mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: false });

      renderHook(() => useAppServicePermissions());

      for (const call of mockUsePermissionsWithContext.mock.calls) {
        expect(call[0]).toEqual([]);
      }
    });

    it('returns permissions based on Kessel check results', async () => {
      mockUsePermissionsWithContext.mockReturnValue(rbacResult(false));
      mockUseSelfAccessCheck.mockReturnValue({
        data: [
          {
            relation: 'vulnerability_vulnerability_results_view',
            allowed: true,
          },
          {
            relation: 'advisor_recommendation_results_view',
            allowed: false,
          },
          { relation: 'compliance_system_view', allowed: true },
          { relation: 'patch_system_view', allowed: true },
          { relation: 'remediations_view_remediation', allowed: false },
          { relation: 'malware_malware_view', allowed: true },
        ],
        loading: false,
      });

      const { result } = renderHook(() => useAppServicePermissions());

      await waitFor(() => {
        expect(result.current.permissions).not.toBeNull();
      });

      expect(result.current.permissions!.vulnerability).toBe(true);
      expect(result.current.permissions!.advisor).toBe(false);
      expect(result.current.permissions!.compliance).toBe(true);
      expect(result.current.permissions!.content).toBe(true);
      expect(result.current.permissions!.remediations).toBe(false);
      expect(result.current.permissions!.malware).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('returns isLoading true while Kessel checks are loading', () => {
      mockUsePermissionsWithContext.mockReturnValue(rbacResult(false));
      mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: true });

      const { result } = renderHook(() => useAppServicePermissions());

      expect(result.current.permissions).toBeNull();
      expect(result.current.isLoading).toBe(true);
    });

    it('denies all when Kessel check has no matching relations', async () => {
      mockUsePermissionsWithContext.mockReturnValue(rbacResult(false));
      mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: false });

      const { result } = renderHook(() => useAppServicePermissions());

      await waitFor(() => {
        expect(result.current.permissions).not.toBeNull();
      });

      expect(result.current.permissions!.vulnerability).toBe(false);
      expect(result.current.permissions!.advisor).toBe(false);
    });
  });
});
