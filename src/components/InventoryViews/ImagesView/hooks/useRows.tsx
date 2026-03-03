import { useMemo, useState } from 'react';
import type { HostQueryOutput } from '@redhat-cloud-services/host-inventory-client';
import { getImageSummary, type Image } from '../utils/getImageSummary';
import type { BootcSystem } from './useImageQueries';
import { ExpandableRowContent } from '@patternfly/react-table';
import React from 'react';
import NestedHashTable from '../../../../routes/InventoryComponents/NestedHashTable';
import type { DataViewTr } from '@patternfly/react-data-view';
import { EMPTY_CELL } from '../../../../constants';

interface UseRowsParams {
  bootcSystems?: BootcSystem[];
  packageBasedData?: HostQueryOutput;
  edgeData?: HostQueryOutput;
  columnNames: string[];
}

export const useRows = ({
  bootcSystems,
  packageBasedData,
  edgeData,
  columnNames,
}: UseRowsParams): DataViewTr[] => {
  const [expandedImageNames, setExpandedImageNames] = useState<string[]>([]);

  const setImageExpanded = (image: Image, isExpanding = true) =>
    setExpandedImageNames((prevExpanded) => {
      const otherExpandedImageNames = prevExpanded.filter(
        (r) => r !== image.image,
      );
      return isExpanding
        ? [...otherExpandedImageNames, image.image]
        : otherExpandedImageNames;
    });
  const isImageExpanded = (image: Image) =>
    expandedImageNames.includes(image.image);

  const hasAllData = !!bootcSystems && !!packageBasedData && !!edgeData;

  const imageSummary = useMemo(
    () => (bootcSystems ? getImageSummary(bootcSystems) : []),
    [bootcSystems],
  );

  if (hasAllData) {
    const expandableRows = [
      ...imageSummary.map((image, rowIndex) => {
        return [
          {
            row: [
              {
                cell: EMPTY_CELL,
                props: image.hashes
                  ? {
                      expand: {
                        rowIndex,
                        isExpanded: isImageExpanded(image),
                        onToggle: () =>
                          setImageExpanded(image, !isImageExpanded(image)),
                      },
                    }
                  : {},
              },
              image.image,
              image.hashCommitCount,
              {
                cell: image.systemCount,
                props: {
                  className: 'pf-v6-u-text-align-end',
                },
              },
            ],
          },
          image.hashes
            ? {
                row: [
                  EMPTY_CELL,
                  {
                    cell: (
                      <ExpandableRowContent>
                        <NestedHashTable hashes={Object.values(image.hashes)} />
                      </ExpandableRowContent>
                    ),
                    props: {
                      colspan: columnNames.length - 1,
                      noPadding: true,
                      className: 'pf-v6-u-pl-lg pf-v6-u-pb-lg',
                    },
                  },
                ],
                props: {
                  isExpanded: isImageExpanded(image),
                },
              }
            : [null],
        ];
      }),
    ].flat();

    const rows = [
      ...expandableRows,
      {
        row: [
          EMPTY_CELL,
          'Package based systems',
          EMPTY_CELL,
          {
            cell: packageBasedData.total,
            props: {
              className: 'pf-v6-u-text-align-end',
            },
          },
        ],
      },
      {
        row: [
          EMPTY_CELL,
          'Immutable (OSTree) image based systems',
          EMPTY_CELL,
          {
            cell: edgeData.total,
            props: {
              className: 'pf-v6-u-text-align-end',
            },
          },
        ],
      },
    ];

    return rows;
  } else {
    return [];
  }
};

export default useRows;
