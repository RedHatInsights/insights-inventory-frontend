import type {
  CheckboxFilterSpec,
  FilterSpec,
  SingleSelectFilterSpec,
} from '../types';

export const installableAdvisoryTypeSpec: CheckboxFilterSpec = {
  type: 'checkbox',
  filterId: 'installable_advisory_type',
  title: 'Installable advisory type',
  defaultValue: [],
  placeholder: 'Filter by installable advisory type',
  options: [
    { label: 'Security advisories', value: 'security_advisories' },
    { label: 'Bug fixes', value: 'bug_fixes' },
    { label: 'Enhancements', value: 'enhancements' },
    { label: 'Other', value: 'other' },
  ],
};

export const contentTemplateSpec: SingleSelectFilterSpec = {
  type: 'single-select',
  filterId: 'content_template',
  title: 'Content template',
  defaultValue: [],
  placeholder: 'Filter by content template',
  options: [
    { label: 'Template assigned', value: 'assigned' },
    { label: 'No template assigned', value: 'not_assigned' },
  ],
};

export const contentFilterSpecs: readonly FilterSpec[] = [
  installableAdvisoryTypeSpec,
  contentTemplateSpec,
];
