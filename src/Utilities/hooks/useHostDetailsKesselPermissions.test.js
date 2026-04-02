/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { useHostDetailsKesselPermissions } from './useHostDetailsKesselPermissions';
import {
  HOST_RESOURCE_TYPE,
  HOST_RESOURCE_TYPE_VIEW,
  HOST_RESOURCE_TYPE_UPDATE,
  HOST_RESOURCE_TYPE_DELETE,
  KESSEL_REPORTER,
} from '../../constants';

const mockUseKesselMigrationFeatureFlag = jest.fn();
const mockUseSelfAccessCheck = jest.fn();

jest.mock('./useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  useSelfAccessCheck: (opts) => mockUseSelfAccessCheck(opts),
}));

describe('useHostDetailsKesselPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    mockUseSelfAccessCheck.mockReturnValue({ data: undefined, loading: false });
  });

  describe('when Kessel migration flag is OFF', () => {
    it('returns undefined permission flags and isLoading false', () => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(false);

      const { result } = renderHook(() =>
        useHostDetailsKesselPermissions('host-123'),
      );

      expect(result.current).toEqual({
        canView: undefined,
        canUpdate: undefined,
        canDelete: undefined,
        isLoading: false,
      });
    });
  });

  describe('when Kessel migration flag is ON', () => {
    beforeEach(() => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    });

    it('returns all false when hostId is undefined', () => {
      const { result } = renderHook(() =>
        useHostDetailsKesselPermissions(undefined),
      );

      expect(result.current).toEqual({
        canView: false,
        canUpdate: false,
        canDelete: false,
        isLoading: false,
      });
    });

    it('maps bulk check results by relation', () => {
      mockUseSelfAccessCheck.mockReturnValue({
        data: [
          {
            relation: HOST_RESOURCE_TYPE_VIEW,
            allowed: true,
            resource: { id: 'h1', type: HOST_RESOURCE_TYPE },
          },
          {
            relation: HOST_RESOURCE_TYPE_UPDATE,
            allowed: false,
            resource: { id: 'h1', type: HOST_RESOURCE_TYPE },
          },
          {
            relation: HOST_RESOURCE_TYPE_DELETE,
            allowed: true,
            resource: { id: 'h1', type: HOST_RESOURCE_TYPE },
          },
        ],
        loading: false,
      });

      const { result } = renderHook(() =>
        useHostDetailsKesselPermissions('h1'),
      );

      expect(result.current).toEqual({
        canView: true,
        canUpdate: false,
        canDelete: true,
        isLoading: false,
      });
    });

    it('requests view, update, and delete for the host', () => {
      mockUseSelfAccessCheck.mockReturnValue({ data: [], loading: false });

      renderHook(() => useHostDetailsKesselPermissions('my-host-id'));

      expect(mockUseSelfAccessCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          resources: [
            expect.objectContaining({
              id: 'my-host-id',
              type: HOST_RESOURCE_TYPE,
              relation: HOST_RESOURCE_TYPE_VIEW,
              reporter: KESSEL_REPORTER,
            }),
            expect.objectContaining({
              id: 'my-host-id',
              type: HOST_RESOURCE_TYPE,
              relation: HOST_RESOURCE_TYPE_UPDATE,
              reporter: KESSEL_REPORTER,
            }),
            expect.objectContaining({
              id: 'my-host-id',
              type: HOST_RESOURCE_TYPE,
              relation: HOST_RESOURCE_TYPE_DELETE,
              reporter: KESSEL_REPORTER,
            }),
          ],
        }),
      );
    });

    it('returns isLoading true while checks are loading', () => {
      mockUseSelfAccessCheck.mockReturnValue({
        data: undefined,
        loading: true,
      });

      const { result } = renderHook(() =>
        useHostDetailsKesselPermissions('host-x'),
      );

      expect(result.current.isLoading).toBe(true);
    });
  });
});
