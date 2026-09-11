import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useChrome from '@redhat-cloud-services/frontend-components/useChrome';
import { ANSIBLE_WORKLOAD } from '../stampAnsibleWorkloadDefault';

const WORKLOADS_PARAM = 'workloads';

/**
 * Seeds `workloads=ansible` in the URL on the Ansible bundle so PatternFly
 * array filters pick up the stamped default. Seeds once: chip-X dropping the
 * param must stay off the URL so the view can go dirty.
 *
 *  @returns Ansible bundle flag and whether the initial URL seed has finished
 */
export const useAnsibleWorkloadsSearchParam = () => {
  const { getBundle } = useChrome();
  const [searchParams, setSearchParams] = useSearchParams();
  const isAnsibleBundle = getBundle() === ANSIBLE_WORKLOAD;
  const [hasSeeded, setHasSeeded] = useState(
    () => !isAnsibleBundle || searchParams.has(WORKLOADS_PARAM),
  );

  useEffect(() => {
    if (!isAnsibleBundle || hasSeeded) {
      return;
    }

    setSearchParams(
      (prev) => {
        if (prev.has(WORKLOADS_PARAM)) {
          return prev;
        }
        const next = new URLSearchParams(prev);
        next.set(WORKLOADS_PARAM, ANSIBLE_WORKLOAD);
        return next;
      },
      { replace: true },
    );
    setHasSeeded(true);
  }, [hasSeeded, isAnsibleBundle, setSearchParams]);

  return { isAnsibleBundle, isReady: hasSeeded };
};
