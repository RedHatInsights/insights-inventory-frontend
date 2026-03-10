import { useMemo } from 'react';
import { useSelfAccessCheck } from '@project-kessel/react-kessel-access-check';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';
import { HOST_RESOURCE_TYPE, HOST_RESOURCE_TYPE_DELETE } from '../../constants';

/** Reporter for access checks; README recommends { type: 'rbac' } for RBAC-based authorization. */
const REPORTER = { type: 'hbi' as const };

/**
 * Single-resource Kessel delete permission check for the system details page.
 * Only runs when the Kessel migration feature flag is enabled; otherwise returns
 * undefined so the caller uses RBAC (useConditionalRBAC) for delete permission.
 *
 *  @param hostId - Current system/host ID (e.g. entity?.id). When empty and Kessel is on, returns no permission.
 *  @returns      canDelete: true when allowed, false when denied or loading; undefined when Kessel is off (use RBAC). isLoading only true when Kessel is on and check is in progress.
 */
export const useCanDeleteHostDetails = (hostId: string | undefined) => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();

  const { data, loading } = useSelfAccessCheck({
    relation: HOST_RESOURCE_TYPE_DELETE,
    resource: {
      id: hostId ?? '',
      type: HOST_RESOURCE_TYPE,
      reporter: REPORTER,
    },
  });

  if (!isKesselEnabled) {
    return { canDelete: undefined, isLoading: false };
  }

  if (!hostId) {
    return { canDelete: false, isLoading: false };
  }

  return {
    canDelete: data?.allowed ?? false,
    isLoading: loading,
  };
};
