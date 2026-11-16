import type {
  CheckboxFilterSpec,
  FilterSpec,
  SingleSelectFilterSpec,
} from '../types';

/**
 * Installable advisory type. The values are OR'd, so this is a checkbox
 * filter: `security`, `bugfix`, `enhancement` and `other` each match hosts
 * whose installable count for that advisory type is above zero, while
 * `not_evaluated` matches hosts Content never reported on.
 *
 * Labels mirror the `Installable advisories` column's icon tooltips so the
 * toolbar and the column name the same four advisory types.
 */
export const installableAdvisoryTypeSpec: CheckboxFilterSpec = {
  type: 'checkbox',
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

/**
 * Template assignment. The backend models this as a single scalar rather than
 * a repeated param, so this is single-select: `present` matches a published
 * Content row with a `template_uuid`, `not_present` one without. Unlike the
 * other Content filter there is no `not_evaluated` option — a host with no
 * Content data matches neither value.
 */
export const templateSpec: SingleSelectFilterSpec = {
  type: 'single-select',
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
