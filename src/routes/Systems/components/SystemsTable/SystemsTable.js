import React from 'react';
import PropTypes from 'prop-types';
import { TableToolsTable } from 'bastilian-tabletools';

import { resolveColumns } from './columns';
import filters, { CUSTOM_FILTER_TYPES } from './filters';
import { fetchSystems } from '../../helpers.js';

// TODO Filters should be customisable enable/disable, extend, etc.
// TODO "global filter" needs to be integrated
const defaultOptions = {
  perPage: 50,
  // FIXME: selection should not be reloading table
  onSelect: () => true,
};

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
        ...defaultOptions,
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
