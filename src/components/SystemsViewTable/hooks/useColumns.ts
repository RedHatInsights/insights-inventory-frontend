import { DataViewTh, useDataViewSort } from '@patternfly/react-data-view';
import { ApiHostGetHostListOrderByEnum as ApiOrderByEnum } from '@redhat-cloud-services/host-inventory-client/ApiHostGetHostList';
import { useMemo } from 'react';

type ColumnLabel = 'Name' | 'Workspace' | 'Tags' | 'OS' | 'Last Seen';

interface Column {
  label: ColumnLabel;
  sortBy?: ApiOrderByEnum;
}

const COLUMNS: Column[] = [
  { label: 'Name', sortBy: ApiOrderByEnum.DisplayName },
  { label: 'Workspace', sortBy: ApiOrderByEnum.GroupName },
  { label: 'Tags' },
  { label: 'OS', sortBy: ApiOrderByEnum.OperatingSystem },
  { label: 'Last Seen', sortBy: ApiOrderByEnum.LastCheckIn },
];

const fromSortByToIndex = (sortBy?: ApiOrderByEnum) =>
  COLUMNS.findIndex((col) => col.sortBy === sortBy);

export const useColumns = () => {
  const sort = useDataViewSort({
    initialSort: {
      direction: 'desc',
      sortBy: ApiOrderByEnum.LastCheckIn,
    },
    defaultDirection: 'asc',
  });

  const sortBy = sort?.sortBy as ApiOrderByEnum | undefined;
  const { direction, onSort } = sort;

  const columns: DataViewTh[] = useMemo(
    () =>
      COLUMNS.map((col, index) => {
        return {
          cell: col.label,
          props: {
            ...(col.sortBy && {
              sort: {
                sortBy: { index: fromSortByToIndex(sortBy), direction },
                onSort: (_, __, newDirection) => {
                  onSort(undefined, COLUMNS[index].sortBy!, newDirection);
                },
                columnIndex: index,
              },
            }),
          },
        };
      }),
    [sortBy, direction, onSort],
  );

  return { columns, sortBy, direction };
};
