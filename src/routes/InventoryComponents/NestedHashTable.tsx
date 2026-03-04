import React from 'react';
import { Table, Thead, Tr, Th, Tbody } from '@patternfly/react-table';
import { hashTableColumns } from './BifrostTableColumns';
import BifrostTableRows from './BifrostTableRows';
import { ImageHash } from '../../components/InventoryViews/ImagesView/utils/getImageSummary';

interface NestedHashTableProps {
  hashes: ImageHash[];
}
export const NestedHashTable = ({ hashes }: NestedHashTableProps) => {
  return (
    <Table aria-label="Hash commit table" variant="compact">
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

export default NestedHashTable;
