import React from 'react';
import { TableToolsTable } from 'bastilian-tabletools';

import columns from './columns';
import filters, { CUSTOM_FILTER_TYPES } from './filters';

// TODO items should default to Inventory API if no function or array is passed
// TODO columns should be "customisable" similar to how the current Inventory does it
// TODO Filters should be customisable enable/disable, extend, etc.
// TODO "global filter" needs to be integrated
const SystemsTable = ({ items, options }) => (
  <TableToolsTable
    variant="compact"
    items={items}
    columns={columns}
    filters={{
      customFilterTypes: CUSTOM_FILTER_TYPES,
      filterConfig: filters,
    }}
    options={options}
  />
);

export default SystemsTable;
