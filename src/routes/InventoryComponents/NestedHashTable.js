import React from 'react';
import propTypes from 'prop-types';
import { Table, Thead, Tr, Th, Tbody } from '@patternfly/react-table';
import { hashTableColumns } from './BifrostTableColumns';
import BifrostTableRows from './BifrostTableRows';

const NestedHashTable = ({ hashes }) => {
  return (
    <Table aria-label="Image table" variant="compact">
      <Thead>
        <Tr>
          {hashTableColumns.map((col) => {
            return (
              <Th key={col.title} colSpan={col.colSpan}>
                {col.title}
              </Th>
            );
          })}
        </Tr>
      </Thead>
      <Tbody>
        {hashes.map((hash) => (
          <Tr key={hash.image_digest}>
            {hashTableColumns.map((col) => (
              <BifrostTableRows
                key={`${hash.image_digest}-${col.title}`}
                column={col}
                data={hash}
              />
            ))}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};

NestedHashTable.propTypes = {
  hashes: propTypes.array,
};

export default NestedHashTable;
