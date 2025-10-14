import { DEFAULT_OPTIONS } from './constants';

import * as columns from './columns';
import * as filters from './filters';
import * as filterTypes from './filterTypes';

const { default: defaultColumns, ...inventoryColumns } = columns;
const { default: defaultFilters, ...inventoryFilters } = filters;
const { default: defaultFilterTypes, ...inventoryFilterTypes } = filterTypes;

export const resolveOptions = (options = DEFAULT_OPTIONS) =>
  typeof options === 'function' ? options(DEFAULT_OPTIONS) : options;

export const resolveColumns = (columns = defaultColumns) =>
  typeof columns === 'function' ? columns(inventoryColumns) : columns;

export const resolveFilters = (
  filters = {
    filterConfig: defaultFilters,
    customFilterTypes: defaultFilterTypes,
  },
) => {
  if (typeof filters === 'function') {
    const { filterConfig, customFilterTypes } = filters(
      inventoryFilters,
      inventoryFilterTypes,
    );

    return {
      filterConfig,
      customFilterTypes: {
        ...inventoryFilterTypes,
        ...(customFilterTypes || {}),
      },
    };
  } else {
    return filters;
  }
};
