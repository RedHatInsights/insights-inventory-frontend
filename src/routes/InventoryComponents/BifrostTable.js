import React, { useState } from 'react';
import propTypes from 'prop-types';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  ExpandableRowContent,
} from '@patternfly/react-table';
import { SkeletonTable } from '@redhat-cloud-services/frontend-components/SkeletonTable';
import { imageTableColumns } from './BifrostTableColumns';
import NestedHashTable from './NestedHashTable';
import BifrostTableRows from './BifrostTableRows';

const BifrostTable = ({ bootcImages, loaded }) => {
  const [expandedImageNames, setExpandedImageNames] = useState([]);

  const setImageExpanded = (image, isExpanding = true) =>
    setExpandedImageNames((prevExpanded) => {
      const otherExpandedImageNames = prevExpanded.filter(
        (r) => r !== image.image
      );
      return isExpanding
        ? [...otherExpandedImageNames, image.image]
        : otherExpandedImageNames;
    });

  const isImageExpanded = (image) => expandedImageNames.includes(image.image);

  return (
    <>
      {loaded ? (
        <Table aria-label="Bootc image table">
          <Thead>
            <Tr>
              <Td />
              {imageTableColumns.map((col) => (
                <Th
                  key={col.title}
                  colSpan={col.colSpan}
                  className={col.classname}
                >
                  {col.title}
                </Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {bootcImages?.map((image, rowIndex) => (
              <>
                <Tr key={image.image}>
                  {image.hashes ? (
                    <Td
                      expand={{
                        rowIndex,
                        isExpanded: isImageExpanded(image),
                        onToggle: () =>
                          setImageExpanded(image, !isImageExpanded(image)),
                        expandId: 'composable-nested-table-expandable-example',
                      }}
                    />
                  ) : (
                    <Td />
                  )}
                  {imageTableColumns.map((col) => (
                    <BifrostTableRows
                      key={`${image.image}-${col.title}`}
                      column={col}
                      data={image}
                    />
                  ))}
                </Tr>
                {image.hashes ? (
                  <Tr isExpanded={isImageExpanded(image)}>
                    <Td
                      dataLabel={`${imageTableColumns[0].title} expanded`}
                      colSpan={12}
                      style={{ paddingRight: '0px' }}
                    >
                      <ExpandableRowContent
                        style={{ paddingTop: '0px', paddingLeft: '64px' }}
                      >
                        <NestedHashTable hashes={image.hashes} />
                      </ExpandableRowContent>
                    </Td>
                  </Tr>
                ) : null}
              </>
            ))}
          </Tbody>
        </Table>
      ) : (
        <SkeletonTable
          columns={imageTableColumns.map(({ title }) => title)}
          rows={15}
          variant={'compact'}
        />
      )}
    </>
  );
};

BifrostTable.propTypes = {
  bootcImages: propTypes.array,
  loaded: propTypes.bool,
};

export default BifrostTable;
