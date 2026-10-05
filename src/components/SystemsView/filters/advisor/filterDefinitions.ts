import type { CheckboxFilterSpec, SingleSelectFilterSpec } from '../types';

/**
 * Advisor app-data filter specs (RHINENG-31144), bound to the `/hosts/views`
 * toolbar only — the classic `/hosts` list endpoint does not support
 * app-data filtering. Per-service specs live in their own directory,
 * mirroring the per-app layout under `columns/` (columns/advisor, ...).
 */
export const recommendationSeveritySpec: CheckboxFilterSpec = {
  type: 'checkbox',
  filterId: 'recommendation_severity',
  title: 'Recommendation severity',
  defaultValue: [],
  placeholder: 'Filter by recommendation severity',
  options: [
    { label: 'Critical', value: 'critical' },
    { label: 'Important', value: 'important' },
    { label: 'Moderate', value: 'moderate' },
    { label: 'Low', value: 'low' },
  ],
};

export const incidentStatusSpec: SingleSelectFilterSpec = {
  type: 'single-select',
  filterId: 'incident_status',
  title: 'Incidents',
  defaultValue: [],
  placeholder: 'Filter by incidents',
  options: [
    { label: 'Has incidents', value: 'incident' },
    { label: 'No incidents', value: 'no_incident' },
  ],
};
