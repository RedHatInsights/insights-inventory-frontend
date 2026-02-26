import { useMemo } from 'react';
import { DataViewTrTree } from '@patternfly/react-data-view';
import type { HostQueryOutput } from '@redhat-cloud-services/host-inventory-client';
import { getImageSummary } from '../utils/getImageSummary';
import type { BootcSystem } from './useImageQueries';

interface UseRowsParams {
  bootcSystems?: BootcSystem[];
  packageBasedData?: HostQueryOutput;
  edgeData?: HostQueryOutput;
}

export const useRows = ({
  bootcSystems,
  packageBasedData,
  edgeData,
}: UseRowsParams): DataViewTrTree[] => {
  const hasAllData = !!bootcSystems && !!packageBasedData && !!edgeData;

  const imageSummary = useMemo(
    () => (bootcSystems ? getImageSummary(bootcSystems) : []),
    [bootcSystems],
  );

  if (hasAllData) {
    const imageRows = [
      ...imageSummary.map((imageItem) => {
        const hashItems = [
          ...Object.values(imageItem.hashes).map((hashItem) => {
            return {
              id: hashItem.image_digest,
              row: [hashItem.image_digest, '', hashItem.hashSystemCount],
            };
          }),
        ];

        return {
          id: imageItem.image,
          row: [
            imageItem.image,
            imageItem.hashCommitCount,
            imageItem.systemCount,
          ],
          children: hashItems,
        };
      }),
    ];

    const rows = [
      ...imageRows,
      {
        id: 'package-based',
        row: ['Package based systems', '', packageBasedData.total],
      },
      {
        id: 'edge',
        row: ['Immutable (OSTree) image based systems', '', edgeData.total],
      },
    ];
    return rows;
  } else {
    return [];
  }
};

export default useRows;
