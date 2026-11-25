import type {
  CheckboxFilterSpec,
  FilterSpec,
  SingleSelectFilterSpec,
} from '../types';

const APP_NAME = 'content' as const;

export const installableAdvisoryTypeSpec: CheckboxFilterSpec = {
  type: 'checkbox',
  appName: APP_NAME,
  filterId: 'installable_advisory_type',
  title: 'Installable advisory type',
  defaultValue: [],
  placeholder: 'Filter by installable advisory type',
  options: [
    { label: 'Security advisories', value: 'security' },
    { label: 'Bug fixes', value: 'bugfix' },
    { label: 'Enhancements', value: 'enhancement' },
    { label: 'Other', value: 'other' },
    { label: 'Not evaluated', value: 'not_evaluated' },
  ],
};

export const templateSpec: SingleSelectFilterSpec = {
  type: 'single-select',
  appName: APP_NAME,
  filterId: 'template',
  title: 'Template',
  defaultValue: [],
  placeholder: 'Filter by template',
  options: [
    { label: 'Present', value: 'present' },
    { label: 'Not present', value: 'not_present' },
  ],
};

export const contentFilterSpecs: readonly FilterSpec[] = [
  installableAdvisoryTypeSpec,
  templateSpec,
];
