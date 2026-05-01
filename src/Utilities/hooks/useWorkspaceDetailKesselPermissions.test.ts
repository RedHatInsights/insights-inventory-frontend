/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { useWorkspaceDetailKesselPermissions } from './useWorkspaceDetailKesselPermissions';
import {
  KESSEL_WORKSPACE_REPORTER,
  WORKSPACE_RELATION_EDIT,
  WORKSPACE_RELATION_VIEW,
  WORKSPACE_RESOURCE_TYPE,
} from '../../constants';

const mockUseKesselMigrationFeatureFlag = jest.fn();
const mockUseSelfAccessCheck = jest.fn();

jest.mock('./useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  useSelfAccessCheck: (opts: unknown) => mockUseSelfAccessCheck(opts),
}));

describe('useWorkspaceDetailKesselPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    mockUseSelfAccessCheck.mockReturnValue({ data: undefined, loading: false });
  });

  describe('when Kessel migration flag is OFF', () => {
    it('returns inactive Kessel gate and undefined permission flags', () => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(false);

      const { result } = renderHook(() =>
        useWorkspaceDetailKesselPermissions('ws-1', { skipKessel: false }),
      );

      expect(result.current).toEqual({
        appliesKesselWorkspaceChecks: false,
        canView: undefined,
        canEdit: undefined,
        isLoading: false,
      });
    });
  });

  describe('when Kessel migration flag is ON', () => {
    beforeEach(() => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    });

    it('returns inactive gate when skipKessel is true', () => {
      const { result } = renderHook(() =>
        useWorkspaceDetailKesselPermissions('ws-1', { skipKessel: true }),
      );

      expect(result.current).toEqual({
        appliesKesselWorkspaceChecks: false,
        canView: undefined,
        canEdit: undefined,
        isLoading: false,
      });
    });

    it('returns all false when workspaceId is undefined', () => {
      const { result } = renderHook(() =>
        useWorkspaceDetailKesselPermissions(undefined, { skipKessel: false }),
      );

      expect(result.current).toEqual({
        appliesKesselWorkspaceChecks: true,
        canView: false,
        canEdit: false,
        isLoading: false,
      });
    });

    it('maps view and edit from two one-item nested bulk checks', () => {
      mockUseSelfAccessCheck.mockImplementation(
        (params: { resources?: Array<{ relation?: string }> }) => {
          const rel = params.resources?.[0]?.relation;
          if (rel === WORKSPACE_RELATION_VIEW) {
            return {
              data: [
                {
                  relation: WORKSPACE_RELATION_VIEW,
                  allowed: true,
                  resource: { id: 'w1', type: WORKSPACE_RESOURCE_TYPE },
                },
              ],
              loading: false,
            };
          }
          if (rel === WORKSPACE_RELATION_EDIT) {
            return {
              data: [
                {
                  relation: WORKSPACE_RELATION_EDIT,
                  allowed: false,
                  resource: { id: 'w1', type: WORKSPACE_RESOURCE_TYPE },
                },
              ],
              loading: false,
            };
          }
          return { data: [], loading: false };
        },
      );

      const { result } = renderHook(() =>
        useWorkspaceDetailKesselPermissions('w1', { skipKessel: false }),
      );

      expect(result.current).toEqual({
        appliesKesselWorkspaceChecks: true,
        canView: true,
        canEdit: false,
        isLoading: false,
      });
    });

    it('requests view and edit as two one-item nested bulk payloads', () => {
      mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: false });

      renderHook(() =>
        useWorkspaceDetailKesselPermissions('my-ws-id', { skipKessel: false }),
      );

      expect(mockUseSelfAccessCheck).toHaveBeenCalledTimes(2);
      expect(mockUseSelfAccessCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          resources: [
            expect.objectContaining({
              id: 'my-ws-id',
              type: WORKSPACE_RESOURCE_TYPE,
              relation: WORKSPACE_RELATION_VIEW,
              reporter: KESSEL_WORKSPACE_REPORTER,
            }),
          ],
        }),
      );
      expect(mockUseSelfAccessCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          resources: [
            expect.objectContaining({
              id: 'my-ws-id',
              type: WORKSPACE_RESOURCE_TYPE,
              relation: WORKSPACE_RELATION_EDIT,
              reporter: KESSEL_WORKSPACE_REPORTER,
            }),
          ],
        }),
      );
    });

    it('returns isLoading true while either check is loading', () => {
      mockUseSelfAccessCheck.mockReturnValue({
        data: undefined,
        loading: true,
      });

      const { result } = renderHook(() =>
        useWorkspaceDetailKesselPermissions('ws-x', { skipKessel: false }),
      );

      expect(result.current.isLoading).toBe(true);
    });
  });
});
