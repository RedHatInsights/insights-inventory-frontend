import React from 'react';
import PropTypes from 'prop-types';
import { TableToolsTable } from 'bastilian-tabletools';
import { fetchSystems, resolveColumns, resolveFilters } from '../../helpers.js';
import { DEFAULT_OPTIONS } from './constants';
import DateRangeSelector from './components/DateRangeSelector.js';

// TODO "global filter" needs to be integrated
const SystemsTable = ({
  items = fetchSystems,
  columns = [],
  filters,
  options = {},
}) => {
  return (
    <TableToolsTable
      variant="compact"
      items={items}
      columns={resolveColumns(columns)}
      filters={resolveFilters(filters)}
      toolbarProps={{
        children: <DateRangeSelector />,
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
  filters: PropTypes.object,
  options: PropTypes.object,
};

export default SystemsTable;
