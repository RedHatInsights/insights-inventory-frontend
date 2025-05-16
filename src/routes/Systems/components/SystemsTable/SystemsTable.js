import React from 'react';
import { TableToolsTable } from 'bastilian-tabletools';

import columns from './columns';
import filters from './filters';

const SystemsTable = ({ fetchSystems, options }) => {
  return (
    <TableToolsTable
      variant="compact"
      items={fetchSystems}
      columns={columns}
      filters={{ filterConfig: filters }}
      options={options}
    />
  );
};

export default SystemsTable;
