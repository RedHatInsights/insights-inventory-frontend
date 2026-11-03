import type {
  CheckboxFilterSpec,
  FilterSpec,
  SingleSelectFilterSpec,
} from '../types';

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

export const advisorFilterSpecs: readonly FilterSpec[] = [
  recommendationSeveritySpec,
  incidentStatusSpec,
];
