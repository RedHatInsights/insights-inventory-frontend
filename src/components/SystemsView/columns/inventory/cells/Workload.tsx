import React from 'react';
import type { SystemProfileWorkloads } from '@redhat-cloud-services/host-inventory-client';
import LabelWithOverflow from '../../LabelWithOverflow';
import { WORKLOAD_ACRONYMS } from '../../../utils/workloadsFilter';

interface WorkloadProps {
  value: SystemProfileWorkloads | undefined;
}

const Workload = ({ value }: WorkloadProps) => {
  const acronyms =
    value === undefined
      ? []
      : (Object.keys(value) as Array<keyof SystemProfileWorkloads>)
          .filter((key) => value[key] != null)
          .map((key) => WORKLOAD_ACRONYMS[key])
          .filter((acronym): acronym is string => acronym != null)
          .sort();

  const notAvailableReason =
    value === undefined
      ? 'Workload data is not available for this system'
      : 'No workloads are present for this system';

  return (
    <LabelWithOverflow
      items={acronyms}
      notAvailableReason={notAvailableReason}
      aria-label="Workloads"
    />
  );
};

export default Workload;
