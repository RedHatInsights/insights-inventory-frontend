import { DataViewTextFilter } from '@patternfly/react-data-view';
import { DataViewCheckboxFilter } from './DataViewCheckboxFilter';
import { DataViewSingleSelectFilter } from './DataViewSingleSelectFilter';
import { DataViewCustomFilter } from './DataViewCustomFilter';
import { getFilterComponent } from './getFilterComponent';
import { tagsSpec } from './inventory/filterDefinitions';
import type {
  CheckboxFilterSpec,
  CustomFilterSpec,
  SingleSelectFilterSpec,
  TextFilterSpec,
} from './types';

const textSpec: TextFilterSpec = {
  type: 'text',
  filterId: 'name',
  title: 'Name',
  defaultValue: '',
};

const checkboxSpec: CheckboxFilterSpec = {
  type: 'checkbox',
  filterId: 'severity',
  title: 'Severity',
  defaultValue: [],
  options: [{ label: 'Critical', value: 'critical' }],
};

const singleSelectSpec: SingleSelectFilterSpec = {
  type: 'single-select',
  filterId: 'status',
  title: 'Status',
  defaultValue: [],
  options: [{ label: 'Active', value: 'active' }],
};

const customSpec: CustomFilterSpec<string[]> = {
  type: 'custom',
  filterId: 'group',
  title: 'Group',
  defaultValue: [],
  filterComponent: () => null,
  createLabel: () => [],
};

describe('getFilterComponent', () => {
  it('maps type "text" to DataViewTextFilter', () => {
    expect(getFilterComponent(textSpec).type).toBe(DataViewTextFilter);
  });

  it('maps type "checkbox" to DataViewCheckboxFilter', () => {
    expect(getFilterComponent(checkboxSpec).type).toBe(DataViewCheckboxFilter);
  });

  it('maps type "single-select" to DataViewSingleSelectFilter', () => {
    expect(getFilterComponent(singleSelectSpec).type).toBe(
      DataViewSingleSelectFilter,
    );
  });

  it('maps type "custom" to DataViewCustomFilter', () => {
    expect(getFilterComponent(customSpec).type).toBe(DataViewCustomFilter);
  });

  it('maps the tags spec through the custom factory', () => {
    expect(getFilterComponent(tagsSpec).type).toBe(DataViewCustomFilter);
  });
});
