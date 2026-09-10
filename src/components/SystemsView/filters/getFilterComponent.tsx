import React, { type ReactElement } from 'react';
import {
  DataViewCheckboxFilter,
  DataViewTextFilter,
} from '@patternfly/react-data-view';
import {
  DataViewCustomFilter,
  type DataViewCustomFilterProps,
} from './DataViewCustomFilter';
import type { FilterSpec } from './types';

/**
 * PatternFly child for `DataViewFilters`. Returns the PF filter element
 * itself so `value` / `onChange` / `showToolbarItem` inject onto that node.
 *
 *  @param spec - Discriminated filter spec (`text` | `checkbox` | `custom`)
 *  @returns    A `DataViewTextFilter`, `DataViewCheckboxFilter`, or `DataViewCustomFilter` element
 */
export const getFilterComponent = (spec: FilterSpec): ReactElement => {
  switch (spec.type) {
    case 'text':
      return (
        <DataViewTextFilter
          key={spec.filterId}
          filterId={spec.filterId}
          title={spec.title}
          chipTitle={spec.chipTitle}
          placeholder={spec.placeholder}
        />
      );
    case 'checkbox':
      return (
        <DataViewCheckboxFilter
          key={spec.filterId}
          filterId={spec.filterId}
          title={spec.title}
          placeholder={spec.placeholder}
          options={spec.options}
        />
      );
    case 'custom':
      return (
        <DataViewCustomFilter<unknown>
          key={spec.filterId}
          filterId={spec.filterId}
          title={spec.title}
          placeholder={spec.placeholder}
          ouiaId={spec.ouiaId}
          isMultiGroup={spec.isMultiGroup}
          filterComponent={
            spec.filterComponent as DataViewCustomFilterProps<unknown>['filterComponent']
          }
          createLabel={
            spec.createLabel as DataViewCustomFilterProps<unknown>['createLabel']
          }
          deleteLabel={
            spec.deleteLabel as DataViewCustomFilterProps<unknown>['deleteLabel']
          }
        />
      );
  }
};
