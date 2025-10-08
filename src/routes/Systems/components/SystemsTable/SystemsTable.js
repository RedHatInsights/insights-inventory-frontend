import React from 'react';
import PropTypes from 'prop-types';
import { TableToolsTable, TableStateProvider } from 'bastilian-tabletools';
import { fetchSystems } from '../../helpers.js';
import useGlobalFilterForItems from './hooks/useGlobalFilterForItems';

import { resolveColumns, resolveFilters, resolveOptions } from './helpers';

const SystemsTable = ({
  items: itemsProp = fetchSystems,
  columns,
  filters,
  options,
  ...props
}) => {
  const items = useGlobalFilterForItems(itemsProp);

  return (
    <TableToolsTable
      items={items}
      columns={resolveColumns(columns)}
      filters={resolveFilters(filters)}
      options={resolveOptions(options)}
      {...props}
    />
  );
};

SystemsTable.propTypes = {
  items: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  columns: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  filters: PropTypes.oneOfType([PropTypes.array, PropTypes.func]),
  options: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
};

const SystemsTableWithProvider = (props) => (
  <TableStateProvider>
    <SystemsTable {...props} />
  </TableStateProvider>
);

export default SystemsTableWithProvider;
