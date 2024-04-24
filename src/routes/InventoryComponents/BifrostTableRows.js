import React from 'react';
import propTypes from 'prop-types';
import { Td } from '@patternfly/react-table';

const BifrostTableRows = ({ column, data }) => {
  return (
    <Td
      dataLabel={column.title}
      colSpan={column.colSpan}
      className={column.classname}
    >
      {data[column.ref]}
    </Td>
  );
};

BifrostTableRows.propTypes = {
  column: propTypes.object,
  data: propTypes.object,
};

export default BifrostTableRows;
