import { getTags } from '../../../../api/hostInventoryApi';
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

export const fetchTags = async () => {
  return await getTags();
};

export const osVersionSorter = (a, b) =>
  b.major === a.major ? b.minor - a.minor : b.major - a.major;

export const getOsSelectOptions = (osName, osData) => {
  if (!osData) return [];

  const osItems = osData
    .filter((item) => item.name === osName)
    .toSorted(osVersionSorter);
  const majors = [...new Set(osItems.map((item) => item.major))];

  return majors.map((major) => ({
    label: `${osName} ${major}`,
    value: `${osName}`,
    items: osItems
      .filter((item) => item.major === major)
      .map((item) => ({
        label: `${item.name} ${item.major}.${item.minor}`,
        value: `${item.major}.${item.minor}`,
      })),
  }));
};

export const stringToId = (string) =>
  string.split(/\s+/).join('-').toLowerCase();
