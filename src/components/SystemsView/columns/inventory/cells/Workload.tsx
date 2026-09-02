import React from 'react';
import type { SystemProfileWorkloads } from '@redhat-cloud-services/host-inventory-client';
import LabelWithOverflow from '../../LabelWithOverflow';
import { WORKLOAD_FILTER_OPTIONS } from '../../../utils/workloadsFilter';

interface WorkloadProps {
  value: SystemProfileWorkloads | undefined;
}

const WORKLOAD_LABELS: Record<string, string> = Object.fromEntries(
  WORKLOAD_FILTER_OPTIONS.map((option) => [option.value, option.label]),
);

const Workload = ({ value }: WorkloadProps) => {
  const labels =
    value === undefined
      ? []
      : (Object.keys(value) as Array<keyof SystemProfileWorkloads>)
          .filter((key) => value[key] != null)
          .map((key) => WORKLOAD_LABELS[key])
          .filter((label): label is string => label != null)
          .sort();

  const notAvailableReason =
    value === undefined
      ? 'Workload data is not available for this system'
      : 'No workloads are present for this system';

  return (
    <LabelWithOverflow
      items={labels}
      notAvailableReason={notAvailableReason}
      aria-label="Workloads"
    />
  );
};

export default Workload;
