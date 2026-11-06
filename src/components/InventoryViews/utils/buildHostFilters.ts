import {
  HostFiltersSystemTypeEnum,
  type HostFilters,
  type HostFiltersCveSeverityEnum,
  type HostFiltersIncidentStatusEnum,
  type HostFiltersKnownExploitEnum,
  type HostFiltersRecommendationSeverityEnum,
  type HostFiltersSecurityRuleEnum,
} from '@redhat-cloud-services/host-inventory-client';
import { normalizeLastSeenFilterValue } from '../../SystemsView/constants';
import type {
  LastSeenCustomRange,
  SystemsViewFilterState,
} from '../../SystemsView/types';
import { lastSeenKeysToApiParams } from './lastSeenKeysToApiParams';
import { buildSystemType } from './buildSystemType';

const asStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.map(String) : [];

// The generated client's HostFilters predates the backend's workspace_id
// filter (matched by workspace UUID, like the table's own workspaceId query
// param). Extend it locally until the regenerated client lands.
export type HostFiltersWithWorkspaceId = HostFilters & {
  workspace_id?: Array<string>;
};

/**
 * Maps flat toolbar host-level filters to the nested `host` HostFilters block of a
 * view configuration.
 *
 * Covers hostname_or_id, staleness, registered_with, tags, workspace_id,
 * system_type, the last_check_in date range derived from the Last seen selection,
 * alongside app-specific filters (recommendationSeverity, incidentStatus, cveSeverity,
 * knownExploit, securityRule).
 *
 *  @param filters             - Toolbar filter state for host-level filters
 *  @param lastSeenCustomRange - Custom date range when `last_seen` is 'custom'.
 *                             Get from DataViewFiltersContext.lastSeenCustomRange in SystemsView.
 *  @returns                   HostFilters object, or undefined when no host filters are active
 */
export const buildHostFilters = (
  filters: SystemsViewFilterState,
  lastSeenCustomRange?: LastSeenCustomRange,
): HostFiltersWithWorkspaceId | undefined => {
  const hostFilters: HostFiltersWithWorkspaceId = {};
  const hostnameOrId =
    typeof filters.hostname_or_id === 'string' ? filters.hostname_or_id : '';
  const status = asStringList(filters.status);
  const source = asStringList(filters.source);
  const tags = asStringList(filters.tags);
  const groupId = asStringList(filters.group_id);
  const systemType = asStringList(filters.system_type);
  const recommendationSeverity = asStringList(filters.recommendation_severity);
  const incidentStatus = asStringList(filters.incident_status);
  const cveSeverity = asStringList(filters.cve_severity);
  const knownExploit = asStringList(filters.known_exploit);
  const securityRule = asStringList(filters.security_rule);

  if (hostnameOrId) {
    hostFilters.hostname_or_id = hostnameOrId;
  }

  if (status.length) {
    hostFilters.staleness = status as HostFilters['staleness'];
  }

  if (source.length) {
    hostFilters.registered_with = source;
  }

  if (tags.length) {
    hostFilters.tags = tags;
  }

  if (groupId.length) {
    // The workspace filter selects workspace UUIDs, and the backend matches
    // workspace_id by UUID (like the table's own workspaceId query param).
    // workspace_name is name-matched server-side and must not carry UUIDs.
    hostFilters.workspace_id = groupId;
  }

  if (systemType.length) {
    const mapped = buildSystemType(
      systemType,
      Object.values(HostFiltersSystemTypeEnum),
    );
    if (mapped.length) {
      hostFilters.system_type = mapped;
    }
  }

  if (recommendationSeverity.length) {
    hostFilters.recommendation_severity =
      recommendationSeverity as HostFiltersRecommendationSeverityEnum[];
  }

  if (incidentStatus.length) {
    hostFilters.incident_status =
      incidentStatus[0] as HostFiltersIncidentStatusEnum;
  }

  if (cveSeverity.length) {
    hostFilters.cve_severity = cveSeverity as HostFiltersCveSeverityEnum[];
  }

  if (knownExploit.length) {
    hostFilters.known_exploit = knownExploit[0] as HostFiltersKnownExploitEnum;
  }

  if (securityRule.length) {
    hostFilters.security_rule = securityRule[0] as HostFiltersSecurityRuleEnum;
  }

  const lastSeenParams = lastSeenKeysToApiParams(
    normalizeLastSeenFilterValue(filters.last_seen),
    lastSeenCustomRange ?? {},
  );
  if (lastSeenParams?.lastCheckInStart) {
    hostFilters.last_check_in_start = lastSeenParams.lastCheckInStart;
  }
  if (lastSeenParams?.lastCheckInEnd) {
    hostFilters.last_check_in_end = lastSeenParams.lastCheckInEnd;
  }

  return Object.keys(hostFilters).length > 0 ? hostFilters : undefined;
};
