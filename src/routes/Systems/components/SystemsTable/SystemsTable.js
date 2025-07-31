import React from 'react';
import PropTypes from 'prop-types';
import { TableToolsTable } from 'bastilian-tabletools';

import filters, { CUSTOM_FILTER_TYPES } from './filters';
import { fetchSystems, resolveColumns } from '../../helpers.js';
import { DEFAULT_OPTIONS } from './constants';

// TODO Filters should be customisable enable/disable, extend, etc.
// TODO "global filter" needs to be integrated
const SystemsTable = ({ items = fetchSystems, columns = [], options = {} }) => {
  return (
    <TableToolsTable
      variant="compact"
      items={items}
      columns={resolveColumns(columns)}
      filters={{
        customFilterTypes: CUSTOM_FILTER_TYPES,
        filterConfig: filters,
      }}
      options={{
        ...DEFAULT_OPTIONS,
        ...options,
      }}
    />
  );
};

SystemsTable.propTypes = {
  items: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  columns: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  options: PropTypes.object,
};

export default SystemsTable;
