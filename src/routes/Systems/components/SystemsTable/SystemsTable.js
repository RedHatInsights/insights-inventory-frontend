import React from 'react';
import PropTypes from 'prop-types';
import { TableToolsTable } from 'bastilian-tabletools';

import columns from './columns';
import filters, { CUSTOM_FILTER_TYPES } from './filters';
import { fetchSystems } from '../../helpers.js';

// TODO columns should be "customisable" similar to how the current Inventory does it. Allow for fn and objs to be passed in
// TODO Filters should be customisable enable/disable, extend, etc.
// TODO "global filter" needs to be integrated
const defaultOptions = {
  perPage: 50,
  // FIXME: selection should not be reloading table
  onSelect: () => true,
};

const SystemsTable = ({ items = fetchSystems, options }) => {
  return (
    <TableToolsTable
      variant="compact"
      items={items}
      columns={columns}
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
  options: PropTypes.object,
};

export default SystemsTable;
