import type { CheckboxFilterSpec, FilterSpec } from '../types';

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
    { label: 'Not analyzed', value: 'not_analyzed' },
  ],
};

export const incidentStatusSpec: CheckboxFilterSpec = {
  type: 'checkbox',
  filterId: 'incident_status',
  title: 'Incidents',
  defaultValue: [],
  placeholder: 'Filter by incidents',
  options: [
    { label: 'Present', value: 'present' },
    { label: 'Not present', value: 'not_present' },
    { label: 'Not analyzed', value: 'not_analyzed' },
  ],
};

export const advisorFilterSpecs: readonly FilterSpec[] = [
  recommendationSeveritySpec,
  incidentStatusSpec,
];
