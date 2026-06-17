import { NOT_AVAILABLE } from '../../../../../constants';
import { InventoryViewSystem } from '../../../hooks/useInventoryViewsQuery';
import { WORKLOAD_ACRONYMS } from '../../../utils/workloadsFilter';

interface WorkloadProps {
  system: InventoryViewSystem;
}

const Workload = ({ system }: WorkloadProps) => {
  const workloads = system.system_profile?.workloads as
    | Record<string, unknown>
    | undefined;

  if (!workloads) {
    return NOT_AVAILABLE;
  }

  const acronyms = Object.keys(workloads)
    .filter((key) => workloads[key] != null)
    .map((key) => WORKLOAD_ACRONYMS[key as keyof typeof WORKLOAD_ACRONYMS])
    .filter((acronym): acronym is string => acronym != null)
    .sort();

  if (acronyms.length === 0) {
    return NOT_AVAILABLE;
  }

  return acronyms.join(', ');
};

export default Workload;
