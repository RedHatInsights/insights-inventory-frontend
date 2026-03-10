/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react';
import { useCanDeleteHostDetails } from './useCanDeleteHostDetails';

const mockUseKesselMigrationFeatureFlag = jest.fn();
const mockUseSelfAccessCheck = jest.fn();

jest.mock('./useKesselMigrationFeatureFlag', () => ({
  useKesselMigrationFeatureFlag: () => mockUseKesselMigrationFeatureFlag(),
}));

jest.mock('@project-kessel/react-kessel-access-check', () => ({
  useSelfAccessCheck: (opts) => mockUseSelfAccessCheck(opts),
}));

describe('useCanDeleteHostDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseKesselMigrationFeatureFlag.mockReturnValue(false);
    mockUseSelfAccessCheck.mockReturnValue({ data: undefined, loading: false });
  });

  describe('when Kessel migration flag is OFF', () => {
    it('returns canDelete undefined and isLoading false (caller should use RBAC)', () => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(false);

      const { result } = renderHook(() => useCanDeleteHostDetails('host-123'));

      expect(result.current).toEqual({
        canDelete: undefined,
        isLoading: false,
      });
      expect(mockUseSelfAccessCheck).toHaveBeenCalled();
    });

    it('returns same when hostId is undefined', () => {
      const { result } = renderHook(() => useCanDeleteHostDetails(undefined));

      expect(result.current).toEqual({
        canDelete: undefined,
        isLoading: false,
      });
    });
  });

  describe('when Kessel migration flag is ON', () => {
    beforeEach(() => {
      mockUseKesselMigrationFeatureFlag.mockReturnValue(true);
    });

    it('returns canDelete false and isLoading false when hostId is undefined', () => {
      const { result } = renderHook(() => useCanDeleteHostDetails(undefined));

      expect(result.current).toEqual({ canDelete: false, isLoading: false });
    });

    it('returns canDelete false when hostId is empty string', () => {
      const { result } = renderHook(() => useCanDeleteHostDetails(''));

      expect(result.current).toEqual({ canDelete: false, isLoading: false });
    });

    it('returns canDelete true when useSelfAccessCheck reports allowed', () => {
      mockUseSelfAccessCheck.mockReturnValue({
        data: { allowed: true },
        loading: false,
      });

      const { result } = renderHook(() => useCanDeleteHostDetails('host-456'));

      expect(result.current).toEqual({ canDelete: true, isLoading: false });
    });

    it('returns canDelete false when useSelfAccessCheck reports not allowed', () => {
      mockUseSelfAccessCheck.mockReturnValue({
        data: { allowed: false },
        loading: false,
      });

      const { result } = renderHook(() => useCanDeleteHostDetails('host-789'));

      expect(result.current).toEqual({ canDelete: false, isLoading: false });
    });

    it('returns canDelete false when useSelfAccessCheck data is undefined (e.g. still resolving)', () => {
      mockUseSelfAccessCheck.mockReturnValue({
        data: undefined,
        loading: false,
      });

      const { result } = renderHook(() => useCanDeleteHostDetails('host-abc'));

      expect(result.current).toEqual({ canDelete: false, isLoading: false });
    });

    it('returns isLoading true when useSelfAccessCheck is loading', () => {
      mockUseSelfAccessCheck.mockReturnValue({
        data: undefined,
        loading: true,
      });

      const { result } = renderHook(() => useCanDeleteHostDetails('host-xyz'));

      expect(result.current).toEqual({ canDelete: false, isLoading: true });
    });

    it('passes hostId and delete relation to useSelfAccessCheck', () => {
      mockUseSelfAccessCheck.mockReturnValue({
        data: { allowed: true },
        loading: false,
      });

      renderHook(() => useCanDeleteHostDetails('my-host-id'));

      expect(mockUseSelfAccessCheck).toHaveBeenCalledWith(
        expect.objectContaining({
          relation: 'delete',
          resource: expect.objectContaining({
            id: 'my-host-id',
            type: 'host',
            reporter: { type: 'hbi' },
          }),
        }),
      );
    });
  });
});
