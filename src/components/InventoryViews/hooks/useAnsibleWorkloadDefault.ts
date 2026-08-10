import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import type { InventoryFilters } from '../../SystemsView/filters/SystemsViewFilters';

const WORKLOADS_PARAM = 'workloads';
const ANSIBLE_WORKLOAD = 'ansible';

const ANSIBLE_DEFAULT_FILTERS: Partial<InventoryFilters> = {
  workloads: [ANSIBLE_WORKLOAD],
};

// Replaces the global filter's Ansible workload pre-selection that
// chrome used to inject via GLOBAL_FILTER_UPDATE for /ansible/* routes.
export const useAnsibleWorkloadDefault = () => {
  const { getBundle } = useChrome();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAnsibleBundle = getBundle() === ANSIBLE_WORKLOAD;
  const hasWorkloadsParam = searchParams.has(WORKLOADS_PARAM);

  // Prevents the hook from re-applying the default after the user
  // explicitly removes the filter via chip X. Without this guard,
  // removing workloads from the URL would immediately trigger the
  // effect to set it back. Resets on page refresh so the default
  // is reapplied on fresh navigation.
  const appliedRef = useRef(false);

  const needsDefault =
    isAnsibleBundle && !hasWorkloadsParam && !appliedRef.current;

  useEffect(() => {
    if (!needsDefault) {
      return;
    }

    appliedRef.current = true;

    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(WORKLOADS_PARAM, ANSIBLE_WORKLOAD);
        return next;
      },
      { replace: true },
    );
  }, [needsDefault, setSearchParams]);

  const defaultFilters = isAnsibleBundle ? ANSIBLE_DEFAULT_FILTERS : undefined;

  return { isReady: !needsDefault, defaultFilters };
};
