import React from 'react';
import type { SystemProfileWorkloads } from '@redhat-cloud-services/host-inventory-client';
import CellValue from '../../CellValue';
import { WORKLOAD_ACRONYMS } from '../../../utils/workloadsFilter';

interface WorkloadProps {
  value: SystemProfileWorkloads | undefined;
}

const Workload = ({ value }: WorkloadProps) => {
  if (value === undefined) {
    return (
      <CellValue
        type="notAvailable"
        reason="Workload data is not available for this system"
      />
    );
  }

  const acronyms = (Object.keys(value) as Array<keyof SystemProfileWorkloads>)
    .filter((key) => value[key] != null)
    .map((key) => WORKLOAD_ACRONYMS[key])
    .filter((acronym): acronym is string => acronym != null)
    .sort();

  if (acronyms.length === 0) {
    return (
      <CellValue
        type="notAvailable"
        reason="No workloads are present for this system"
      />
    );
  }

  return <CellValue type="present" value={acronyms.join(', ')} />;
};

export default Workload;
