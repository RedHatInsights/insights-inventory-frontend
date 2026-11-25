import type { CheckboxFilterSpec, FilterSpec } from '../types';

const APP_NAME = 'advisor' as const;

export const recommendationSeveritySpec: CheckboxFilterSpec = {
  type: 'checkbox',
  appName: APP_NAME,
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
  appName: APP_NAME,
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
  incidentStatusSpec,
  recommendationSeveritySpec,
];
