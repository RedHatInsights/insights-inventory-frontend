import React from 'react';
import { TableToolsTable } from 'bastilian-tabletools';

import columns from './columns';
import filters, { CUSTOM_FILTER_TYPES } from './filters';

const SystemsTable = ({ items, options }) => {
  return (
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
};

export default SystemsTable;
