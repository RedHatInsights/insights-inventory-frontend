/**
 * Toolbar workload filter options. `value` is the key under `system_profile.workloads`
 * (see system_profile.spec.yaml → SystemProfile.properties.workloads.properties).
 */
export const WORKLOAD_FILTER_OPTIONS = [
  { label: 'Ansible Automation Platform', value: 'ansible' },
  { label: 'CrowdStrike', value: 'crowdstrike' },
  { label: 'IBM DB2', value: 'ibm_db2' },
  { label: 'InterSystems', value: 'intersystems' },
  { label: 'Microsoft SQL', value: 'mssql' },
  { label: 'Oracle DB', value: 'oracle_db' },
  { label: 'RHEL AI', value: 'rhel_ai' },
  { label: 'SAP', value: 'sap' },
] as const;

/**
 * Nested `filter.system_profile.workloads` fragment for host list API.
 * Each key represents a workload name (e.g., 'sap', 'ansible') and uses a
 * presence check to filter hosts.
 */
export type WorkloadsPresenceFilter = Record<string, { is: 'not_nil' }>;

/**
 * Maps Workload checkbox values to `filter.system_profile.workloads` for the host list API.
 *
 * Each selected workload is sent as a presence check on that key. The backend
 * treats these as `not_nil` checks on the workload JSON object.
 * Query shape: `filter[system_profile][workloads][sap][is]=not_nil`
 *
 *  @param workloadKeys - Workload names from the toolbar filter state (e.g. `['sap', 'ansible']`)
 *  @returns            Profile Filter or undefined when there is nothing to filter
 */
export const buildWorkloadsFilter = (
  workloadKeys: string[] | undefined,
): WorkloadsPresenceFilter | undefined => {
  if (!workloadKeys?.length) {
    return undefined;
  }

  return Object.fromEntries(
    workloadKeys.map((key) => [key, { is: 'not_nil' as const }]),
  );
};
