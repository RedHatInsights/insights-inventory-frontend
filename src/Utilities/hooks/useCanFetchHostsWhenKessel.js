import { useState, useEffect } from 'react';
import { useAxiosWithPlatformInterceptors } from '@redhat-cloud-services/frontend-components-utilities/interceptors';
import { getHostList } from '../../api/hostInventoryApi';
import { useKesselMigrationFeatureFlag } from './useKesselMigrationFeatureFlag';

/**
 * When Kessel migration is enabled, RBAC is bypassed and we need another way
 * to show the "no access" state when the user cannot fetch hosts. This hook
 * probes the host list API once; a 403 response is treated as no access.
 *
 * When Kessel is disabled, this hook returns undefined so the caller should
 * use RBAC (useConditionalRBAC) for hasAccess.
 *
 *  @returns {{ hasAccess: boolean | undefined, isLoading: boolean } | undefined}
 *                                                                                - When Kessel is off: undefined (caller uses RBAC).
 *                                                                                - When Kessel is on: { hasAccess, isLoading }. hasAccess is undefined until
 *                                                                                  the probe completes; isLoading is true while the probe is in flight.
 */
export const useCanFetchHostsWhenKessel = () => {
  const isKesselEnabled = useKesselMigrationFeatureFlag();
  const axios = useAxiosWithPlatformInterceptors();
  const [state, setState] = useState(() =>
    isKesselEnabled ? { hasAccess: undefined, isLoading: true } : undefined,
  );

  useEffect(() => {
    if (!isKesselEnabled) {
      setState(undefined);
      return;
    }

    const probe = async () => {
      try {
        await getHostList({
          page: 1,
          per_page: 1,
          options: { axios },
        });

        setState({ hasAccess: true, isLoading: false });
      } catch (err) {
        const status = err?.response?.status ?? err?.status;

        setState({
          hasAccess: status === 403 ? false : true,
          isLoading: false,
        });
      }
    };

    probe();
  }, [isKesselEnabled, axios]);

  return state;
};
